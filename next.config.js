/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true,
  output: "export",             // static HTML export for GitHub Pages
  images: { unoptimized: true },
  // org Pages site: https://saurabh-kohli.github.io/portfolio
  basePath: isProd ? "/portfolio" : "",
  assetPrefix: isProd ? "/portfolio/" : "",
};

module.exports = nextConfig;
