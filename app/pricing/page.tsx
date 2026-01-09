import type { Metadata } from "next"
import PricingPageClient, { type PricingProductIds } from "@/components/PricingPageClient"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Pricing | Nano Banana",
  description:
    "Choose a Nano Banana plan that fits your workflow. Flexible subscriptions, team plans, and credit packs.",
}

export default async function PricingPage() {
  let userEmail: string | null = null

  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    userEmail = user?.email ?? null
  } catch {
    userEmail = null
  }

  const productIds: PricingProductIds = {
    subscriptions: {
      basicMonthly: process.env.CREEM_BASIC_MONTHLY_PRODUCT_ID,
      basicYearly: process.env.CREEM_BASIC_YEARLY_PRODUCT_ID,
      proMonthly: process.env.CREEM_PRO_MONTHLY_PRODUCT_ID,
      proYearly: process.env.CREEM_PRO_YEARLY_PRODUCT_ID,
      maxMonthly: process.env.CREEM_MAX_MONTHLY_PRODUCT_ID,
      maxYearly: process.env.CREEM_MAX_YEARLY_PRODUCT_ID,
    },
    team: {
      teamMonthly: process.env.CREEM_TEAM_MONTHLY_PRODUCT_ID,
      teamYearly: process.env.CREEM_TEAM_YEARLY_PRODUCT_ID,
    },
    credits: {
      starterPack: process.env.CREEM_CREDITS_STARTER_PRODUCT_ID,
      creatorPack: process.env.CREEM_CREDITS_CREATOR_PRODUCT_ID,
      studioPack: process.env.CREEM_CREDITS_STUDIO_PRODUCT_ID,
    },
  }

  return <PricingPageClient productIds={productIds} userEmail={userEmail} />
}
