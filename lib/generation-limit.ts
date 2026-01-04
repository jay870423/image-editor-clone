export function getDailyGenerationLimit() {
  const raw = process.env.DAILY_GENERATION_LIMIT
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN

  if (Number.isFinite(parsed) && parsed > 0) return parsed
  return 3
}

export function getUtcDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function getUtcDayResetsAtIso(date = new Date()) {
  const nextDayMidnightUtc = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 0, 0, 0, 0),
  )
  return nextDayMidnightUtc.toISOString()
}

export function getUserDailyWindow(loginAtIso: string | null, now = new Date()) {
  if (!loginAtIso) {
    const day = getUtcDayKey(now)
    const resetsAt = getUtcDayResetsAtIso(now)
    return { day, resetsAt }
  }

  const loginAt = new Date(loginAtIso)
  if (Number.isNaN(loginAt.valueOf())) {
    const day = getUtcDayKey(now)
    const resetsAt = getUtcDayResetsAtIso(now)
    return { day, resetsAt }
  }

  const boundaryToday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      loginAt.getUTCHours(),
      loginAt.getUTCMinutes(),
      0,
      0,
    ),
  )

  const windowStart = now < boundaryToday
    ? new Date(boundaryToday.getTime() - 24 * 60 * 60 * 1000)
    : boundaryToday

  const windowEnd = new Date(windowStart.getTime() + 24 * 60 * 60 * 1000)
  return { day: getUtcDayKey(windowStart), resetsAt: windowEnd.toISOString() }
}
