"use client"

import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { CreemCheckout } from "@creem_io/nextjs"
import { ArrowRight, Check, Sparkles, Star, Users, Zap } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type PricingProductIds = {
  subscriptions: {
    basicMonthly?: string
    basicYearly?: string
    proMonthly?: string
    proYearly?: string
    maxMonthly?: string
    maxYearly?: string
  }
  team: {
    teamMonthly?: string
    teamYearly?: string
  }
  credits: {
    starterPack?: string
    creatorPack?: string
    studioPack?: string
  }
}

type PricingPageClientProps = {
  productIds: PricingProductIds
  userEmail?: string | null
}

type BillingCycle = "monthly" | "yearly"

type PricingPlan = {
  id: "basic" | "pro" | "max"
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  yearlyOriginal: number
  creditsYear: number
  monthlyCredits: number
  features: string[]
  highlight?: string
  supportsQuantity?: boolean
}

type CreditPack = {
  id: "starter" | "creator" | "studio"
  name: string
  description: string
  credits: number
  price: number
  productId?: string
}

const subscriptionPlans: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for individuals and light users",
    monthlyPrice: 12,
    yearlyPrice: 144,
    yearlyOriginal: 180,
    creditsYear: 2400,
    monthlyCredits: 100,
    features: [
      "100 high-quality images/month",
      "All style templates included",
      "Standard generation speed",
      "Basic customer support",
      "JPG/PNG format downloads",
      "Commercial Use License",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professional creators and teams",
    monthlyPrice: 19.5,
    yearlyPrice: 234,
    yearlyOriginal: 468,
    creditsYear: 9600,
    monthlyCredits: 400,
    features: [
      "400 high-quality images/month",
      "Support Seedream-4 Model",
      "Support Nanobanana-Pro Model",
      "All style templates included",
      "Priority generation queue",
      "Priority customer support",
      "JPG/PNG/WebP format downloads",
      "Batch generation feature",
      "Image editing tools (Coming in October)",
      "Commercial Use License",
    ],
    highlight: "Most Popular",
    supportsQuantity: true,
  },
  {
    id: "max",
    name: "Max",
    description: "Designed for large enterprises and studios",
    monthlyPrice: 80,
    yearlyPrice: 960,
    yearlyOriginal: 1920,
    creditsYear: 43200,
    monthlyCredits: 1800,
    features: [
      "1800 high-quality images/month",
      "Support Seedream-4 Model",
      "Support Nanobanana-Pro Model",
      "All style templates included",
      "Fastest generation speed",
      "Dedicated account manager",
      "All format downloads",
      "Batch generation feature",
      "Professional editing suite (Coming in October)",
      "Commercial Use License",
    ],
    supportsQuantity: true,
  },
]

const creditPacks: CreditPack[] = [
  {
    id: "starter",
    name: "Starter Pack",
    description: "For quick experiments and one-off edits",
    credits: 300,
    price: 9,
  },
  {
    id: "creator",
    name: "Creator Pack",
    description: "Built for consistent weekly output",
    credits: 1500,
    price: 39,
  },
  {
    id: "studio",
    name: "Studio Pack",
    description: "Bulk credits for production teams",
    credits: 6000,
    price: 129,
  },
]

const currencyOptions = [
  { value: "USD", label: "$ USD - US Dollar" },
  { value: "EUR", label: "� EUR - Euro" },
  { value: "GBP", label: "�� GBP - British Pound" },
  { value: "CNY", label: "�� CNY - Chinese Yuan" },
  { value: "JPY", label: "�� JPY - Japanese Yen" },
]

function formatPrice(value: number) {
  return value.toFixed(2)
}

