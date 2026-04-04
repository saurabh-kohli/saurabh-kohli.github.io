"use client";

import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ContourPoint {
  /** X position in downsampled-canvas pixel space (0 … dW) */
  px: number;
  /** Y position in downsampled-canvas pixel space (0 … dH) */
  py: number;
  /** Outward unit-normal X — computed in pixel space so it is geometrically correct */
  nx: number;
  /** Outward unit-normal Y */
  ny: number;
}

export interface ContourData {
  points: ContourPoint[];
  /** Width of the downsampled canvas used for extraction */
  dW: number;
  /** Height of the downsampled canvas used for extraction */
  dH: number;
  ready: boolean;
}

const EMPTY: ContourData = { points: [], dW: 1, dH: 1, ready: false };

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `usePortraitContour` — extracts an ordered, smoothed silhouette contour from
 * a transparent PNG and returns it as a stable `MutableRefObject` so that
 * animation loops can read it every frame without ever triggering a re-render.
 *
 * ### Algorithm
 * 1. Load the image into an offscreen canvas capped at `PROCESS_H` pixels tall
 *    (fast `getImageData` budget).
 * 2. **Scanline sweep** — for each sampled row find the leftmost (`lx`) and
 *    rightmost (`rx`) pixel whose alpha > 25.  This gives two edge arrays that
 *    trace the visible silhouette with no assumption about shape.
 * 3. **Moving-average smoothing** on the x-arrays to suppress hair-strand and
 *    finger noise while keeping the body curve intact.
 * 4. **CW-wound contour** — right-side top→bottom then left-side bottom→top.
 * 5. **Outward unit normals** — computed in pixel space (isotropic) from the
 *    local tangent: `n = (ty, −tx) / |tangent|`.
 *    For CW winding, this always points away from the body:
 *    - right edge  →  tangent points down  →  normal points right  ✓
 *    - left  edge  →  tangent points up    →  normal points left   ✓
 *    - top         →  tangent points right →  normal points up     ✓
 *    - bottom      →  tangent points left  →  normal points down   ✓
 *
 * ### Screen-space conversion (in the animation loop)
 * ```ts
 * // point → screen
 * const sx = rr.left + (pt.px / cd.dW) * rr.width;
 * const sy = rr.top  + (pt.py / cd.dH) * rr.height;
 *
 * // normal direction → screen (renormalise after non-uniform scale)
 * const snx = pt.nx * (rr.width  / cd.dW);
 * const sny = pt.ny * (rr.height / cd.dH);
 * const mag = Math.hypot(snx, sny) || 1;
 * const dx  = (snx / mag) * dispPx;
 * const dy  = (sny / mag) * dispPx;
 * ```
 *
 * @param src       URL of the transparent PNG (e.g. `/saurabh-transparent.png`)
 * @param numRows   Number of scanlines to sample (default 140 → ~280 contour pts)
 * @param smoothR   Half-window radius for the moving-average pass (default 8)
 */
export function usePortraitContour(
  src: string,
  numRows = 140,
  smoothR = 8,
): React.MutableRefObject<ContourData> {
  const ref = useRef<ContourData>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    const PROCESS_H = 600; // cap: keeps getImageData budget reasonable

    const img = new window.Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (cancelled) return;

      const natW = img.naturalWidth;
      const natH = img.naturalHeight;

      // Down-scale to PROCESS_H (preserving aspect ratio)
      const scale = Math.min(1, PROCESS_H / natH);
      const dW    = Math.round(natW * scale);
      const dH    = Math.round(natH * scale);

      const cv  = document.createElement("canvas");
      cv.width  = dW;
      cv.height = dH;
      const ctx = cv.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, dW, dH);

      // ── 1. Scanline sweep ───────────────────────────────────────────
      const rowStep = Math.max(1, Math.floor(dH / numRows));

      const leftXs:  number[] = [];
      const rightXs: number[] = [];
      const ys:      number[] = [];

      for (let y = 0; y < dH; y += rowStep) {
        const { data } = ctx.getImageData(0, y, dW, 1);
        let lx = -1, rx = -1;
        for (let x = 0; x < dW; x++) {
          if (data[x * 4 + 3] > 25) {
            if (lx === -1) lx = x;
            rx = x;
          }
        }
        if (lx !== -1) {
          leftXs.push(lx);
          rightXs.push(rx);
          ys.push(y);
        }
      }

      if (ys.length < 6) return; // degenerate image — abort

      // ── 2. Smooth x-arrays with a moving average ────────────────────
      const mavg = (arr: number[]): number[] =>
        arr.map((_, i) => {
          let s = 0, c = 0;
          for (let k = -smoothR; k <= smoothR; k++) {
            const idx = i + k;
            if (idx >= 0 && idx < arr.length) { s += arr[idx]; c++; }
          }
          return s / c;
        });

      const sL = mavg(leftXs);
      const sR = mavg(rightXs);
      const n  = ys.length;

      // ── 3. Build CW ordered contour in pixel space ──────────────────
      const raw: Array<{ px: number; py: number }> = [];
      for (let i = 0; i < n; i++)
        raw.push({ px: sR[i], py: ys[i] }); // right side: top → bottom
      for (let i = n - 1; i >= 0; i--)
        raw.push({ px: sL[i], py: ys[i] }); // left  side: bottom → top

      const total = raw.length;

      // ── 4. Outward normals in pixel space (CW: n = (ty, −tx) / |t|) ─
      const points: ContourPoint[] = raw.map((p, i) => {
        const prev = raw[(i - 1 + total) % total];
        const next = raw[(i + 1) % total];
        const tx   = next.px - prev.px;
        const ty   = next.py - prev.py;
        const mag  = Math.hypot(tx, ty) || 1;
        return { px: p.px, py: p.py, nx: ty / mag, ny: -tx / mag };
      });

      ref.current = { points, dW, dH, ready: true };
    };

    img.src = src;
    return () => { cancelled = true; };
  }, [src, numRows, smoothR]);

  return ref;
}
