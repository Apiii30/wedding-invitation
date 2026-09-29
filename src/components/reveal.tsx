"use client";

import { motion, useScroll, useTransform, type TargetAndTransition } from "motion/react";
import { useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const VARIANTS = {
  up: { opacity: 0, y: 48 },
  down: { opacity: 0, y: -40 },
  left: { opacity: 0, x: -70 },
  right: { opacity: 0, x: 70 },
  zoom: { opacity: 0, scale: 0.82 },
  pop: { opacity: 0, scale: 0.5, rotate: -12 },
  rise: { opacity: 0, y: 110, scale: 0.92 },
  tiltLeft: { opacity: 0, x: -60, rotate: -6 },
  tiltRight: { opacity: 0, x: 60, rotate: 6 },
  flip: { opacity: 0, rotateX: 65, y: 30, transformPerspective: 900 },
  scale: { opacity: 0, scale: 0.9 },
} satisfies Record<string, TargetAndTransition>;

/** "mask": isi naik dari balik jendela tersembunyi, seperti tirai terbuka. */
export type RevealVariant = keyof typeof VARIANTS | "mask";

const NEUTRAL: Record<string, string | number> = {
  opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, rotateX: 0, transformPerspective: 900,
};

const VIEWPORT = { once: true, amount: 0.2 } as const;

/** Animasi masuk sekali saat elemen terlihat. */
export function Reveal({
  children,
  delay = 0,
  variant = "up",
  duration = 0.9,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  variant?: RevealVariant;
  duration?: number;
  className?: string;
}) {
  if (variant === "mask") return <MaskReveal delay={delay} duration={duration} className={className}>{children}</MaskReveal>;
  const hidden: TargetAndTransition = VARIANTS[variant];
  const shown = Object.fromEntries(Object.keys(hidden).map((k) => [k, NEUTRAL[k]])) as TargetAndTransition;
  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={shown}
      viewport={VIEWPORT}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Isi naik dari balik "jendela". Pemicu dipasang di pembungkus (selalu terlihat), dan
 * overflow dibuka lagi setelah animasi selesai agar bayangan/bingkai tidak terpotong.
 */
function MaskReveal({ children, delay, duration, className }: { children: React.ReactNode; delay: number; duration: number; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <motion.div className={`-m-3 p-3 ${done ? "" : "overflow-hidden"} ${className ?? ""}`} initial="hidden" whileInView="shown" viewport={VIEWPORT}>
      <motion.div
        variants={{
          hidden: { y: "100%" },
          shown: { y: 0, transition: { duration, delay, ease: EASE } },
        }}
        onAnimationComplete={(def) => def === "shown" && setDone(true)}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Teks muncul bergiliran per kata atau per huruf. */
export function SplitText({
  text,
  by = "word",
  delay = 0,
  stagger,
  className,
}: {
  text: string;
  by?: "word" | "letter";
  delay?: number;
  stagger?: number;
  className?: string;
}) {
  const parts = by === "word" ? text.split(" ") : Array.from(text);
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.4 }}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: stagger ?? (by === "word" ? 0.08 : 0.035), delayChildren: delay } } }}
    >
      <span className="sr-only">{text}</span>
      {parts.map((part, i) => (
        <span key={i} aria-hidden>
          <motion.span
            className="inline-block"
            variants={{
              hidden: { opacity: 0, y: "0.6em", rotate: by === "word" ? 6 : 0 },
              shown: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.8, ease: EASE } },
            }}
          >
            {part === " " ? " " : part}
          </motion.span>
          {by === "word" && i < parts.length - 1 && " "}
        </span>
      ))}
    </motion.span>
  );
}

type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];
type Range = [number, number] | [string, string];

/**
 * Nilai transformasi mengikuti posisi scroll (bukan animasi sekali jalan).
 * Default: dari elemen mulai masuk layar sampai elemen keluar layar.
 */
export function Scrub({
  children,
  className,
  style,
  offset = ["start end", "end start"],
  x, y, rotate, scale, opacity,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  offset?: ScrollOffset;
  x?: Range; y?: Range; rotate?: Range; scale?: Range; opacity?: Range;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset });
  // Range boleh angka atau string ("20%"); motion menangani keduanya saat runtime.
  const range = (r: Range | undefined, fallback: number) => (r ?? [fallback, fallback]) as number[];
  const tx = useTransform(scrollYProgress, [0, 1], range(x, 0));
  const ty = useTransform(scrollYProgress, [0, 1], range(y, 0));
  const tr = useTransform(scrollYProgress, [0, 1], range(rotate, 0));
  const ts = useTransform(scrollYProgress, [0, 1], range(scale, 1));
  const to = useTransform(scrollYProgress, [0, 1], range(opacity, 1));
  return (
    <motion.div ref={ref} className={className} style={{ ...style, x: tx, y: ty, rotate: tr, scale: ts, opacity: to }}>
      {children}
    </motion.div>
  );
}

/** Tulisan raksasa bergaris tipis yang bergeser horizontal di belakang judul. */
export function BackdropText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <Scrub
      x={["22%", "-22%"]}
      className={`pointer-events-none absolute inset-x-0 flex select-none justify-center whitespace-nowrap font-serif text-[92px] leading-none font-semibold uppercase text-transparent [-webkit-text-stroke:1px_rgba(156,120,128,0.2)] ${className}`}
    >
      <span aria-hidden>{text}</span>
    </Scrub>
  );
}

/**
 * Isi bergerak lebih lambat dari scroll (efek parallax).
 * Pembungkus harus punya ukuran sendiri (mis. `absolute inset-0` atau tinggi tetap).
 */
export function Parallax({ children, className = "", offset = 60 }: { children: React.ReactNode; className?: string; offset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div className="absolute inset-x-0" style={{ y, top: -offset, bottom: -offset }}>
        {children}
      </motion.div>
    </div>
  );
}
