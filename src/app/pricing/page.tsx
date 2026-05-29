import type { Metadata } from "next";
import PricingPageClient from "./PricingPageClient";

export const metadata: Metadata = {
  title: "Pricing — SEOForge",
  description:
    "Start with a 3-day trial for $4.99. Creator, Operator, and Agency plans for solo operators, portfolios, and agencies. Cancel anytime.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
