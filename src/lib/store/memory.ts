import { uniqueSlug } from "@/lib/slug";
import type { Guest, Rsvp } from "@/lib/types";
import type { Store } from "./types";

// Mode demo: data disimpan di memori server dan hilang saat server restart.
// Dipakai otomatis selama Supabase belum dikonfigurasi. Isinya sama dengan supabase/seed.sql.

type Db = { guests: Guest[]; rsvps: Rsvp[]; nextId: number };

function seed(): Db {
  const now = new Date().toISOString();
  const rows: [string, string, string, number, string | null][] = [
    ["budi-santoso", "Bapak Budi Santoso & Keluarga", "Keluarga", 4, "6281200000001"],
    ["siti-rahmawati", "Ibu Siti Rahmawati", "Keluarga", 2, null],
    ["dimas-pratama", "Dimas Pratama", "Teman Kuliah", 2, "6281200000003"],
    ["nabila-putri", "Nabila Putri", "Teman Kuliah", 1, null],
    ["rizky-maulana", "Rizky Maulana & Partner", "Teman Kantor", 2, "6281200000005"],
    ["ayu-lestari", "Ayu Lestari", "Teman Kantor", 1, null],
    ["h-ujang-sutisna", "H. Ujang Sutisna", "Tetangga", 3, null],
    ["euis-kurniasih", "Euis Kurniasih", "Tetangga", 2, null],
  ];
  const guests = rows.map(([slug, name, category, maxPax, phone], i) => ({
    id: i + 1, slug, name, category, maxPax, phone, createdAt: now,
  }));
  const rsvps: Rsvp[] = [
    {
      id: 1, guestId: 3, name: "Dimas Pratama", attendance: "hadir", pax: 2,
      message: "Barakallahu lakuma wa baraka alaikuma wa jamaa bainakuma fii khair. Wilujeng nya!",
      isVisible: true, createdAt: now, updatedAt: now,
    },
    {
      id: 2, guestId: 6, name: "Ayu Lestari", attendance: "tidak_hadir", pax: 0,
      message: "Mohon maaf belum bisa hadir, semoga lancar sampai hari H dan menjadi keluarga sakinah mawaddah warahmah.",
      isVisible: true, createdAt: now, updatedAt: now,
    },
  ];
  return { guests, rsvps, nextId: 100 };
}

const g = globalThis as unknown as { __weddingDemoDb?: Db };
const db = (g.__weddingDemoDb ??= seed());

const byNewest = (a: { createdAt: string }, b: { createdAt: string }) => b.createdAt.localeCompare(a.createdAt);

export const memoryStore: Store = {
  async findGuestBySlug(slug) {
    return db.guests.find((x) => x.slug === slug) ?? null;
  },
  async getRsvpByGuestId(guestId) {
    return db.rsvps.find((r) => r.guestId === guestId) ?? null;
  },
  async upsertGuestRsvp(guestId, input) {
    const now = new Date().toISOString();
    const existing = db.rsvps.find((r) => r.guestId === guestId);
    if (existing) Object.assign(existing, input, { updatedAt: now });
    else db.rsvps.push({ id: db.nextId++, guestId, ...input, isVisible: true, createdAt: now, updatedAt: now });
  },
  async insertPublicRsvp(input) {
    const now = new Date().toISOString();
    db.rsvps.push({ id: db.nextId++, guestId: null, ...input, isVisible: true, createdAt: now, updatedAt: now });
  },
  async listWishes(limit) {
    return db.rsvps
      .filter((r) => r.message && r.isVisible)
      .sort(byNewest)
      .slice(0, limit)
      .map(({ id, name, attendance, message, createdAt }) => ({ id, name, attendance, message, createdAt }));
  },
  async listGuests() {
    return [...db.guests].sort(byNewest);
  },
  async createGuests(list) {
    const taken = new Set(db.guests.map((x) => x.slug));
    const now = new Date().toISOString();
    for (const guest of list) {
      db.guests.push({ id: db.nextId++, slug: uniqueSlug(guest.name, taken), ...guest, createdAt: now });
    }
    return list.length;
  },
  async deleteGuest(id) {
    db.guests = db.guests.filter((x) => x.id !== id);
    db.rsvps = db.rsvps.filter((r) => r.guestId !== id);
  },
  async listRsvps() {
    return [...db.rsvps].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async setRsvpVisibility(id, visible) {
    const r = db.rsvps.find((x) => x.id === id);
    if (r) r.isVisible = visible;
  },
  async deleteRsvp(id) {
    db.rsvps = db.rsvps.filter((r) => r.id !== id);
  },
};
