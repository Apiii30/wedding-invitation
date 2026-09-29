"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { AttendanceBadge } from "@/components/attendance-badge";
import { formatShortDateTime } from "@/lib/format";
import type { Wish } from "@/lib/types";

const PER_PAGE = 3;

/** Nomor halaman yang ditampilkan: maksimal 5, dengan halaman aktif di tengah. */
function visiblePages(page: number, total: number) {
  const start = Math.max(0, Math.min(page - 2, total - 5));
  return Array.from({ length: Math.min(5, total) }, (_, i) => start + i);
}

export function WishList({ wishes }: { wishes: Wish[] }) {
  const total = Math.max(1, Math.ceil(wishes.length / PER_PAGE));
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const go = (next: number) => setPage([next, next > page ? 1 : -1]);
  const items = wishes.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  if (wishes.length === 0) {
    return <p className="rounded-3xl bg-white/60 p-6 text-center text-sm text-mauve">Jadilah yang pertama memberi ucapan.</p>;
  }

  return (
    <div>
      <p className="mb-3 text-center text-xs uppercase tracking-[0.25em] text-mauve">{wishes.length} Ucapan</p>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.ul
            key={page}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d * 60, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d * -60, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-3"
          >
            {items.map((w) => (
              <li key={w.id} className="rounded-2xl border border-white bg-white/85 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-semibold text-plum">{w.name}</p>
                  <AttendanceBadge attendance={w.attendance} />
                </div>
                <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed">{w.message}</p>
                <p className="mt-2 text-[11px] text-mauve">{formatShortDateTime(w.createdAt)}</p>
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>

      {total > 1 && (
        <nav className="mt-5 flex items-center justify-center gap-1.5" aria-label="Halaman ucapan">
          <button
            type="button"
            onClick={() => go(page - 1)}
            disabled={page === 0}
            aria-label="Halaman sebelumnya"
            className="grid size-9 place-items-center rounded-full text-plum transition hover:bg-white disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          {visiblePages(page, total).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => go(p)}
              aria-current={p === page ? "page" : undefined}
              className={`grid size-9 place-items-center rounded-full text-sm transition ${
                p === page ? "bg-plum font-semibold text-cream shadow" : "text-plum hover:bg-white"
              }`}
            >
              {p + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => go(page + 1)}
            disabled={page === total - 1}
            aria-label="Halaman berikutnya"
            className="grid size-9 place-items-center rounded-full text-plum transition hover:bg-white disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
