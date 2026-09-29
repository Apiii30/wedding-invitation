"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};

/**
 * Render isi langsung ke <body>. Wajib untuk overlay `position: fixed` (modal, lightbox):
 * jika ada leluhur yang memakai transform (animasi scroll), fixed akan menempel ke leluhur itu, bukan ke layar.
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return mounted ? createPortal(children, document.body) : null;
}
