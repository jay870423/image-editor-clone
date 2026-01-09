import { Webhook } from "@creem_io/nextjs"

export const POST = async (request: Request) => {
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET

  if (!webhookSecret) {
    return new Response("Missing CREEM_WEBHOOK_SECRET", { status: 500 })
  }

  const handler = Webhook({
    webhookSecret,
    onCheckoutCompleted: async ({ customer, product, metadata }) => {
      console.log("creem.checkout.completed", {
        customerId: customer?.id,
        productId: product?.id,
        metadata,
      })
    },
    onGrantAccess: async ({ reason, customer, metadata }) => {
      console.log("creem.access.granted", {
        reason,
        customerId: customer?.id,
        metadata,
      })
    },
    onRevokeAccess: async ({ reason, customer, metadata }) => {
      console.log("creem.access.revoked", {
        reason,
        customerId: customer?.id,
        metadata,
      })
    },
  })

  return handler(request)
}
