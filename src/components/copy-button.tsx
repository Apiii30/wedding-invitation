"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text, label = "Salin", className = "" }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback untuk browser lama / konteks non-HTTPS.
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" onClick={copy} className={`inline-flex items-center gap-1.5 ${className}`}>
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Tersalin" : label}
    </button>
  );
}
