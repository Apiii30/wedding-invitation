"use client";

import { AnimatePresence, MotionConfig, motion, useScroll, useSpring } from "motion/react";
import Image from "next/image";
import { BookHeart, BookOpen, CalendarDays, Gift, Heart, House, Images, MessageCircleHeart } from "lucide-react";
import Lenis from "lenis";
import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/photos";
import { lockScroll, registerLenis, scrollToTop, unlockScroll } from "@/lib/scroll-lock";

type Props = {
  guestName: string | null;
  names: string;
  cover: Photo;
  music: string;
  hasGifts: boolean;
  children: React.ReactNode;
};

/** Pembungkus undangan: cover "Buka Undangan", musik latar, progres scroll, dan navigasi bawah. */
export function InvitationShell({ guestName, names, cover, music, hasGifts, children }: Props) {
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [musicMissing, setMusicMissing] = useState(false);
  const [toast, setToast] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  // true jika tamu sengaja mematikan musik: jangan dinyalakan otomatis lagi.
  const mutedByUser = useRef(false);

  // Setiap kali halaman dibuka/di-refresh, mulai dari paling atas. Tanpa ini browser
  // mengembalikan posisi scroll terakhir, sehingga setelah "Buka Undangan" tamu mendarat di tengah halaman.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // Smooth scroll (dimatikan jika pengguna memilih "kurangi gerakan").
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const instance = new Lenis({ autoRaf: true, anchors: true, lerp: 0.09 });
    registerLenis(instance);
    return () => {
      registerLenis(null);
      instance.destroy();
    };
  }, []);

  // Halaman tidak bisa di-scroll sebelum undangan dibuka.
  useEffect(() => {
    if (opened) return;
    lockScroll();
    return unlockScroll;
  }, [opened]);

  // Putar musik sejak halaman dibuka. Browser (terutama Safari iPhone) memblokir audio sebelum ada
  // interaksi, jadi jika ditolak, musik dimulai pada sentuhan/klik/tombol pertama di mana saja.
  // Listener baru dilepas setelah play() benar-benar berhasil: di iPhone, `pointerdown` belum dihitung
  // sebagai interaksi (ditolak), baru `touchend`/`click` sesudahnya yang diizinkan.
  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    const events = ["pointerdown", "touchend", "click", "keydown"] as const;
    const stop = () => events.forEach((e) => window.removeEventListener(e, onGesture, true));
    function onGesture(e: Event) {
      if (mutedByUser.current || !el!.paused) return stop();
      // Sentuhan pada tombol musik diurus oleh tombol itu sendiri.
      if ((e.target as Element | null)?.closest?.("[data-music-toggle]")) return stop();
      el!.play().then(stop, () => {});
    }
    el.play().catch(() => events.forEach((e) => window.addEventListener(e, onGesture, true)));
    return stop;
  }, []);

  // Musik berhenti sementara saat tab/aplikasi ditinggalkan.
  useEffect(() => {
    let resume = false;
    const onVisibility = () => {
      const el = audio.current;
      if (!el) return;
      if (document.hidden) {
        resume = !el.paused;
        el.pause();
      } else if (resume) {
        el.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  function open() {
    scrollToTop();
    setOpened(true);
    if (!mutedByUser.current) audio.current?.play().catch(() => {});
  }

  function toggleMusic() {
    const el = audio.current;
    if (!el) return;
    if (musicMissing) {
      setToast(true);
      setTimeout(() => setToast(false), 2200);
      return;
    }
    if (el.paused) {
      mutedByUser.current = false;
      el.play().catch(() => {});
    } else {
      mutedByUser.current = true;
      el.pause();
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <audio
        ref={audio}
        src={music}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          setMusicMissing(true);
          setPlaying(false);
        }}
      />

      <AnimatePresence>
        {!opened && (
          <motion.div
            key="cover"
            className="fixed inset-0 z-50 flex justify-center"
            exit={{ y: "-100%" }}
            transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }}
          >
            <Cover guestName={guestName} names={names} photo={cover} onOpen={open} />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative mx-auto min-h-dvh w-full max-w-[440px] overflow-x-clip bg-cream shadow-2xl shadow-plum/20">
        {children}
      </main>

      {/* Tombol musik tampil sejak cover, di atas semua lapisan */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center">
        <div className="relative flex w-full max-w-[440px] justify-end px-4">
          <AnimatePresence>
            {toast && (
              <motion.p
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-2 right-18 rounded-full bg-plum px-3 py-1.5 text-xs text-cream shadow"
              >
                Lagu belum ditambahkan
              </motion.p>
            )}
          </AnimatePresence>
          <MusicToggle playing={playing} onToggle={toggleMusic} />
        </div>
      </div>

      {opened && (
        <>
          <ScrollProgress />
          <BottomNav hasGifts={hasGifts} />
        </>
      )}
    </MotionConfig>
  );
}

/**
 * Tombol musik berbentuk piringan hitam. Menyala: lengan pemutar turun & piringan berputar pelan.
 * Mati: lengan terangkat, piringan berhenti di posisinya (tidak melompat) dan diberi garis miring.
 */
function MusicToggle({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <motion.button
      type="button"
      data-music-toggle
      onClick={onToggle}
      aria-label={playing ? "Matikan musik" : "Putar musik"}
      aria-pressed={playing}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="pointer-events-auto relative size-13 rounded-full"
    >
      <svg viewBox="0 0 52 52" className="size-full overflow-visible drop-shadow-[0_6px_10px_rgba(74,58,62,0.35)]" aria-hidden>
        <defs>
          <radialGradient id="vinyl" cx="50%" cy="50%" r="50%">
            <stop offset="0.3" stopColor="#3a2c31" />
            <stop offset="1" stopColor="#1c1417" />
          </radialGradient>
          <linearGradient id="vinyl-label" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c9a09c" />
            <stop offset="1" stopColor="#6b4d55" />
          </linearGradient>
          <linearGradient id="vinyl-shine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
            <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.14" />
          </linearGradient>
        </defs>

        <motion.g animate={{ opacity: playing ? 1 : 0.72 }} transition={{ duration: 0.4 }}>
          {/* Bagian yang berputar */}
          <g
            className="animate-spin [animation-duration:5s]"
            style={{ transformOrigin: "26px 26px", transformBox: "view-box", animationPlayState: playing ? "running" : "paused" }}
          >
            <circle cx="26" cy="26" r="24" fill="url(#vinyl)" stroke="#b8976a" strokeOpacity="0.55" strokeWidth="1" />
            {[20.5, 17.5, 14.5, 12].map((r) => (
              <circle key={r} cx="26" cy="26" r={r} fill="none" stroke="#fff" strokeOpacity="0.07" />
            ))}
            <circle cx="26" cy="26" r="8.5" fill="url(#vinyl-label)" />
            <circle cx="26" cy="26" r="8.5" fill="none" stroke="#d9c3a0" strokeOpacity="0.9" strokeWidth="0.8" />
            {/* Hati kecil di label: penanda putaran */}
            <path d="M26 22.9c-.5-.7-1.8-.8-2.1.2-.3.9.6 1.6 2.1 2.6 1.5-1 2.4-1.7 2.1-2.6-.3-1-1.6-.9-2.1-.2Z" fill="#fbf6f2" />
            <circle cx="26" cy="26" r="1.4" fill="#1c1417" />
          </g>
          {/* Kilau statis */}
          <circle cx="26" cy="26" r="23.5" fill="url(#vinyl-shine)" pointerEvents="none" />
        </motion.g>

        {/* Garis miring saat mati */}
        <AnimatePresence>
          {!playing && (
            <motion.path
              d="M12 40 40 12"
              stroke="#fbf6f2"
              strokeWidth="2.4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              exit={{ pathLength: 0 }}
              transition={{ duration: 0.3 }}
              style={{ filter: "drop-shadow(0 0 1.5px rgba(107,77,85,0.9))" }}
            />
          )}
        </AnimatePresence>

        {/* Lengan pemutar (tonearm) */}
        {/* CSS transition, bukan motion: motion mengabaikan transform-origin kustom pada elemen SVG */}
        <g
          style={{
            transformOrigin: "47px 5px",
            transformBox: "view-box",
            transform: `rotate(${playing ? 0 : -62}deg)`,
            transition: "transform 0.7s cubic-bezier(0.34, 1.4, 0.64, 1)",
          }}
        >
          <path d="M47 5 L41 24 L33.5 30" fill="none" stroke="#d9c3a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="30.2" y="28.4" width="5" height="3.4" rx="0.8" transform="rotate(-40 32.7 30.1)" fill="#b8976a" />
          <circle cx="47" cy="5" r="3.2" fill="#b8976a" stroke="#fbf6f2" strokeWidth="1" />
        </g>
      </svg>
    </motion.button>
  );
}

/** Garis emas tipis di atas yang memanjang sesuai posisi scroll. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center">
      <motion.div className="h-[3px] w-full max-w-[440px] origin-left bg-gradient-to-r from-rose via-gold to-plum" style={{ scaleX }} />
    </div>
  );
}

function Cover({ guestName, names, photo, onOpen }: { guestName: string | null; names: string; photo: Photo; onOpen: () => void }) {
  return (
    <div className="relative h-full w-full max-w-[440px] overflow-hidden bg-plum">
      <Image
        src={photo.src}
        alt={names}
        fill
        preload
        quality={85}
        sizes="(max-width: 440px) 100vw, 440px"
        placeholder="blur"
        blurDataURL={photo.blurDataURL}
        className="object-cover object-[50%_30%]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/15 to-black/80" />
      <Particles />

      <motion.div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center px-8 pb-16 text-center text-white"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-sm font-medium uppercase tracking-[0.3em]">The Wedding of</p>
        <h1 className="mt-3 font-script text-6xl leading-tight drop-shadow-md">{names}</h1>
        <div className="mt-6 text-sm leading-snug">
          <p>Kepada Yth.</p>
          <p>Bpk/Ibu/Saudara/i</p>
          <p className="mt-1.5 font-serif text-2xl font-semibold">{guestName ?? "Tamu Undangan"}</p>
          <p className="mt-1">di Tempat</p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-plum shadow-lg transition hover:bg-blush active:scale-95"
        >
          <BookOpen className="size-4" />
          Buka Undangan
        </button>
      </motion.div>
    </div>
  );
}

/** Butiran cahaya yang melayang naik di cover. Posisi dibuat deterministik agar aman saat hydration. */
function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 22 }, (_, i) => {
        const size = 2 + ((i * 7) % 4);
        return (
          <span
            key={i}
            className="absolute rounded-full bg-white/70 animate-float-up"
            style={{
              left: `${(i * 37) % 100}%`,
              bottom: `-${(i * 13) % 20}%`,
              width: size,
              height: size,
              animationDuration: `${9 + ((i * 5) % 9)}s`,
              animationDelay: `${(i * 1.3) % 9}s`,
            }}
          />
        );
      })}
    </div>
  );
}

function BottomNav({ hasGifts }: { hasGifts: boolean }) {
  const items = [
    { id: "home", label: "Beranda", Icon: House },
    { id: "mempelai", label: "Mempelai", Icon: Heart },
    { id: "cerita", label: "Love Story", Icon: BookHeart },
    { id: "acara", label: "Acara", Icon: CalendarDays },
    { id: "galeri", label: "Galeri", Icon: Images },
    { id: "rsvp", label: "Ucapan", Icon: MessageCircleHeart },
    ...(hasGifts ? [{ id: "hadiah", label: "Hadiah", Icon: Gift }] : []),
  ];
  const [active, setActive] = useState("home");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const { id } of items) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasGifts]);

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4"
    >
      <ul className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-white/60 bg-white/80 p-1.5 shadow-lg shadow-plum/15 backdrop-blur-md">
        {items.map(({ id, label, Icon }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-label={label}
              className={`grid size-10 place-items-center rounded-full transition ${
                active === id ? "bg-plum text-cream" : "text-mauve hover:bg-blush"
              }`}
            >
              <Icon className="size-[18px]" />
            </a>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
}
