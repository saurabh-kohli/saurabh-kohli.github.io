/**
 * Prefix a /public asset path with the basePath so it works both in
 * local dev (basePath = "") and on GitHub Pages (basePath = "/portfolio").
 *
 * Usage:  src={asset("/saurabh-transparent.png")}
 *         src={asset("/awards/bny.svg")}
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  // path must start with /
  return `${BASE}${path}`;
}
