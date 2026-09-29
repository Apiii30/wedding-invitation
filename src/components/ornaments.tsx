import Image from "next/image";
import { BackdropText, Parallax, Reveal, Scrub, SplitText } from "@/components/reveal";
import type { Photo } from "@/lib/photos";

/** Bintang delapan (rub el hizb), motif geometri Islami. */
export function Star8({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
      <rect x="6" y="6" width="12" height="12" />
      <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

/** Garis pemisah dengan bintang di tengah dan sulur kecil di kedua sisi. */
export function Divider({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 24" className={`mx-auto h-6 w-52 text-gold ${className}`} fill="none" stroke="currentColor" strokeWidth="0.8" aria-hidden>
      <path d="M4 12h66M150 12h66" />
      <path d="M70 12c6-8 14-8 18 0-4 6-10 6-12 1M150 12c-6-8-14-8-18 0 4 6 10 6 12 1" />
      <path d="M60 12l3-3 3 3-3 3zM154 12l3-3 3 3-3 3" fill="currentColor" />
      <g transform="translate(98 0)">
        <rect x="6" y="6" width="12" height="12" />
        <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      </g>
    </svg>
  );
}

const PETAL = "M0 0C4-5 4-12 0-17C-4-12-4-5 0 0Z";
const LEAF = "M0 0C3-4 9-4 13 0C9 4 3 4 0 0Z";

/**
 * Ornamen sudut: bunga teratai bergaya garis dengan sulur daun,
 * terinspirasi motif ukiran/batik Sunda. Posisi default kiri atas.
 */
export function CornerVine({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" className={`text-gold ${className}`} fill="none" stroke="currentColor" strokeWidth="0.9" aria-hidden>
      <path d="M6 134V52C6 24 24 6 52 6h82" />
      <path d="M14 134V58c0-24 20-44 44-44h76" strokeOpacity="0.5" />
      <g transform="translate(30 30)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
          <path key={r} d={PETAL} transform={`rotate(${r})`} fill="currentColor" fillOpacity="0.12" />
        ))}
        <circle r="3" fill="currentColor" />
      </g>
      {[
        [62, 14, -20], [84, 14, 20], [106, 14, -20],
        [14, 62, 70], [14, 84, 110], [14, 106, 70],
      ].map(([x, y, r]) => (
        <path key={`${x}-${y}`} d={LEAF} transform={`translate(${x} ${y}) rotate(${r})`} fill="currentColor" fillOpacity="0.18" />
      ))}
      <path d="M122 6c6 0 10 4 10 9s-4 8-8 6" />
      <path d="M6 122c0 6 4 10 9 10s8-4 6-8" />
    </svg>
  );
}

/** Empat ornamen sudut untuk membingkai sebuah section. */
export function CornerFrame({ className = "size-24" }: { className?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <CornerVine className={`absolute top-4 left-4 ${className}`} />
      <CornerVine className={`absolute top-4 right-4 -scale-x-100 ${className}`} />
      <CornerVine className={`absolute bottom-14 left-4 -scale-y-100 ${className}`} />
      <CornerVine className={`absolute right-4 bottom-14 -scale-100 ${className}`} />
    </div>
  );
}

const FADE_BOTTOM = "[mask-image:linear-gradient(to_bottom,#000_62%,transparent)]";

/**
 * Foto dalam bingkai lengkung (mihrab) dengan garis emas.
 * `fade`: bagian bawah foto & bingkai memudar, untuk teks yang menumpuk di atasnya.
 */
export function ArchPhoto({ photo, alt, className = "w-56", sizes = "240px", position = "center", fade = false }: {
  photo: Photo; alt: string; className?: string; sizes?: string; position?: string; fade?: boolean;
}) {
  return (
    <div className={`relative mx-auto ${className}`}>
      <div className={`absolute -inset-2.5 rounded-t-full border border-gold/60 ${fade ? `border-b-0 ${FADE_BOTTOM}` : ""}`} />
      <div
        className={`relative aspect-[3/4] overflow-hidden rounded-t-full bg-petal ${
          fade ? FADE_BOTTOM : "shadow-lg shadow-plum/15"
        }`}
      >
        <Parallax className="absolute inset-0" offset={22}>
          <Image
            src={photo.src}
            alt={alt}
            fill
            sizes={sizes}
            placeholder="blur"
            blurDataURL={photo.blurDataURL}
            className="object-cover"
            style={{ objectPosition: position }}
          />
        </Parallax>
      </div>
    </div>
  );
}

export function SectionTitle({ eyebrow, title, backdrop }: { eyebrow?: string; title: string; backdrop?: string }) {
  return (
    <div className="relative mb-10 text-center">
      {backdrop && <BackdropText text={backdrop} className="top-1/2 -translate-y-1/2" />}
      <div className="relative">
        {eyebrow && (
          <p className="mb-2 text-[11px] uppercase tracking-[0.35em] text-mauve">
            <SplitText text={eyebrow} by="letter" />
          </p>
        )}
        <h2 className="font-script text-5xl leading-tight text-plum">
          <SplitText text={title} delay={0.2} />
        </h2>
        <Reveal variant="zoom" delay={0.4}>
          <Divider className="mt-3" />
        </Reveal>
      </div>
    </div>
  );
}

/** Ornamen yang melayang dan berputar mengikuti scroll, diletakkan menumpang di batas section. */
export function FloatingOrnament({ className = "", kind = "star", spin = 180 }: { className?: string; kind?: "star" | "vine"; spin?: number }) {
  return (
    <Scrub rotate={[0, spin]} y={[40, -40]} className={`pointer-events-none absolute z-20 ${className}`}>
      {kind === "star" ? (
        <div className="grid size-full place-items-center rounded-full bg-cream/90 p-2 shadow-lg shadow-plum/15 ring-1 ring-gold/40">
          <Star8 className="size-full text-gold" />
        </div>
      ) : (
        <CornerVine className="size-full" />
      )}
    </Scrub>
  );
}
