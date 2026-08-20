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
  async headers() {
    // The marketing page is actively iterated on; don't let browsers/CDNs
    // cache it aggressively, or visitors (and testers) can be stuck on a
    // stale version after a deploy.
    return [
      {
        source: "/",
        headers: [
          { key: "Cache-Control", value: "no-cache, must-revalidate" },
        ],
      },
      {
        source: "/index.html",
        headers: [
          { key: "Cache-Control", value: "no-cache, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
