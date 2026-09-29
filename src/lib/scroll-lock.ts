import type Lenis from "lenis";

// Instance Lenis (smooth scroll) didaftarkan oleh shell undangan.
let lenis: Lenis | null = null;
let locks = 0;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
  if (lenis && locks > 0) lenis.stop();
}

/** Kunci scroll halaman (cover, modal, lightbox). Bisa bertumpuk; buka dengan unlockScroll. */
export function lockScroll() {
  locks++;
  lenis?.stop();
  document.documentElement.style.overflow = "hidden";
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  lenis?.start();
  document.documentElement.style.overflow = "";
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo({ top: 0 });
}
