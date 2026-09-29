import "server-only";
import { headers } from "next/headers";
import { wedding } from "@/data/wedding";

export async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export const inviteLink = (origin: string, to: string) => `${origin}/?to=${encodeURIComponent(to)}`;

/** 0812..., +62 812..., 812... -> 62812... */
export function normalizePhone(input: string | null | undefined): string | null {
  const digits = (input ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export function whatsappLink(guestName: string, link: string, phone: string | null) {
  const names = `${wedding.bride.nickname} & ${wedding.groom.nickname}`;
  const text = [
    "Assalamu'alaikum Warahmatullahi Wabarakatuh",
    "",
    "Kepada Yth.",
    `Bapak/Ibu/Saudara/i *${guestName}*`,
    "",
    "Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.",
    "",
    "Berikut link undangan kami, untuk info lengkap dari acara bisa kunjungi:",
    link,
    "",
    "Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.",
    "",
    "Wassalamu'alaikum Warahmatullahi Wabarakatuh",
    "",
    "Kami yang berbahagia,",
    `*${names}*`,
  ].join("\n");
  return `https://wa.me/${phone ?? ""}?text=${encodeURIComponent(text)}`;
}
