import "server-only";
import { createClient } from "@supabase/supabase-js";
import { uniqueSlug } from "@/lib/slug";
import type { Attendance, Guest, Rsvp } from "@/lib/types";
import type { Store } from "./types";

// Memakai secret key (bypass RLS), jadi hanya boleh dipanggil dari server.
const db = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

type GuestRow = {
  id: number; slug: string; name: string; category: string | null;
  max_pax: number; phone: string | null; created_at: string;
};
type RsvpRow = {
  id: number; guest_id: number | null; name: string; attendance: Attendance; pax: number;
  message: string | null; is_visible: boolean; created_at: string; updated_at: string;
};

const toGuest = (r: GuestRow): Guest => ({
  id: r.id, slug: r.slug, name: r.name, category: r.category,
  maxPax: r.max_pax, phone: r.phone, createdAt: r.created_at,
});
const toRsvp = (r: RsvpRow): Rsvp => ({
  id: r.id, guestId: r.guest_id, name: r.name, attendance: r.attendance, pax: r.pax,
  message: r.message, isVisible: r.is_visible, createdAt: r.created_at, updatedAt: r.updated_at,
});

function check<T>({ data, error }: { data: T; error: { message: string } | null }): T {
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data;
}

export const supabaseStore: Store = {
  async findGuestBySlug(slug) {
    const row = check(await db().from("guests").select("*").eq("slug", slug).maybeSingle<GuestRow>());
    return row ? toGuest(row) : null;
  },
  async getRsvpByGuestId(guestId) {
    const row = check(await db().from("rsvps").select("*").eq("guest_id", guestId).maybeSingle<RsvpRow>());
    return row ? toRsvp(row) : null;
  },
  async upsertGuestRsvp(guestId, input) {
    check(
      await db()
        .from("rsvps")
        .upsert({ guest_id: guestId, ...input, updated_at: new Date().toISOString() }, { onConflict: "guest_id" }),
    );
  },
  async insertPublicRsvp(input) {
    check(await db().from("rsvps").insert(input));
  },
  async listWishes(limit) {
    const rows = check(
      await db()
        .from("rsvps")
        .select("id, name, attendance, message, created_at")
        .not("message", "is", null)
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(limit)
        .returns<Pick<RsvpRow, "id" | "name" | "attendance" | "message" | "created_at">[]>(),
    );
    return (rows ?? []).map((r) => ({ id: r.id, name: r.name, attendance: r.attendance, message: r.message, createdAt: r.created_at }));
  },
  async listGuests() {
    const rows = check(await db().from("guests").select("*").order("created_at", { ascending: false }).returns<GuestRow[]>());
    return (rows ?? []).map(toGuest);
  },
  async createGuests(list) {
    const client = db();
    const existing = check(await client.from("guests").select("slug").returns<{ slug: string }[]>());
    const taken = new Set((existing ?? []).map((r) => r.slug));
    const rows = list.map((guest) => ({
      slug: uniqueSlug(guest.name, taken),
      name: guest.name,
      category: guest.category,
      max_pax: guest.maxPax,
      phone: guest.phone,
    }));
    check(await client.from("guests").insert(rows));
    return rows.length;
  },
  async deleteGuest(id) {
    check(await db().from("guests").delete().eq("id", id));
  },
  async listRsvps() {
    const rows = check(await db().from("rsvps").select("*").order("updated_at", { ascending: false }).returns<RsvpRow[]>());
    return (rows ?? []).map(toRsvp);
  },
  async setRsvpVisibility(id, visible) {
    check(await db().from("rsvps").update({ is_visible: visible }).eq("id", id));
  },
  async deleteRsvp(id) {
    check(await db().from("rsvps").delete().eq("id", id));
  },
};
