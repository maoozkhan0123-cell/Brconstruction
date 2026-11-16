import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  typescript: { tsconfigPath: "tsconfig.next.json" },
};

export default nextConfig;
