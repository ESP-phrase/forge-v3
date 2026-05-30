import type { Metadata } from "next";
import PricingPageClient from "./PricingPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing — SEOForge",
  description:
    "Start with a 3-day trial for $1. Creator, Operator, and Agency plans. Cancel anytime.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
