import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  /* config options here */
};

// Run with `ANALYZE=true npm run build` to emit an interactive bundle map
// to .next/analyze/. Useful for spotting Recharts (≈400 kB minified) or
// other heavy third-party deps before they ship.
const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withAnalyzer(nextConfig);
