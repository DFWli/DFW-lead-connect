import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [],
      // No App Router page is defined for "/", so the filesystem check for
      // "/" fails and this afterFiles rewrite serves public/index.html
      // unchanged as the marketing site's root route.
      afterFiles: [{ source: "/", destination: "/index.html" }],
      fallback: [],
    };
  },
};

export default nextConfig;
