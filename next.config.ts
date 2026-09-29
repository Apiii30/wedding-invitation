import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan membuka server development dari HP di jaringan WiFi yang sama (mis. http://192.168.1.7:3000).
  // Tanpa ini Next.js memblokir script development, sehingga musik & animasi tidak berjalan.
  allowedDevOrigins: ["192.168.*.*"],
  images: {
    qualities: [75, 85],
  },
};

export default nextConfig;
