export function getDailyGenerationLimit() {
  const raw = process.env.DAILY_GENERATION_LIMIT
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN

  if (Number.isFinite(parsed) && parsed > 0) return parsed
  return 3
}

export function parseTzOffsetMinutes(value: string | null | undefined) {
  if (!value) return null
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return null
  if (Math.abs(parsed) > 14 * 60) return null
  return parsed
}

export function getLocalDayKey(now = new Date(), tzOffsetMinutes: number) {
  const localMs = now.getTime() - tzOffsetMinutes * 60 * 1000
  return new Date(localMs).toISOString().slice(0, 10)
}

export function getLocalDayResetsAtIso(now = new Date(), tzOffsetMinutes: number) {
  const localMs = now.getTime() - tzOffsetMinutes * 60 * 1000
  const localNow = new Date(localMs)

  const nextLocalMidnightMs = Date.UTC(
    localNow.getUTCFullYear(),
    localNow.getUTCMonth(),
    localNow.getUTCDate() + 1,
    0,
    0,
    0,
    0,
  )

  const resetsAtUtcMs = nextLocalMidnightMs + tzOffsetMinutes * 60 * 1000
  return new Date(resetsAtUtcMs).toISOString()
}

export function getUserDailyWindow(now = new Date(), tzOffsetMinutes: number | null) {
  const safeOffset = typeof tzOffsetMinutes === "number" ? tzOffsetMinutes : 0
  const day = getLocalDayKey(now, safeOffset)
  const resetsAt = getLocalDayResetsAtIso(now, safeOffset)
  return { day, resetsAt, tzOffsetMinutes: safeOffset }
}
