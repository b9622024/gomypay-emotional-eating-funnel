import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "1mb" } },
  async rewrites() {
    return [{ source: "/game-assets/badges/:file*", destination: "/game-assets/characters/badges/:file*" }];
  },
};
export default nextConfig;
