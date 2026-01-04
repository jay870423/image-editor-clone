import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function safeNext(next: string | undefined) {
  if (!next) return "/"
  if (!next.startsWith("/")) return "/"
  if (next.startsWith("//")) return "/"
  return next
}

function firstParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key]
  return Array.isArray(value) ? value[0] : value
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const next = safeNext(firstParam(params, "next"))
  const error = firstParam(params, "error")

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect(next)

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with Google to use the editor.
          </p>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="mt-6 space-y-3">
          <form action="/auth/sign-in" method="post">
            <input type="hidden" name="next" value={next} />
            <input type="hidden" name="provider" value="google" />
            <Button type="submit" className="w-full">
              Continue with Google
            </Button>
          </form>

          <form action="/auth/sign-in" method="post">
            <input type="hidden" name="next" value={next} />
            <input type="hidden" name="provider" value="github" />
            <Button type="submit" variant="secondary" className="w-full">
              Continue with GitHub
            </Button>
          </form>
        </div>
      </Card>
    </main>
  )
}
