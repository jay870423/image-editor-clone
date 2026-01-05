import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  getDailyGenerationLimit,
  parseTzOffsetMinutes,
  getUserDailyWindow,
} from "@/lib/generation-limit"

export const runtime = "nodejs"

type OpenRouterImage = {
  type?: string
  image_url?: { url?: string }
  imageUrl?: { url?: string }
}

type OpenRouterChatCompletion = {
  choices?: Array<{
    message?: {
      content?:
        | string
        | Array<{
            type?: string
            text?: string
            image_url?: { url?: string }
            image?: { url?: string; data?: string; mime_type?: string }
          }>
      images?: OpenRouterImage[]
    }
  }>
  error?: { message?: string }
}

function extractImagesFromMessage(
  message: OpenRouterChatCompletion["choices"][number]["message"] | undefined,
): string[] {
  const urls: string[] = []

  const images = message?.images ?? []
  for (const image of images) {
    const url = image?.image_url?.url ?? image?.imageUrl?.url
    if (url) urls.push(url)
  }

  urls.push(...extractImagesFromContent(message?.content))
  return Array.from(new Set(urls))
}

function extractImagesFromContent(
  content:
    | OpenRouterChatCompletion["choices"][number]["message"]["content"]
    | undefined,
): string[] {
  if (!content) return []

  if (typeof content === "string") {
    const markdownImageMatches = content.match(/!\[[^\]]*]\((data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)\)/g) ?? []
    const markdownUrls = markdownImageMatches
      .map((m) => m.match(/\(([^)]+)\)/)?.[1])
      .filter((u): u is string => Boolean(u))

    const matches = content.match(/data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+/g) ?? []
    return Array.from(new Set([...markdownUrls, ...matches]))
  }

  const urls = content
    .map((part) => {
      if (!part || typeof part !== "object") return null
      if (part.type === "image_url") {
        const raw = (part as any).image_url
        if (typeof raw === "string") return raw
        return part.image_url?.url ?? null
      }
      if (part.type === "image") {
        const raw = (part as any).image_url
        if (typeof raw === "string") return raw
        if (raw?.url) return raw.url
        if (part.image?.url) return part.image.url
        if (part.image?.data) {
          const mime = part.image.mime_type || "image/png"
          return `data:${mime};base64,${part.image.data}`
        }
      }
      return null
    })
    .filter((url): url is string => Boolean(url))

  return Array.from(new Set(urls))
}

function extractTextFromContent(
  content:
    | OpenRouterChatCompletion["choices"][number]["message"]["content"]
    | undefined,
): string {
  if (!content) return ""
  if (typeof content === "string") return content
  return content
    .map((part) => (part?.type === "text" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json(
      { error: `Supabase auth error: ${userError?.message || "Unauthorized"}` },
      { status: 401 },
    )
  }

  const limit = getDailyGenerationLimit()
  const loginAt = user.last_sign_in_at ?? null
  const tzOffsetMinutes = parseTzOffsetMinutes(
    request.headers.get("x-tz-offset-minutes"),
  )
  const { day, resetsAt, tzOffsetMinutes: usedTzOffsetMinutes } =
    getUserDailyWindow(new Date(), tzOffsetMinutes)

  const { data: usageRow, error: usageReadError } = await supabase
    .from("generation_usage")
    .select("count")
    .eq("user_id", user.id)
    .eq("day", day)
    .maybeSingle()

  if (usageReadError) {
    return NextResponse.json(
      {
        error:
          "Missing database table for usage tracking (expected: generation_usage).",
        details: usageReadError.message,
      },
      { status: 500 },
    )
  }

  const used = usageRow?.count ?? 0
  if (used >= limit) {
    return NextResponse.json(
      {
        error: `Daily limit reached (${limit} / day).`,
        limit,
        used,
        remaining: 0,
        day,
        resetsAt,
        tzOffsetMinutes: usedTzOffsetMinutes,
        loginAt,
      },
      { status: 429 },
    )
  }

  const { error: usageWriteError } = usageRow
    ? await supabase
        .from("generation_usage")
        .update({ count: used + 1 })
        .eq("user_id", user.id)
        .eq("day", day)
    : await supabase
        .from("generation_usage")
        .insert({ user_id: user.id, day, count: 1 })

  if (usageWriteError) {
    return NextResponse.json(
      { error: "Failed to update daily usage counter.", details: usageWriteError.message },
      { status: 500 },
    )
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENROUTER_API_KEY" }, { status: 500 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const prompt = String(formData.get("prompt") ?? "").trim()
  const image = formData.get("image")

  if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
  if (!(image instanceof Blob)) {
    return NextResponse.json({ error: "Image is required" }, { status: 400 })
  }

  const imageType = image.type || "image/png"
  const bytes = await image.arrayBuffer()
  const base64 = Buffer.from(bytes).toString("base64")
  const imageDataUrl = `data:${imageType};base64,${base64}`

  const origin = request.headers.get("origin") || "http://localhost:3000"

  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": origin,
      "X-Title": "Nano Banana",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      modalities: ["image", "text"],
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
    }),
  })

  const data = (await upstream.json().catch(() => null)) as OpenRouterChatCompletion | null
  if (!upstream.ok) {
    const message = data?.error?.message || `Upstream error (${upstream.status})`
    return NextResponse.json(
      {
        error: `OpenRouter error (${upstream.status}): ${message}`,
        upstreamStatus: upstream.status,
      },
      { status: 502 },
    )
  }
  if (!data) return NextResponse.json({ error: "Invalid upstream response" }, { status: 502 })
  if (data.error?.message) {
    return NextResponse.json(
      { error: `OpenRouter error: ${data.error.message}` },
      { status: 502 },
    )
  }

  const message = data.choices?.[0]?.message
  if (!message) {
    return NextResponse.json({ error: "No completion message returned by upstream" }, { status: 502 })
  }

  const images = extractImagesFromMessage(message)
  const text = extractTextFromContent(message?.content)

  if (!images.length && !text) {
    return NextResponse.json({ error: "Upstream returned no output" }, { status: 502 })
  }

  return NextResponse.json({
    images,
    text,
    usage: {
      limit,
      used: used + 1,
      remaining: Math.max(0, limit - (used + 1)),
      day,
      resetsAt,
      tzOffsetMinutes: usedTzOffsetMinutes,
      loginAt,
    },
  })
}
