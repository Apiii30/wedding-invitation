import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isDemoMode } from "@/lib/store";
import { createAuthClient } from "@/lib/supabase/server";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email: string) => adminEmails.includes(email.trim().toLowerCase());

/** Mode demo hanya membuka dashboard tanpa login saat development. */
export const demoAdminAllowed = isDemoMode && process.env.NODE_ENV !== "production";

export async function getAdmin(): Promise<{ email: string } | null> {
  // Status login harus dicek per request, jangan pernah di-prerender saat build.
  await connection();
  if (isDemoMode) return demoAdminAllowed ? { email: "demo" } : null;
  const supabase = await createAuthClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email;
  return typeof email === "string" && isAdminEmail(email) ? { email } : null;
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
