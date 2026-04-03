/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",             // static HTML export for GitHub Pages
  images: { unoptimized: true },
  // root org Pages site: https://saurabh-kohli.github.io — no basePath needed
};

module.exports = nextConfig;
