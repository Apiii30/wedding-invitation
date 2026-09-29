"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Portal } from "@/components/portal";
import type { Photo } from "@/lib/photos";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

const AUTOPLAY_MS = 4000;
const RESUME_AFTER_MS = 8000;

/** Carousel coverflow: foto aktif di tengah, foto lain miring ke belakang dan saling menumpuk. */
export function Gallery({ photos, alt }: { photos: Photo[]; alt: string }) {
  const n = photos.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const panned = useRef(false);
  const thumbs = useRef<HTMLDivElement>(null);

  const go = useCallback((step: number) => setIndex((i) => (i + step + n) % n), [n]);

  /** Autoplay berhenti sementara setiap kali tamu berinteraksi. */
  const interact = useCallback(() => {
    setPaused(true);
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), RESUME_AFTER_MS);
  }, []);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  useEffect(() => {
    if (paused || lightbox !== null) return;
    const id = setInterval(() => go(1), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, lightbox, go, index]);

  // Geser strip thumbnail agar foto aktif selalu terlihat (tanpa ikut menggulir halaman).
  useEffect(() => {
    const strip = thumbs.current;
    const el = strip?.children[index] as HTMLElement | undefined;
    if (strip && el) strip.scrollTo({ left: el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [index]);

  /** Jarak foto i dari foto aktif, memutar (foto terakhir bersebelahan dengan foto pertama). */
  const offset = (i: number) => {
    let d = i - index;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  return (
    <>
      <motion.div
        className="relative touch-pan-y select-none perspective-[1100px]"
        onPanStart={() => (panned.current = true)}
        onPanEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 40) {
            interact();
            go(info.offset.x < 0 ? 1 : -1);
          }
        }}
        onPointerDown={() => (panned.current = false)}
      >
        {/* Penentu tinggi carousel. Slide mengikuti tinggi ini lewat inset-y-0;
            jangan pakai aspect-ratio pada <button> absolute karena di sebagian browser tingginya jadi 0. */}
        <div className="invisible mx-auto aspect-4/5 w-[66%]" />
        {photos.map((p, i) => {
          const d = offset(i);
          const dist = Math.abs(d);
          if (dist > 2) return null;
          return (
            <motion.button
              key={p.src}
              type="button"
              aria-label={d === 0 ? `Perbesar foto ${i + 1}` : `Tampilkan foto ${i + 1}`}
              className="absolute inset-y-0 left-[17%] block w-[66%] overflow-hidden rounded-t-[999px] rounded-b-3xl bg-petal shadow-2xl shadow-plum/30 outline-none"
              style={{ zIndex: 10 - dist }}
              initial={false}
              animate={{
                x: `${d * 58}%`,
                scale: 1 - dist * 0.16,
                rotateY: d * -22,
                opacity: dist >= 2 ? 0 : 1,
              }}
              transition={{ type: "spring", stiffness: 220, damping: 28 }}
              onClick={() => {
                if (panned.current) return;
                interact();
                if (d === 0) setLightbox(i);
                else setIndex(i);
              }}
            >
              <Image
                src={p.src}
                alt={`${alt} ${i + 1}`}
                fill
                draggable={false}
                loading="eager"
                sizes="(max-width: 440px) 70vw, 300px"
                placeholder="blur"
                blurDataURL={p.blurDataURL}
                className="pointer-events-none object-cover"
              />
              <motion.div
                className="absolute inset-0 bg-cream"
                initial={false}
                animate={{ opacity: d === 0 ? 0 : 0.45 }}
              />
              {d === 0 && (
                <span className="absolute right-4 bottom-4 grid size-9 place-items-center rounded-full bg-white/80 text-plum backdrop-blur">
                  <Expand className="size-4" />
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      <div className="mt-6 flex items-center justify-between px-2">
        <button
          type="button"
          aria-label="Foto sebelumnya"
          onClick={() => (interact(), go(-1))}
          className="grid size-10 place-items-center rounded-full border border-gold/40 bg-white/70 text-plum shadow-sm transition hover:bg-blush"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex flex-col items-center gap-2">
          <p className="font-serif text-lg text-plum">
            <span className="text-2xl font-semibold">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-mauve"> / {String(n).padStart(2, "0")}</span>
          </p>
          <div className="h-0.5 w-24 overflow-hidden rounded-full bg-petal">
            <motion.div
              key={`${index}-${paused}`}
              className="h-full origin-left bg-gold"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: paused ? 0 : 1 }}
              transition={{ duration: paused ? 0 : AUTOPLAY_MS / 1000, ease: "linear" }}
            />
          </div>
        </div>
        <button
          type="button"
          aria-label="Foto berikutnya"
          onClick={() => (interact(), go(1))}
          className="grid size-10 place-items-center rounded-full border border-gold/40 bg-white/70 text-plum shadow-sm transition hover:bg-blush"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div ref={thumbs} className="no-scrollbar mt-5 flex gap-2 overflow-x-auto px-[40%] py-2">
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            aria-label={`Foto ${i + 1}`}
            onClick={() => (interact(), setIndex(i))}
            className={`relative h-16 w-12 shrink-0 overflow-hidden rounded-lg transition duration-300 ${
              i === index ? "scale-110 opacity-100 ring-2 ring-plum ring-offset-2 ring-offset-cream" : "opacity-50 hover:opacity-80"
            }`}
          >
            <Image src={p.src} alt="" fill sizes="48px" className="object-cover" />
          </button>
        ))}
      </div>

      <Portal>
        <Lightbox photos={photos} alt={alt} index={lightbox} onChange={setLightbox} />
      </Portal>
    </>
  );
}

function Lightbox({ photos, alt, index, onChange }: {
  photos: Photo[]; alt: string; index: number | null; onChange: (i: number | null) => void;
}) {
  const n = photos.length;
  const touchX = useRef<number | null>(null);
  const step = useCallback((s: number) => index !== null && onChange((index + s + n) % n), [index, n, onChange]);

  const open = index !== null;
  useEffect(() => {
    if (!open) return;
    lockScroll();
    return unlockScroll;
  }, [open]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onChange(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, step, onChange]);

  return (
    <AnimatePresence>
      {index !== null && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onChange(null)}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
          role="dialog"
          aria-modal
        >
          <motion.div
            key={index}
            className="relative h-[85dvh] w-full max-w-3xl"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={photos[index].src} alt={`${alt} ${index + 1}`} fill sizes="100vw" quality={85} className="object-contain" />
          </motion.div>
          <p className="absolute top-5 left-1/2 -translate-x-1/2 text-sm text-white/80">
            {index + 1} / {n}
          </p>
          <button type="button" aria-label="Tutup" className="absolute top-3 right-3 p-2 text-white" onClick={() => onChange(null)}>
            <X className="size-7" />
          </button>
          <button
            type="button"
            aria-label="Sebelumnya"
            className="absolute left-2 rounded-full bg-white/10 p-2 text-white"
            onClick={(e) => (e.stopPropagation(), step(-1))}
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            aria-label="Berikutnya"
            className="absolute right-2 rounded-full bg-white/10 p-2 text-white"
            onClick={(e) => (e.stopPropagation(), step(1))}
          >
            <ChevronRight className="size-6" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
