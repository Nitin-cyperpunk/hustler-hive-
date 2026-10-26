import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@hustlers-hive/ui", "@hustlers-hive/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fpfdiwvglralkjenbvjx.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
