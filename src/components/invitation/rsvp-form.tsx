"use client";

import { CircleCheck, CircleX, Loader2, Send } from "lucide-react";
import { useActionState, useState } from "react";
import { submitRsvp, type RsvpState } from "@/app/actions";
import { ATTENDANCE_LABEL, type Attendance } from "@/lib/types";

type Props = {
  guest: { slug: string; name: string; maxPax: number } | null;
  defaultName: string | null;
  existing: { attendance: Attendance; pax: number; message: string | null } | null;
  publicMaxPax: number;
  closed: boolean;
};

const initial: RsvpState = { status: "idle", message: "" };

export function RsvpForm({ guest, defaultName, existing, publicMaxPax, closed }: Props) {
  const [state, action, pending] = useActionState(submitRsvp, initial);
  const [attendance, setAttendance] = useState<Attendance | null>(existing?.attendance ?? null);
  const maxPax = guest?.maxPax ?? publicMaxPax;

  if (closed) {
    return <p className="rounded-2xl bg-white/70 p-5 text-center text-sm">Konfirmasi kehadiran sudah ditutup. Terima kasih.</p>;
  }

  const field = "w-full rounded-xl border border-petal bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/20";

  return (
    // React mengosongkan form setelah action berhasil; samakan state pilihan kehadiran.
    <form action={action} onReset={() => !guest && setAttendance(null)} className="space-y-4 rounded-3xl border border-gold/30 bg-white/60 p-5 shadow-sm backdrop-blur">
      {existing && state.status === "idle" && (
        <p className="rounded-xl bg-blush px-4 py-2.5 text-center text-xs text-plum">
          Anda sudah mengonfirmasi <b>{ATTENDANCE_LABEL[existing.attendance]}</b>. Jawaban masih bisa diubah.
        </p>
      )}

      {guest && <input type="hidden" name="guest" value={guest.slug} />}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-mauve">Nama</span>
        {guest ? (
          <div className={`${field} bg-blush/50`}>{guest.name}</div>
        ) : (
          <input name="name" required maxLength={120} defaultValue={defaultName ?? ""} placeholder="Nama Anda" className={field} />
        )}
      </label>

      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-mauve">Konfirmasi Kehadiran</legend>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(ATTENDANCE_LABEL) as Attendance[]).map((value) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-sm font-medium transition ${
                attendance !== value
                  ? "border-petal bg-white/80 text-ink hover:border-rose"
                  : value === "hadir"
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-red-500 bg-red-500 text-white"
              }`}
            >
              <input
                type="radio"
                name="attendance"
                value={value}
                required
                className="sr-only"
                defaultChecked={existing?.attendance === value}
                onChange={() => setAttendance(value)}
              />
              {value === "hadir" ? <CircleCheck className="size-4" /> : <CircleX className="size-4" />}
              {ATTENDANCE_LABEL[value]}
            </label>
          ))}
        </div>
      </fieldset>

      {attendance === "hadir" && (
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-mauve">Jumlah yang hadir</span>
          <select name="pax" defaultValue={Math.min(existing?.pax || 1, maxPax)} className={field}>
            {Array.from({ length: maxPax }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} orang
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-mauve">Ucapan & Doa</span>
        <textarea
          name="message"
          rows={4}
          maxLength={500}
          defaultValue={existing?.message ?? ""}
          placeholder="Tuliskan ucapan dan doa untuk kedua mempelai"
          className={`${field} resize-none`}
        />
      </label>

      {state.status !== "idle" && (
        <p className={`text-center text-sm ${state.status === "error" ? "text-red-700" : "text-plum"}`} role="status">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-plum py-3 text-sm font-medium text-cream shadow-md transition hover:bg-mauve disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {existing ? "Perbarui" : "Kirim"}
      </button>
    </form>
  );
}
