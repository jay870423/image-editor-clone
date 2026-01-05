import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  getDailyGenerationLimit,
  parseTzOffsetMinutes,
  getUserDailyWindow,
} from "@/lib/generation-limit"

export const runtime = "nodejs"

export async function GET(request: Request) {
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

  const { data, error } = await supabase
    .from("generation_usage")
    .select("count")
    .eq("user_id", user.id)
    .eq("day", day)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      {
        error:
          "Missing database table for usage tracking (expected: generation_usage).",
        details: error.message,
      },
      { status: 500 },
    )
  }

  const used = data?.count ?? 0
  const remaining = Math.max(0, limit - used)

  return NextResponse.json({
    limit,
    used,
    remaining,
    day,
    resetsAt,
    tzOffsetMinutes: usedTzOffsetMinutes,
    loginAt,
  })
}
