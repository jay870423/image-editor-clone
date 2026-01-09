import { Webhook } from "@creem_io/nextjs"

const webhookSecret = process.env.CREEM_WEBHOOK_SECRET

if (!webhookSecret) {
  throw new Error("Missing CREEM_WEBHOOK_SECRET")
}

export const POST = Webhook({
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
