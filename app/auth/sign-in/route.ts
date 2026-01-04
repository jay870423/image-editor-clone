import { NextResponse } from "next/server"
import { headers } from "next/headers"
import type { Provider } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase/server"

function safeNext(next: string) {
  if (!next.startsWith("/")) return "/"
  if (next.startsWith("//")) return "/"
  return next
}

function parseProvider(provider: string): Provider | null {
  if (provider === "google") return "google"
  if (provider === "github") return "github"
  return null
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null)
  const next = safeNext(String(formData?.get("next") ?? "/") || "/")
  const provider = parseProvider(String(formData?.get("provider") ?? "google"))

  const origin = (await headers()).get("origin") || "http://localhost:3000"
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`

  if (!provider) {
    const message = encodeURIComponent("Unsupported OAuth provider")
    return NextResponse.redirect(
      `${origin}/login?error=${message}&next=${encodeURIComponent(next)}`,
      { status: 303 },
    )
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  })

  if (error || !data?.url) {
    const message = encodeURIComponent(
      error?.message || "Unable to start OAuth sign-in",
    )
    return NextResponse.redirect(
      `${origin}/login?error=${message}&next=${encodeURIComponent(next)}`,
      { status: 303 },
    )
  }

  return NextResponse.redirect(data.url, { status: 303 })
}
