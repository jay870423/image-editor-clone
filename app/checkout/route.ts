import { Checkout } from "@creem_io/nextjs"

const apiKey = process.env.CREEM_API_KEY

if (!apiKey) {
  throw new Error("Missing CREEM_API_KEY")
}

export const GET = Checkout({
  apiKey,
  testMode: process.env.NODE_ENV !== "production",
  defaultSuccessUrl: "/success",
})
