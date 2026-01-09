import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type SuccessPageProps = {
  searchParams?: Record<string, string | string[] | undefined>
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  const entries = Object.entries(searchParams ?? {}).filter(([, value]) => value)

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full p-8">
        <div className="text-center space-y-4">
          <div className="text-5xl">??</div>
          <h1 className="text-3xl font-bold">Payment successful</h1>
          <p className="text-muted-foreground">
            Thanks for subscribing to Nano Banana. Your credits will be available shortly.
          </p>
        </div>

        {entries.length ? (
          <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <p className="font-semibold mb-2">Receipt details</p>
            <dl className="space-y-2">
              {entries.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">{key}</dt>
                  <dd className="font-medium text-right">
                    {Array.isArray(value) ? value.join(", ") : value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">Go to editor</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/pricing">Back to pricing</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
