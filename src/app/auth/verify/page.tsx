import { redirect } from "next/navigation";
import { verifyMagicLinkAction } from "@/actions/auth";

export const dynamic = "force-dynamic";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string; next?: string }> }) {
  const sp = await searchParams;
  const token = sp.token;
  if (!token) redirect("/login?error=" + encodeURIComponent("Missing sign-in link."));
  await verifyMagicLinkAction(token);
}