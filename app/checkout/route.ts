import { Checkout } from "@creem_io/nextjs"

export const GET = async (request: Request) => {
  const apiKey = process.env.CREEM_API_KEY

  if (!apiKey) {
    return new Response("Missing CREEM_API_KEY", { status: 500 })
  }

  const handler = Checkout({
    apiKey,
    testMode: process.env.NODE_ENV !== "production",
    defaultSuccessUrl: "/success",
  })

  return handler(request)
}