function PricingPageClient({ productIds, userEmail }: PricingPageClientProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly")
  const [currency, setCurrency] = useState("USD")
  const [quantityByPlan, setQuantityByPlan] = useState<Record<string, number>>({
    pro: 1,
    max: 1,
    team: 5,
  })

  const planProductIds = useMemo(() => {
    return {
      basic:
        billingCycle === "monthly"
          ? productIds.subscriptions.basicMonthly
          : productIds.subscriptions.basicYearly,
      pro:
        billingCycle === "monthly"
          ? productIds.subscriptions.proMonthly
          : productIds.subscriptions.proYearly,
      max:
        billingCycle === "monthly"
          ? productIds.subscriptions.maxMonthly
          : productIds.subscriptions.maxYearly,
    }
  }, [billingCycle, productIds])

  const metadataBase = useMemo(() => {
    return userEmail ? { userEmail } : undefined
  }, [userEmail])

  const discountNote = billingCycle === "yearly" ? "Save 50% for annual billing" : "Pay as you go"

  const handleQuantity = (planId: string, next: number) => {
    setQuantityByPlan((current) => ({
      ...current,
      [planId]: next,
    }))
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground py-3 text-center relative overflow-hidden">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">??</div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">?</div>
        <p className="text-sm font-medium">?? Limited Time: Save 20% with Annual Billing</p>
      </div>

      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <span>??</span>
            <span>Nano Banana</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/#generator" className="hover:text-foreground transition-colors">
              Image Editor
            </Link>
            <Link href="/#showcase" className="hover:text-foreground transition-colors">
              Showcase
            </Link>
            <Link href="/pricing" className="text-foreground">
              Pricing
            </Link>
            <Link href="/#features" className="hover:text-foreground transition-colors">
              Toolbox
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {userEmail ? (
              <span className="hidden sm:inline text-xs text-muted-foreground">{userEmail}</span>
            ) : null}
            <Button asChild>
              <Link href="/login" className="gap-2">
                Launch Now
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative">
        <div className="absolute -top-12 right-8 text-6xl opacity-10 rotate-12 pointer-events-none">??</div>
        <div className="absolute top-72 left-6 text-5xl opacity-10 -rotate-12 pointer-events-none">?</div>
        <div className="absolute bottom-40 right-10 text-5xl opacity-10 rotate-6 pointer-events-none">?</div>

        <section className="container mx-auto px-4 py-20 text-center">
          <Badge className="mb-6 gap-2 bg-accent text-accent-foreground">
            <Sparkles className="size-4" />
            Limited time annual discounts
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-balance">Choose Your Perfect Plan</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Unlimited creativity starts here. Flexible subscriptions, team-ready plans, and credit packs for every
            workflow.
          </p>

          <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="w-full md:w-auto flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2">
              <span className="text-sm font-medium">Select Currency</span>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-muted-foreground">
              Pricing displayed in USD. Other currencies available at checkout.
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <Tabs defaultValue="subscriptions" className="w-full">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                <TabsTrigger value="team">Team Plans</TabsTrigger>
                <TabsTrigger value="credits">Credit Packs</TabsTrigger>
              </TabsList>
              <div className="flex flex-wrap items-center gap-3">
                <span className={cn("text-sm", billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground")}>
                  Monthly
                </span>
                <Switch
                  checked={billingCycle === "yearly"}
                  onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
                />
                <span className={cn("text-sm", billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground")}>
                  Yearly
                </span>
                <Badge variant="outline" className="border-accent text-accent">
                  ?? LIMITED TIME: Save 50%
                </Badge>
              </div>
            </div>

            <TabsContent value="subscriptions" className="space-y-10">
              <div className="grid lg:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan) => {
                  const productId = planProductIds[plan.id]
                  const isYearly = billingCycle === "yearly"
                  const units = plan.supportsQuantity ? quantityByPlan[plan.id] ?? 1 : 1
                  const displayPrice = isYearly ? plan.yearlyPrice / 12 : plan.monthlyPrice
                  const priceLabel = isYearly ? "/mo billed yearly" : "/mo"

                  return (
                    <Card
                      key={plan.id}
                      className={cn(
                        "relative p-6 flex flex-col gap-6 border-2",
                        plan.highlight ? "border-primary shadow-lg" : "border-border",
                      )}
                    >
                      {plan.highlight ? (
                        <Badge className="absolute -top-4 left-6 bg-primary text-primary-foreground">
                          {plan.highlight}
                        </Badge>
                      ) : null}
                      <div>
                        <h3 className="text-2xl font-semibold">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                      </div>

                      {plan.supportsQuantity ? (
                        <div className="rounded-xl border border-border bg-muted/40 p-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span>Quantity Adjustment</span>
                            <span>Up to 60% bonus</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {[1, 10].map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => handleQuantity(plan.id, option)}
                                className={cn(
                                  "flex-1 rounded-full px-3 py-1 text-xs font-semibold transition",
                                  units === option
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background text-muted-foreground border border-border",
                                )}
                              >
                                {option}x
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">${formatPrice(displayPrice)}</span>
                        <span className="text-muted-foreground">{priceLabel}</span>
                      </div>

                      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground line-through">
                            ${formatPrice(plan.yearlyOriginal)}
                          </span>
                          <span className="font-semibold">${formatPrice(plan.yearlyPrice)}</span>
                          <Badge className="ml-auto bg-accent text-accent-foreground">? SAVE 50%</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{plan.creditsYear} credits/year</div>
                      </div>

                      <CheckoutButton
                        productId={productId}
                        units={units}
                        billingCycle={billingCycle}
                        planId={plan.id}
                        userEmail={userEmail}
                        metadata={metadataBase}
                      >
                        <Button size="lg" className="w-full">
                          Get started
                        </Button>
                      </CheckoutButton>

                      <div className="text-xs text-muted-foreground">{discountNote}</div>

                      <ul className="space-y-3 text-sm">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check className="size-4 text-primary mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )
                })}
              </div>

              <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-background to-accent/10 p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-semibold">Need custom usage?</h3>
                    <p className="text-muted-foreground mt-2">
                      We can tailor credit bundles, enterprise SLAs, and account management for your team.
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <a href="mailto:support@nanobanana.ai" className="gap-2">
                      Talk to sales
                      <ArrowRight className="size-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-10">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6 flex flex-col gap-6 border-2 border-primary/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold">Team Studio</h3>
                      <p className="text-sm text-muted-foreground mt-1">Scale creativity across your org</p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">Best value</Badge>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/40 p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>Seats</span>
                      <span>{quantityByPlan.team} seats</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={50}
                      value={quantityByPlan.team}
                      onChange={(event) => handleQuantity("team", Number(event.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold">$24.00</span>
                    <span className="text-muted-foreground">/seat/mo</span>
                  </div>

                  <CheckoutButton
                    productId={
                      billingCycle === "monthly"
                        ? productIds.team.teamMonthly
                        : productIds.team.teamYearly
                    }
                    units={quantityByPlan.team}
                    billingCycle={billingCycle}
                    planId="team"
                    userEmail={userEmail}
                    metadata={metadataBase}
                  >
                    <Button size="lg" className="w-full">
                      Start team plan
                    </Button>
                  </CheckoutButton>

                  <ul className="space-y-3 text-sm">
                    {[
                      "Shared workspace with approvals",
                      "Centralized asset library",
                      "Seat-based usage and analytics",
                      "Priority onboarding assistance",
                      "Monthly credit refills",
                      "Commercial Use License",
                    ].map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Users className="size-4 text-primary mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6 flex flex-col gap-6">
                  <div>
                    <h3 className="text-2xl font-semibold">Enterprise</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Dedicated infrastructure, custom billing, and security reviews.
                    </p>
                  </div>
                  <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                    <p>Custom pricing based on volume, security, and workflow requirements.</p>
                    <p className="mt-2">Includes SSO, audit logs, and priority support.</p>
                  </div>
                  <Button variant="outline" size="lg" asChild>
                    <a href="mailto:support@nanobanana.ai" className="gap-2">
                      Contact sales
                      <ArrowRight className="size-4" />
                    </a>
                  </Button>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="credits" className="space-y-10">
              <div className="grid lg:grid-cols-3 gap-6">
                {creditPacks.map((pack) => {
                  const productId =
                    pack.id === "starter"
                      ? productIds.credits.starterPack
                      : pack.id === "creator"
                        ? productIds.credits.creatorPack
                        : productIds.credits.studioPack

                  return (
                    <Card key={pack.id} className="p-6 flex flex-col gap-6">
                      <div>
                        <h3 className="text-2xl font-semibold">{pack.name}</h3>
                        <p className="text-sm text-muted-foreground mt-2">{pack.description}</p>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">${formatPrice(pack.price)}</span>
                        <span className="text-muted-foreground">one-time</span>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
                        <div className="font-semibold">{pack.credits} credits</div>
                        <div className="text-xs text-muted-foreground mt-1">Enough for {pack.credits / 2} images</div>
                      </div>
                      <CheckoutButton
                        productId={productId}
                        units={1}
                        billingCycle="one-time"
                        planId={pack.id}
                        userEmail={userEmail}
                        metadata={metadataBase}
                      >
                        <Button size="lg" className="w-full" variant="secondary">
                          Buy credits
                        </Button>
                      </CheckoutButton>
                      <ul className="space-y-3 text-sm">
                        {[
                          "Immediate credit delivery",
                          "No recurring charges",
                          "Use anytime within 12 months",
                        ].map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Zap className="size-4 text-accent mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Premium models",
                  description: "Unlock Nano Banana Pro + Seedream-4 with priority routing.",
                  icon: <Star className="size-5" />,
                },
                {
                  title: "Creative speed",
                  description: "Faster queues and batch generation for every plan.",
                  icon: <Zap className="size-5" />,
                },
                {
                  title: "Commercial license",
                  description: "Every tier ships with a commercial usage license.",
                  icon: <Sparkles className="size-5" />,
                },
              ].map((item) => (
                <Card key={item.title} className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
            <p className="text-muted-foreground mt-3">Everything you need to know about Nano Banana pricing</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  What are credits and how do they work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  2 credits generate 1 high-quality image. Credits refill at the start of each billing cycle �� monthly
                  for monthly plans, and all at once for yearly plans.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">Can I change my plan anytime?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Upgrades take effect immediately, while downgrades apply on the next billing cycle.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">Do unused credits roll over?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Monthly plan credits do not roll over. Yearly plan credits are valid for the entire subscription
                  period.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">What payment methods are supported?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We support credit cards, debit cards, and local payment methods like Alipay and WeChat Pay through our
                  secure payment partners.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Have more questions? We're here to help.</p>
            <Button variant="outline" asChild>
              <a href="mailto:support@nanobanana.ai">Contact Support</a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xl font-bold">
            <span>??</span>
            <span>Nano Banana</span>
          </div>
          <div className="text-sm text-muted-foreground">? 2026 Nano Banana. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

type CheckoutButtonProps = {
  productId?: string
  units?: number
  billingCycle: BillingCycle | "one-time"
  planId: string
  userEmail?: string | null
  metadata?: Record<string, string>
  children: ReactNode
}

function CheckoutButton({
  productId,
  units,
  billingCycle,
  planId,
  userEmail,
  metadata,
  children,
}: CheckoutButtonProps) {
  if (!productId) {
    return (
      <Button size="lg" className="w-full" disabled>
        Set product ID
      </Button>
    )
  }

  return (
    <CreemCheckout
      productId={productId}
      units={units}
      customer={userEmail ? { email: userEmail } : undefined}
      metadata={{
        ...metadata,
        planId,
        billingCycle,
      }}
      referenceId={userEmail ?? undefined}
    >
      {children}
    </CreemCheckout>
  )
}

export default PricingPageClient
