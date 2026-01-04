import { redirect } from "next/navigation"
import HomePageClient from "@/components/HomePageClient"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return <HomePageClient userEmail={user.email ?? null} />
}
