import { getAdmin } from "@/lib/auth";
import { inviteLink, siteOrigin } from "@/lib/invite";
import { store } from "@/lib/store";
import { ATTENDANCE_LABEL } from "@/lib/types";

// Awalan ' mencegah isian tamu (mis. "=HYPERLINK(...)") dibaca Excel sebagai formula.
const cell = (v: string | number | null | undefined) => {
  const s = String(v ?? "");
  return `"${(/^[=+\-@\t\r]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export async function GET() {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });

  const [guests, rsvps, origin] = await Promise.all([store.listGuests(), store.listRsvps(), siteOrigin()]);
  const byGuest = new Map(rsvps.filter((r) => r.guestId !== null).map((r) => [r.guestId, r]));

  const header = ["Nama", "Kategori", "Jatah", "No HP", "Link", "Status", "Jumlah Hadir", "Ucapan", "Diperbarui"];
  const rows = [
    ...guests.map((g) => {
      const r = byGuest.get(g.id);
      return [g.name, g.category, g.maxPax, g.phone, inviteLink(origin, g.slug),
        r ? ATTENDANCE_LABEL[r.attendance] : "Belum menjawab", r?.pax, r?.message, r?.updatedAt];
    }),
    ...rsvps
      .filter((r) => r.guestId === null)
      .map((r) => [r.name, "Tamu umum", "", "", "", ATTENDANCE_LABEL[r.attendance], r.pax, r.message, r.updatedAt]),
  ];

  // BOM agar Excel membaca UTF-8 dengan benar.
  const csv = "﻿" + [header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rsvp-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
