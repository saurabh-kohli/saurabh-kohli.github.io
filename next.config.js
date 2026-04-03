/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",        // static HTML export for GitHub Pages
  images: { unoptimized: true }, // next/image doesn't work with static export
};

module.exports = nextConfig;
