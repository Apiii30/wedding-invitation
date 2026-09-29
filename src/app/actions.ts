"use server";

import { revalidatePath } from "next/cache";
import { wedding } from "@/data/wedding";
import { isRsvpClosed } from "@/lib/deadline";
import { store } from "@/lib/store";
import type { Attendance } from "@/lib/types";

export type RsvpState = { status: "idle" | "success" | "error"; message: string };

const ATTENDANCES: Attendance[] = ["hadir", "tidak_hadir"];

export async function submitRsvp(_prev: RsvpState, form: FormData): Promise<RsvpState> {
  // Honeypot: kolom tersembunyi yang hanya diisi bot.
  if (form.get("website")) return { status: "success", message: "Terima kasih!" };

  if (isRsvpClosed()) {
    return { status: "error", message: "Mohon maaf, batas waktu konfirmasi kehadiran sudah lewat." };
  }

  const attendance = String(form.get("attendance") ?? "") as Attendance;
  if (!ATTENDANCES.includes(attendance)) return { status: "error", message: "Silakan pilih konfirmasi kehadiran." };

  const message = String(form.get("message") ?? "").trim().slice(0, 500) || null;
  const paxInput = Number(form.get("pax"));
  const slug = String(form.get("guest") ?? "");
  const guest = slug ? await store.findGuestBySlug(slug) : null;

  const maxPax = guest?.maxPax ?? wedding.publicMaxPax;
  const pax = attendance === "hadir" ? Math.min(Math.max(Number.isInteger(paxInput) ? paxInput : 1, 1), maxPax) : 0;

  if (guest) {
    await store.upsertGuestRsvp(guest.id, { name: guest.name, attendance, pax, message });
  } else {
    const name = String(form.get("name") ?? "").trim().slice(0, 120);
    if (!name) return { status: "error", message: "Nama wajib diisi." };
    await store.insertPublicRsvp({ name, attendance, pax, message });
  }

  revalidatePath("/");
  return {
    status: "success",
    message: attendance === "tidak_hadir"
      ? "Terima kasih atas doa dan ucapannya."
      : "Terima kasih, konfirmasi kehadiran Anda sudah kami terima.",
  };
}
