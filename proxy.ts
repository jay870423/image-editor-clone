import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseEnv } from "@/lib/supabase/env"

const PUBLIC_PATHS = new Set([
  "/login",
  "/auth/callback",
  "/auth/sign-in",
  "/auth/sign-out",
])

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true
  if (pathname.startsWith("/api")) return true
  if (pathname.startsWith("/_next")) return true
  if (pathname === "/favicon.ico") return true
  if (pathname.startsWith("/icon")) return true
  if (pathname.startsWith("/apple-icon")) return true
  return false
}

function copyCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie)
  }
  return to
}

function parseNextParam(nextParam: string | null, baseUrl: string) {
  if (!nextParam) return { pathname: "/", search: "" }
  if (!nextParam.startsWith("/")) return { pathname: "/", search: "" }
  if (nextParam.startsWith("//")) return { pathname: "/", search: "" }

  const nextUrl = new URL(nextParam, baseUrl)
  return { pathname: nextUrl.pathname, search: nextUrl.search }
}

export async function proxy(request: NextRequest) {
  const { url, anonKey } = getSupabaseEnv()

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl
  const next = `${pathname}${search}`

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("next", next)
    return copyCookies(response, NextResponse.redirect(loginUrl))
  }

  if (user && pathname === "/login") {
    const redirectUrl = request.nextUrl.clone()
    const nextParam = parseNextParam(
      request.nextUrl.searchParams.get("next"),
      request.url,
    )
    redirectUrl.pathname = nextParam.pathname
    redirectUrl.search = nextParam.search
    return copyCookies(response, NextResponse.redirect(redirectUrl))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
