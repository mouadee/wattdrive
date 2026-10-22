import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 80, 90],
    // Editorial photography is served from Unsplash (free licence).
    // Replace with your own photos in /public/images and remove this entry if you no longer need it.
    remotePatterns: [new URL("https://images.unsplash.com/**")],
  },
};

export default nextConfig;
