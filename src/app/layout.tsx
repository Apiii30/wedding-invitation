import type { Metadata, Viewport } from "next";
import { Amiri, Cormorant_Garamond, Great_Vibes, Montserrat } from "next/font/google";
import { wedding } from "@/data/wedding";
import { photo } from "@/lib/photos";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
// Italic dimuat terpisah: `style: ["normal", "italic"]` memicu error di Turbopack (Next 16.3).
const cormorantItalic = Cormorant_Garamond({
  variable: "--font-cormorant-italic",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });
const script = Great_Vibes({ variable: "--font-script-face", subsets: ["latin"], weight: "400" });
const amiri = Amiri({ variable: "--font-amiri", subsets: ["arabic"], weight: ["400", "700"] });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

const title = `The Wedding of ${wedding.bride.nickname} & ${wedding.groom.nickname}`;
const description = "Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia kami.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "id_ID",
    images: [{ url: photo(wedding.photos.cover).src }],
  },
};

export const viewport: Viewport = {
  themeColor: "#ead3cf",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${cormorant.variable} ${cormorantItalic.variable} ${montserrat.variable} ${script.variable} ${amiri.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
