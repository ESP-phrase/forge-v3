"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { runOneForSite } from "@/lib/runner";

export type RunRequest = {
  siteId: number;
  count: number;
  dryRun: boolean;
};

/**
 * Single-article server action. Caller (the dashboard form) loops on the
 * client side if count > 1. We keep one article per request to stay inside
 * the Vercel function timeout.
 */
export async function runSingleAction(siteId: number, dryRun: boolean) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const result = await runOneForSite(siteId, { dryRun });
  revalidatePath(`/sites/${siteId}`);
  revalidatePath("/");
  return result;
}
