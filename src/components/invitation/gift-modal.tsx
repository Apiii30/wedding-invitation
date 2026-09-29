"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Gift as GiftIcon, MapPin, MessageCircle, Nfc, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { Portal } from "@/components/portal";
import type { Gift } from "@/data/wedding";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

type Contact = { key: "bride" | "groom"; name: string; phone: string };

type Props = {
  gifts: Gift[];
  address: string;
  contacts: Contact[];
  guestName: string | null;
};

const THEMES = [
  "from-[#c9a09c] via-[#a9808a] to-[#6b4d55]",
  "from-[#d9c3a0] via-[#b8976a] to-[#7d5f4a]",
];

/** Tombol "Kirim Hadiah" yang membuka modal berisi rekening (kartu ATM), form, dan konfirmasi WhatsApp. */
export function GiftButton(props: Props) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <div className="flex justify-center">
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="relative inline-flex items-center gap-2.5 rounded-full bg-plum px-8 py-4 text-sm font-medium text-cream shadow-xl shadow-plum/30"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-plum/30 [animation-duration:2.4s]" />
          <GiftIcon className="relative size-5" />
          <span className="relative">Kirim Hadiah</span>
        </motion.button>
      </div>
      <Portal>
        <AnimatePresence>{open && <GiftModal {...props} onClose={close} />}</AnimatePresence>
      </Portal>
    </>
  );
}

