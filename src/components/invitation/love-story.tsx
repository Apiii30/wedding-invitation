"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { Gem, Heart, HeartHandshake, MessageCircleHeart, Sparkles } from "lucide-react";
import { useRef } from "react";
import { Reveal, Scrub, SplitText } from "@/components/reveal";
import type { Photo } from "@/lib/photos";

const ICONS = { sparkles: Sparkles, message: MessageCircleHeart, heart: Heart, gem: Gem, rings: HeartHandshake };

export type StoryItem = { year: string; title: string; text: string; icon: string; photo: Photo | null };

/** Timeline: garis emas yang "tergambar" mengikuti scroll, dengan hati yang berjalan di ujungnya. */
export function LoveStory({ items }: { items: StoryItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  const heartTop = useTransform(progress, (v) => `${v * 100}%`);

  return (
    <div ref={ref} className="relative pl-14">
      <div className="absolute top-3 bottom-3 left-5 w-px bg-gold/25" />
      <motion.div
        className="absolute top-3 bottom-3 left-5 w-0.5 -translate-x-1/4 origin-top rounded-full bg-gradient-to-b from-gold via-rose to-plum"
        style={{ scaleY: progress }}
      />
      <div className="absolute top-3 bottom-3 left-5">
        <motion.div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ top: heartTop }}>
          <span className="grid size-6 place-items-center rounded-full bg-plum text-cream shadow-lg shadow-plum/40">
            <Heart className="size-3 fill-current" />
          </span>
        </motion.div>
      </div>

      {items.map((item, i) => (
        <Moment key={item.year + item.title} item={item} index={i} />
      ))}
    </div>
  );
}

function Moment({ item, index }: { item: StoryItem; index: number }) {
  const Icon = ICONS[item.icon as keyof typeof ICONS] ?? Heart;
  const even = index % 2 === 0;
  return (
    <div className="relative pb-20 last:pb-4">
      {/* Titik di garis */}
      <motion.div
        className="absolute top-12 -left-14 z-10 grid size-10 place-items-center"
        initial={{ scale: 0, rotate: -90 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true, amount: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
      >
        <span className="grid size-10 place-items-center rounded-full border border-gold bg-cream text-plum shadow-md shadow-plum/20">
          <Icon className="size-4" />
        </span>
      </motion.div>

      {/* Tahun raksasa di belakang kartu */}
      <Scrub
        x={even ? [60, -30] : [-30, 60]}
        className="pointer-events-none absolute -top-2 right-0 z-0 font-serif text-[88px] leading-none font-semibold text-transparent [-webkit-text-stroke:1px_rgba(184,151,106,0.45)]"
      >
        <span aria-hidden>{item.year}</span>
      </Scrub>

      {/* Kartu cerita */}
      <Reveal variant={even ? "tiltRight" : "tiltLeft"} className="relative z-10 pt-12">
        <div className="rounded-3xl border border-gold/30 bg-white/90 p-5 shadow-xl shadow-plum/10 backdrop-blur">
          <div className={item.photo ? "pr-24" : ""}>
            <span className="inline-block rounded-full bg-plum px-3 py-1 text-[11px] font-semibold tracking-widest text-cream">
              {item.year}
            </span>
            <h3 className="mt-2 font-script text-4xl leading-tight text-plum">
              <SplitText text={item.title} />
            </h3>
          </div>
          <Reveal delay={0.15} className="mt-2">
            <p className="text-sm leading-relaxed">{item.text}</p>
          </Reveal>
        </div>
      </Reveal>

      {/* Foto polaroid yang menumpang di pojok kartu */}
      {item.photo && (
        <Reveal variant="pop" delay={0.3} className="absolute top-0 right-3 z-20">
          <Scrub rotate={even ? [14, -4] : [-14, 4]} y={[24, -24]}>
            <div className="w-24 bg-white p-1.5 pb-5 shadow-xl shadow-plum/25">
              <div className="relative aspect-square overflow-hidden bg-petal">
                <Image
                  src={item.photo.src}
                  alt={item.title}
                  fill
                  sizes="96px"
                  placeholder="blur"
                  blurDataURL={item.photo.blurDataURL}
                  className="object-cover"
                />
              </div>
            </div>
          </Scrub>
        </Reveal>
      )}
    </div>
  );
}
