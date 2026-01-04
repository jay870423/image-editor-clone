import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseEnv } from "@/lib/supabase/env"

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getSupabaseEnv()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        const anyCookieStore = cookieStore as any
        if (typeof anyCookieStore.getAll === "function") {
          return anyCookieStore.getAll()
        }

        const iterator = anyCookieStore?.[Symbol.iterator]
        if (typeof iterator === "function") {
          return Array.from(anyCookieStore, (entry: any) => entry?.[1]).filter(
            (c: any) => c && typeof c.name === "string" && typeof c.value === "string",
          )
        }

        return []
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // ignore if called from a Server Component where cookies are immutable
        }
      },
    },
  })
}
