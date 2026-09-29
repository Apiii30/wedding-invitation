import Link from "next/link";
import { Download, LogOut } from "lucide-react";
import { wedding } from "@/data/wedding";
import { requireAdmin } from "@/lib/auth";
import { formatShortDateTime } from "@/lib/format";
import { inviteLink, siteOrigin, whatsappLink } from "@/lib/invite";
import { isDemoMode, store } from "@/lib/store";
import { AttendanceBadge } from "@/components/attendance-badge";
import { logout } from "./actions";
import { AddGuestForm, GuestTable, PublicLinkTool, WishActions, type GuestRow } from "./ui";

export const metadata = { title: "Dashboard Undangan" };

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function AdminPage({ searchParams }: Props) {
  const admin = await requireAdmin();
  const tab = (await searchParams).tab === "rsvp" ? "rsvp" : "tamu";
  const [guests, rsvps, origin] = await Promise.all([store.listGuests(), store.listRsvps(), siteOrigin()]);

  const rsvpByGuest = new Map(rsvps.filter((r) => r.guestId !== null).map((r) => [r.guestId, r]));
  const count = (a: string) => rsvps.filter((r) => r.attendance === a).length;
  const stats = [
    { label: "Tamu terdaftar", value: guests.length },
    { label: "Belum menjawab", value: guests.filter((g) => !rsvpByGuest.has(g.id)).length },
    { label: "Hadir", value: count("hadir") },
    { label: "Estimasi orang", value: rsvps.reduce((n, r) => n + (r.attendance === "hadir" ? r.pax : 0), 0) },
    { label: "Tidak hadir", value: count("tidak_hadir") },
    { label: "RSVP tamu umum", value: rsvps.filter((r) => r.guestId === null).length },
  ];

  const rows: GuestRow[] = guests.map((g) => {
    const link = inviteLink(origin, g.slug);
    const r = rsvpByGuest.get(g.id);
    return {
      id: g.id,
      name: g.name,
      category: g.category,
      maxPax: g.maxPax,
      phone: g.phone,
      link,
      waLink: whatsappLink(g.name, link, g.phone),
      attendance: r?.attendance ?? null,
      pax: r?.attendance === "hadir" ? r.pax : null,
    };
  });

  const tabClass = (t: string) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${tab === t ? "bg-plum text-cream" : "text-plum hover:bg-blush"}`;

  return (
    <div className="min-h-dvh bg-cream">
      <header className="border-b border-petal bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="font-script text-3xl text-plum">
              {wedding.bride.nickname} & {wedding.groom.nickname}
            </h1>
            <p className="text-xs text-mauve">Dashboard undangan · {admin.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/admin/export" className="inline-flex items-center gap-1.5 rounded-full border border-petal px-3 py-2 text-xs text-plum hover:bg-blush">
              <Download className="size-4" /> Export CSV
            </a>
            <form action={logout}>
              <button className="inline-flex items-center gap-1.5 rounded-full border border-petal px-3 py-2 text-xs text-plum hover:bg-blush">
                <LogOut className="size-4" /> Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {isDemoMode && (
          <p className="rounded-2xl border border-gold/40 bg-gold-soft/30 p-4 text-sm text-ink">
            <b>Mode demo:</b> Supabase belum dikonfigurasi. Data tersimpan sementara di memori dan akan hilang saat server
            dimatikan. Lihat README untuk menghubungkan Supabase.
          </p>
        )}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="font-serif text-3xl font-semibold text-plum">{s.value}</p>
              <p className="text-xs text-mauve">{s.label}</p>
            </div>
          ))}
        </section>

        <nav className="flex gap-2">
          <Link href="/admin" className={tabClass("tamu")}>Daftar Tamu</Link>
          <Link href="/admin?tab=rsvp" className={tabClass("rsvp")}>RSVP & Ucapan ({rsvps.length})</Link>
        </nav>

        {tab === "tamu" ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <GuestTable rows={rows} />
            <div className="space-y-6">
              <AddGuestForm />
              <PublicLinkTool origin={origin} />
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {rsvps.length === 0 && <li className="rounded-2xl bg-white p-6 text-center text-sm text-mauve">Belum ada RSVP.</li>}
            {rsvps.map((r) => (
              <li key={r.id} className={`rounded-2xl bg-white p-4 shadow-sm ${r.isVisible ? "" : "opacity-60"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-plum">{r.name}</p>
                    <AttendanceBadge attendance={r.attendance} pax={r.pax} />
                    {r.guestId === null && <span className="rounded-full bg-petal px-2 py-0.5 text-[11px] text-plum">Tamu umum</span>}
                    {!r.isVisible && <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[11px]">Disembunyikan</span>}
                  </div>
                  <WishActions id={r.id} visible={r.isVisible} hasMessage={!!r.message} />
                </div>
                {r.message && <p className="mt-2 whitespace-pre-line text-sm">{r.message}</p>}
                <p className="mt-2 text-[11px] text-mauve">{formatShortDateTime(r.updatedAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
