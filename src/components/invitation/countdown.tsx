"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

function remaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    Hari: Math.floor(diff / 86_400_000),
    Jam: Math.floor(diff / 3_600_000) % 24,
    Menit: Math.floor(diff / 60_000) % 60,
    Detik: Math.floor(diff / 1000) % 60,
  };
}

export function Countdown({ date }: { date: string }) {
  const target = new Date(date).getTime();
  // null saat render server, agar tidak terjadi hydration mismatch.
  const [time, setTime] = useState<ReturnType<typeof remaining> | null>(null);

  useEffect(() => {
    const tick = () => setTime(remaining(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="flex justify-center gap-3" aria-label="Hitung mundur menuju hari pernikahan">
      {(["Hari", "Jam", "Menit", "Detik"] as const).map((unit, i) => (
        <motion.div
          key={unit}
          initial={{ opacity: 0, rotateY: 90, y: 20 }}
          whileInView={{ opacity: 1, rotateY: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformPerspective: 600 }}
          className="w-16 rounded-t-full border border-gold/50 bg-white/70 pb-2 pt-4 text-center shadow-sm"
        >
          <div className="font-serif text-2xl font-semibold tabular-nums text-plum">
            {time ? String(time[unit]).padStart(2, "0") : "--"}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-mauve">{unit}</div>
        </motion.div>
      ))}
    </div>
  );
}
