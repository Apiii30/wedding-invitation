"use client";

import { Eye, EyeOff, ExternalLink, Loader2, MessageCircle, Search, Trash2 } from "lucide-react";
import { useActionState, useMemo, useState, useTransition } from "react";
import { AttendanceBadge } from "@/components/attendance-badge";
import { CopyButton } from "@/components/copy-button";
import type { Attendance } from "@/lib/types";
import { addGuests, deleteGuest, deleteRsvp, setWishVisibility } from "./actions";

export type GuestRow = {
  id: number;
  name: string;
  category: string | null;
  maxPax: number;
  phone: string | null;
  link: string;
  waLink: string;
  attendance: Attendance | null;
  pax: number | null;
};

const card = "rounded-2xl bg-white p-5 shadow-sm";
const input = "w-full rounded-xl border border-petal px-3 py-2 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/20";

export function GuestTable({ rows }: { rows: GuestRow[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const categories = useMemo(() => [...new Set(rows.map((r) => r.category).filter(Boolean))] as string[], [rows]);
  const filtered = rows.filter(
    (r) =>
      (!category || r.category === category) &&
      (!query || r.name.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className={card}>
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute top-2.5 left-3 size-4 text-mauve" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama tamu" className={`${input} pl-9`} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-petal px-3 py-2 text-sm outline-none focus:border-rose">
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs text-mauve">
            <tr className="border-b border-petal">
              <th className="py-2 pr-3 font-medium">Nama</th>
              <th className="py-2 pr-3 font-medium">Kategori</th>
              <th className="py-2 pr-3 font-medium">Jatah</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-petal/60 last:border-0">
                <td className="py-3 pr-3">
                  <p className="font-medium text-ink">{r.name}</p>
                  {r.phone && <p className="text-xs text-mauve">+{r.phone}</p>}
                </td>
                <td className="py-3 pr-3 text-mauve">{r.category ?? "-"}</td>
                <td className="py-3 pr-3">{r.maxPax}</td>
                <td className="py-3 pr-3">
                  {r.attendance ? (
                    <AttendanceBadge attendance={r.attendance} pax={r.pax ?? undefined} />
                  ) : (
                    <span className="text-xs text-mauve">Belum menjawab</span>
                  )}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1">
                    <a
                      href={r.waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white"
                    >
                      <MessageCircle className="size-3.5" /> WA
                    </a>
                    <CopyButton text={r.link} label="Link" className="rounded-full border border-petal px-3 py-1.5 text-xs text-plum hover:bg-blush" />
                    <a href={r.link} target="_blank" rel="noopener noreferrer" aria-label="Buka undangan" className="rounded-full p-1.5 text-mauve hover:bg-blush">
                      <ExternalLink className="size-4" />
                    </a>
                    <DeleteButton
                      confirmText={`Hapus tamu "${r.name}" beserta RSVP-nya?`}
                      onDelete={() => deleteGuest(r.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-mauve">Tidak ada tamu.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeleteButton({ confirmText, onDelete }: { confirmText: string; onDelete: () => Promise<void> }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-label="Hapus"
      disabled={pending}
      onClick={() => confirm(confirmText) && start(onDelete)}
      className="rounded-full p-1.5 text-red-700/70 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </button>
  );
}

export function AddGuestForm() {
  const [state, action, pending] = useActionState(addGuests, {});
  return (
    <form action={action} className={card}>
      <h2 className="font-serif text-xl font-semibold text-plum">Tambah Tamu</h2>
      <p className="mt-1 mb-3 text-xs leading-relaxed text-mauve">
        Satu tamu per baris: <code>Nama | Kategori | Jatah | No HP</code>. Selain nama boleh dikosongkan. Bisa juga
        tempel langsung dari Excel.
      </p>
      <textarea
        name="guests"
        rows={6}
        required
        placeholder={"Bapak Ahmad & Keluarga | Keluarga | 4 | 08123456789\nRina Marlina | Teman Kantor | 2"}
        className={`${input} font-mono text-xs`}
      />
      {state.error && <p className="mt-2 text-sm text-red-700">{state.error}</p>}
      {state.ok && <p className="mt-2 text-sm text-plum">{state.ok}</p>}
      <button disabled={pending} className="mt-3 w-full rounded-full bg-plum py-2.5 text-sm font-medium text-cream hover:bg-mauve disabled:opacity-60">
        {pending ? "Menyimpan..." : "Tambah"}
      </button>
    </form>
  );
}

/** Link cepat dengan nama langsung (tanpa terdaftar), seperti ?to=Nama Tamu. */
export function PublicLinkTool({ origin }: { origin: string }) {
  const [name, setName] = useState("");
  const link = name.trim() ? `${origin}/?to=${encodeURIComponent(name.trim())}` : "";
  return (
    <div className={card}>
      <h2 className="font-serif text-xl font-semibold text-plum">Link Cepat</h2>
      <p className="mt-1 mb-3 text-xs leading-relaxed text-mauve">
        Buat link dengan nama langsung tanpa mendaftarkan tamu. RSVP-nya tercatat sebagai tamu umum.
      </p>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama tamu" className={input} />
      {link && (
        <div className="mt-3 space-y-2">
          <p className="break-all rounded-xl bg-blush/60 p-2 text-xs">{link}</p>
          <CopyButton text={link} label="Salin link" className="rounded-full bg-plum px-4 py-1.5 text-xs text-cream" />
        </div>
      )}
      <p className="mt-3 text-xs text-mauve">
        Link umum tanpa nama: <span className="break-all">{origin}</span>
      </p>
    </div>
  );
}

export function WishActions({ id, visible, hasMessage }: { id: number; visible: boolean; hasMessage: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-1">
      {hasMessage && (
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => setWishVisibility(id, !visible))}
          className="inline-flex items-center gap-1 rounded-full border border-petal px-3 py-1 text-xs text-plum hover:bg-blush disabled:opacity-50"
        >
          {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          {visible ? "Sembunyikan" : "Tampilkan"}
        </button>
      )}
      <DeleteButton confirmText="Hapus RSVP & ucapan ini?" onDelete={() => deleteRsvp(id)} />
    </div>
  );
}
