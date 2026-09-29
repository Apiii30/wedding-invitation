"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminEmail, requireAdmin } from "@/lib/auth";
import { normalizePhone } from "@/lib/invite";
import { isDemoMode, store } from "@/lib/store";
import { createAuthClient } from "@/lib/supabase/server";
import type { NewGuest } from "@/lib/types";

export type FormState = { error?: string; ok?: string };

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  if (isDemoMode) redirect("/admin");
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!isAdminEmail(email)) return { error: "Email atau password salah." };

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email atau password salah." };
  redirect("/admin");
}

export async function logout() {
  if (!isDemoMode) {
    const supabase = await createAuthClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

/**
 * Satu tamu per baris: Nama | Kategori | Jatah | No HP
 * Kolom selain nama boleh dikosongkan. Bisa juga tempel langsung dari Excel (dipisah tab).
 */
export async function addGuests(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const lines = String(form.get("guests") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { error: "Isi minimal satu nama tamu." };
  if (lines.length > 500) return { error: "Maksimal 500 tamu sekali tambah." };

  const guests: NewGuest[] = lines.map((line) => {
    const [name, category, maxPax, phone] = line.split(/\t|\|/).map((s) => s.trim());
    const pax = Number.parseInt(maxPax ?? "", 10);
    return {
      name: name.slice(0, 120),
      category: category?.slice(0, 60) || null,
      maxPax: Number.isFinite(pax) ? Math.min(Math.max(pax, 1), 20) : 2,
      phone: normalizePhone(phone)?.slice(0, 30) ?? null,
    };
  });
  const count = await store.createGuests(guests.filter((g) => g.name));
  revalidatePath("/admin");
  return { ok: `${count} tamu ditambahkan.` };
}

export async function deleteGuest(id: number) {
  await requireAdmin();
  await store.deleteGuest(id);
  revalidatePath("/admin");
}

export async function setWishVisibility(id: number, visible: boolean) {
  await requireAdmin();
  await store.setRsvpVisibility(id, visible);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteRsvp(id: number) {
  await requireAdmin();
  await store.deleteRsvp(id);
  revalidatePath("/admin");
  revalidatePath("/");
}
