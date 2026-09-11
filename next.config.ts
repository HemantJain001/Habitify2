import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/interview-prep",
        destination: "/interview-prep.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