function GiftModal({ gifts, address, contacts, guestName, onClose }: Props & { onClose: () => void }) {
  const [selected, setSelected] = useState(0);
  const [to, setTo] = useState<Contact["key"]>(gifts[0]?.owner ?? "bride");
  const [name, setName] = useState(guestName ?? "");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    lockScroll();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function select(i: number) {
    setSelected(i);
    setTo(gifts[i].owner);
  }

  function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Nama pengirim wajib diisi.");
    const gift = gifts[selected];
    const contact = contacts.find((c) => c.key === to)!;
    const text = [
      `Assalamu'alaikum ${contact.name},`,
      "",
      `Saya *${name.trim()}* telah mengirimkan hadiah pernikahan${amount ? ` sebesar *Rp${amount}*` : ""} melalui rekening *${gift.bank}* a.n. ${gift.holder}.`,
      ...(message.trim() ? ["", message.trim()] : []),
      "",
      "Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.",
    ].join("\n");
    window.open(`https://wa.me/${contact.phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  const field = "w-full rounded-xl border border-petal bg-white px-4 py-3 text-sm outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/20";

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-plum/40 backdrop-blur-sm sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal
        aria-labelledby="gift-title"
        data-lenis-prevent
        className="no-scrollbar max-h-[92dvh] w-full max-w-[440px] overflow-y-auto overscroll-contain rounded-t-[2rem] bg-cream shadow-2xl sm:rounded-[2rem]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-cream/90 px-6 pt-3 pb-3 backdrop-blur">
          <span className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-petal sm:hidden" />
          <h3 id="gift-title" className="mt-2 font-script text-4xl text-plum">Amplop Digital</h3>
          <button type="button" onClick={onClose} aria-label="Tutup" className="mt-2 grid size-9 place-items-center rounded-full bg-white text-plum shadow-sm">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-6 px-6 pb-8">
          <section className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-mauve">Pilih rekening</p>
            {gifts.map((gift, i) => (
              <motion.div
                key={`${gift.bank}-${i}`}
                initial={{ opacity: 0, y: 30, rotateX: 25 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformPerspective: 800 }}
              >
                <AtmCard gift={gift} theme={THEMES[i % THEMES.length]} selected={selected === i} onSelect={() => select(i)} />
              </motion.div>
            ))}
          </section>

          <form onSubmit={confirm} className="space-y-4 rounded-3xl border border-gold/30 bg-white/70 p-5">
            <div>
              <p className="font-serif text-xl font-semibold text-plum">Konfirmasi Hadiah</p>
              <p className="mt-1 text-xs leading-relaxed text-mauve">
                Setelah transfer, kabari kami lewat WhatsApp agar hadiah Anda bisa kami terima dengan baik.
              </p>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-mauve">Nama pengirim</span>
              <input value={name} onChange={(e) => (setName(e.target.value), setError(""))} maxLength={120} placeholder="Nama Anda" className={field} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-mauve">Nominal (opsional)</span>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm text-mauve">Rp</span>
                <input
                  value={amount}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
                    setAmount(digits ? Number(digits).toLocaleString("id-ID") : "");
                  }}
                  inputMode="numeric"
                  placeholder="0"
                  className={`${field} pl-11`}
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-mauve">Pesan (opsional)</span>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={500} placeholder="Tulis pesan singkat" className={`${field} resize-none`} />
            </label>
            <fieldset>
              <legend className="mb-1.5 text-xs font-medium text-mauve">Konfirmasi ke</legend>
              <div className="grid grid-cols-2 gap-2">
                {contacts.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setTo(c.key)}
                    aria-pressed={to === c.key}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                      to === c.key ? "border-plum bg-plum text-cream" : "border-petal bg-white text-ink hover:border-rose"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </fieldset>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white shadow-lg shadow-[#25D366]/30 transition hover:brightness-95">
              <MessageCircle className="size-5" />
              Konfirmasi via WhatsApp
            </button>
          </form>

          {address && (
            <section className="rounded-3xl border border-gold/30 bg-white/70 p-5 text-center">
              <MapPin className="mx-auto size-5 text-gold" />
              <p className="mt-2 font-serif text-lg font-semibold text-plum">Kirim Kado</p>
              <p className="mt-1 text-sm leading-relaxed">{address}</p>
              <CopyButton text={address} label="Salin Alamat" className="mt-3 rounded-full bg-plum px-4 py-1.5 text-xs text-cream" />
            </section>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Kartu bergaya kartu ATM: chip, logo contactless, nomor terkelompok, dan nama pemilik. */
function AtmCard({ gift, theme, selected, onSelect }: { gift: Gift; theme: string; selected: boolean; onSelect: () => void }) {
  const grouped = gift.number.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect())}
      className={`relative aspect-[1.586] cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br ${theme} p-5 text-white shadow-xl transition duration-300 ${
        selected ? "scale-100 ring-2 ring-gold ring-offset-2 ring-offset-cream" : "scale-[0.97] opacity-75"
      }`}
    >
      {/* Kilau & pola */}
      <div className="pointer-events-none absolute -top-1/2 -right-1/4 size-[120%] rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-1/2 -left-1/3 size-[90%] rounded-full bg-black/10" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between">
          <p className="font-serif text-2xl font-semibold italic tracking-wide">{gift.bank}</p>
          {selected ? (
            <span className="grid size-6 place-items-center rounded-full bg-white text-plum">
              <Check className="size-4" />
            </span>
          ) : (
            <Nfc className="size-6 opacity-80" />
          )}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Chip />
          {selected && <Nfc className="size-5 opacity-80" />}
        </div>
        <p className="mt-auto font-mono text-[19px] tracking-[0.14em] [text-shadow:0_1px_1px_rgba(0,0,0,0.25)]">{grouped}</p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-75">Pemilik Rekening</p>
            <p className="truncate text-sm font-medium uppercase tracking-wide">{gift.holder}</p>
          </div>
          <span onClick={(e) => e.stopPropagation()}>
            <CopyButton text={gift.number.replace(/\s/g, "")} className="shrink-0 rounded-full bg-white/25 px-3 py-1.5 text-xs backdrop-blur hover:bg-white/35" />
          </span>
        </div>
      </div>
    </div>
  );
}

function Chip() {
  return (
    <svg viewBox="0 0 44 34" className="h-8 w-11" aria-hidden>
      <defs>
        <linearGradient id="chip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3e2b8" />
          <stop offset="0.5" stopColor="#d4b474" />
          <stop offset="1" stopColor="#b8976a" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="43" height="33" rx="6" fill="url(#chip)" stroke="#9c7b4a" strokeOpacity="0.5" />
      <path d="M0 12h14M0 22h14M30 12h14M30 22h14M14 0v34M30 0v34M14 17h16" stroke="#8a6a3e" strokeOpacity="0.55" fill="none" />
    </svg>
  );
}
