import type { NextConfig } from "next";
import path from "node:path";

const supabaseImageHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;
const supabaseImageHosts = Array.from(
  new Set(
    [
      supabaseImageHost,
      "rtaciuravymbqhvjuqyi.supabase.co",
    ].filter((host): host is string => Boolean(host)),
  ),
);

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: supabaseImageHosts.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/storage/v1/object/public/shorts-toons/**",
    })),
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
