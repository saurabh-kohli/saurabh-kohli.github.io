"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { gsap } from "gsap";
import { usePortraitContour } from "./hooks/usePortraitContour";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Three overlapping sinusoidal waves applied per contour-point per frame.
 * Mixing incommensurate frequencies + speeds gives organic, never-repeating motion.
 *
 * `amp`   — peak displacement in *screen pixels*
 * `freq`  — spatial frequency (oscillations around the full perimeter)
 * `speed` — temporal angular speed (radians per second)
 */
const WAVE_PARAMS = [
  { amp:  8, freq: 3.0, speed: 0.50 }, // slow main wave  — 3 humps around body
  { amp:  4, freq: 5.3, speed: 0.73 }, // mid secondary
  { amp:  2, freq: 8.1, speed: 1.15 }, // fast micro-tremor
] as const;

/** Catmull-Rom spline tension (0 = straight lines, 0.5 = loose, 0.35 = balanced) */
const TENSION = 0.35;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PortraitCursorProps {
  /**
   * Transparent PNG used for both:
   * - per-pixel canvas hit-testing (is the cursor over a non-transparent pixel?)
   * - silhouette-contour extraction (which pixels form the body edge?)
   *
   * Example: `"/saurabh-transparent.png"`
   */
  imageSrc: string;
  /** Ref to the photo-column container `<div>` in Hero.  The component reads
   *  its `getBoundingClientRect()` every rAF frame to position the SVG overlay. */
  containerRef: RefObject<HTMLDivElement>;
  /** Progressive hover messages — displayed in the Figma badge. */
  messages: readonly string[];
  /** One accent colour per message (hex / rgb / named). */
  colors: readonly string[];
  /**
   * Cumulative hover-time thresholds in ms — one per message.
   * `messages[i]` appears when total hover duration ≥ `thresholds[i]`.
   * The first entry is always `0` (shown immediately on hover).
   */
  thresholds: readonly number[];
  /** Called once when the last message is reached (e.g. to fire confetti). */
  onLastMessage?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure helpers (module-level, no closures over component state)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes the screen-space bounding rect of an image rendered with
 * `object-fit: contain; object-position: bottom right` inside its container.
 */
function getRenderedRect(container: DOMRect, natW: number, natH: number) {
  const scale = Math.min(container.width / natW, container.height / natH);
  const rW    = natW * scale;
  const rH    = natH * scale;
  return {
    left:   container.left + container.width  - rW,
    top:    container.top  + container.height - rH,
    right:  container.left + container.width,
    bottom: container.top  + container.height,
    width:  rW,
    height: rH,
  };
}

/**
 * Builds a closed, smooth SVG path string through an array of screen-space
 * points using a Catmull-Rom → cubic-Bézier conversion.
 *
 * The algorithm for each segment P[i] → P[i+1]:
 * ```
 * CP1 = P[i]   + (P[i+1] − P[i−1]) × tension
 * CP2 = P[i+1] − (P[i+2] − P[i])   × tension
 * ```
 * Indices are wrapped modulo N for a seamless closed curve.
 */
function catmullRomPath(
  pts: ReadonlyArray<{ sx: number; sy: number }>,
  tension = TENSION,
): string {
  const n = pts.length;
  if (n < 3) return "";

  let d = `M ${pts[0].sx.toFixed(1)} ${pts[0].sy.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];

    const cp1x = p1.sx + (p2.sx - p0.sx) * tension;
    const cp1y = p1.sy + (p2.sy - p0.sy) * tension;
    const cp2x = p2.sx - (p3.sx - p1.sx) * tension;
    const cp2y = p2.sy - (p3.sy - p1.sy) * tension;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)},${cp2x.toFixed(1)} ${cp2y.toFixed(1)},${p2.sx.toFixed(1)} ${p2.sy.toFixed(1)}`;
  }
  return d + " Z";
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `PortraitCursor` — a self-contained, reusable overlay that replaces the
 * default OS cursor when hovering over a portrait photograph.
 *
 * ### Two visual states
 *
 * **Free** (cursor is anywhere else on the page)
 *   The component is invisible.  The default OS cursor is not hidden globally
 *   so other interactive elements remain accessible.
 *
 * **Portrait-hover** (cursor is over a non-transparent pixel of the portrait)
 *   - A **Figma-style arrow + badge** appears at the cursor tip and shows
 *     progressive messages as the user continues hovering.
 *   - A **animated silhouette contour** — a thin 1 px line — appears around
 *     the portrait.  The contour is the actual pixel-traced body edge offset
 *     outward by a multi-layered sinusoidal wave that produces an organic,
 *     flowing effect.
 *
 * ### Implementation notes
 * - Contour geometry is extracted once on image load via `usePortraitContour`.
 * - All per-frame work (displacement + Bézier path) is done imperatively via
 *   `requestAnimationFrame` and `element.setAttribute` — **zero React state
 *   updates inside the rAF loop**.
 * - The Bézier `d` attribute is never set as a JSX prop, so React re-renders
 *   (triggered only by `msgIdx` changing) never stomp the animated path.
 * - Contour intensity (`0 → 1`) is lerped inside the rAF loop for a smooth
 *   fade in/out instead of a separate animation loop.
 */
export function PortraitCursor({
  imageSrc,
  containerRef,
  messages,
  colors,
  thresholds,
  onLastMessage,
}: PortraitCursorProps) {
  // ── React state — only msgIdx drives re-renders ─────────────────────────
  const [msgIdx, setMsgIdx] = useState(0);

  // ── Imperative DOM refs — written by rAF / GSAP, never by React ─────────
  const cursorDivRef   = useRef<HTMLDivElement>(null);
  const contourPathRef = useRef<SVGPathElement>(null);

  // Colour ref for the contour stroke — updated imperatively to avoid re-render
  const strokeColorRef = useRef(colors[0]);

  // ── Contour data (populated asynchronously after image load) ────────────
  const contourRef = usePortraitContour(imageSrc);

  // ── Main effect — sets up hit-testing, GSAP cursor, and the rAF loop ────
  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth <= 1024) return;

    const cursor      = cursorDivRef.current;
    const contourPath = contourPathRef.current;
    if (!cursor || !contourPath) return;

    // ── 1. Offscreen canvas for per-pixel alpha hit-testing ──────────────
    const offscreen = document.createElement("canvas");
    const offCtx    = offscreen.getContext("2d", { willReadFrequently: true });
    let hitLoaded = false;
    let hitNatW = 1, hitNatH = 1;

    const hitImg    = new window.Image();
    hitImg.onload   = () => {
      hitNatW            = hitImg.naturalWidth;
      hitNatH            = hitImg.naturalHeight;
      offscreen.width    = hitNatW;
      offscreen.height   = hitNatH;
      offCtx?.drawImage(hitImg, 0, 0);
      hitLoaded          = true;
    };
    hitImg.src = imageSrc;

    const isOverPerson = (mx: number, my: number): boolean => {
      if (!hitLoaded || !offCtx || !containerRef.current) return false;
      const cr = containerRef.current.getBoundingClientRect();
      const rr = getRenderedRect(cr, hitNatW, hitNatH);
      if (mx < rr.left || mx > rr.right || my < rr.top || my > rr.bottom) return false;
      const px = Math.floor((mx - rr.left) / rr.width  * hitNatW);
      const py = Math.floor((my - rr.top)  / rr.height * hitNatH);
      if (px < 0 || px >= hitNatW || py < 0 || py >= hitNatH) return false;
      try { return offCtx.getImageData(px, py, 1, 1).data[3] > 25; }
      catch { return false; }
    };

    // ── 2. GSAP cursor — parks off-screen, tracks mouse with micro-lag ───
    gsap.set(cursor, { x: -600, y: -600, opacity: 0 });
    const cxTo = gsap.quickTo(cursor, "x", { duration: 0.07, ease: "power1.out" });
    const cyTo = gsap.quickTo(cursor, "y", { duration: 0.07, ease: "power1.out" });

    // ── 3. rAF contour animation ─────────────────────────────────────────
    // `hoverIntensity` is lerped toward `targetIntensity` every frame.
    // The contour path opacity and Catmull-Rom path are both written directly
    // to the DOM — no React state involved.
    let hoverIntensity  = 0;   // 0 = invisible, 1 = fully visible
    let targetIntensity = 0;
    let rafId           = 0;

    const frame = (timestamp: number) => {
      rafId = requestAnimationFrame(frame);

      // Lerp intensity for smooth fade in/out
      hoverIntensity += (targetIntensity - hoverIntensity) * 0.09;

      const cd = contourRef.current;
      if (!cd.ready || hoverIntensity < 0.005 || !containerRef.current) {
        // Keep path invisible when not hovering (avoids stale path flash)
        if (hoverIntensity < 0.005) contourPath.style.opacity = "0";
        return;
      }

      const t  = timestamp / 1000; // seconds
      const cr = containerRef.current.getBoundingClientRect();
      const rr = getRenderedRect(cr, cd.dW, cd.dH);

      // Scale factors from pixel space → screen space (for normal conversion)
      const scaleX = rr.width  / cd.dW;
      const scaleY = rr.height / cd.dH;

      const N         = cd.points.length;
      const displaced = cd.points.map((pt, i) => {
        // Fractional phase position around the full perimeter [0, 2π]
        const phase = (i / N) * Math.PI * 2;

        // Accumulate displacement from all wave layers
        let disp = 0;
        for (const w of WAVE_PARAMS) {
          disp += w.amp * Math.sin(w.freq * phase - w.speed * t);
        }

        // --- Normal in screen space ---
        // pt.nx / pt.ny are unit vectors in downsampled-pixel space.
        // Converting to screen space introduces non-uniform scale (scaleX ≠ scaleY
        // for non-square images), so we re-normalise after the scale to obtain a
        // true screen-space unit normal, then multiply by the displacement.
        const snx = pt.nx * scaleX;
        const sny = pt.ny * scaleY;
        const mag = Math.hypot(snx, sny) || 1;
        const dx  = (snx / mag) * disp;
        const dy  = (sny / mag) * disp;

        return {
          sx: rr.left + (pt.px / cd.dW) * rr.width  + dx,
          sy: rr.top  + (pt.py / cd.dH) * rr.height + dy,
        };
      });

      const d = catmullRomPath(displaced);
      if (d) {
        contourPath.setAttribute("d", d);
        contourPath.setAttribute("stroke", strokeColorRef.current);
        contourPath.style.opacity = String(Math.min(hoverIntensity, 0.92));
      }
    };

    rafId = requestAnimationFrame(frame);

    // ── 4. Mouse-move handler — hover detection + Figma cursor ──────────
    let hoverActive = false;
    let hoverStart: number | null = null;
    let msgTimer: ReturnType<typeof setInterval> | null = null;
    let curIdx = 0;

    const handleMove = (e: MouseEvent) => {
      cxTo(e.clientX);
      cyTo(e.clientY);
      const isOver = isOverPerson(e.clientX, e.clientY);

      if (isOver && !hoverActive) {
        // ── ENTER ────────────────────────────────────────────────────
        hoverActive       = true;
        hoverStart        = Date.now();
        targetIntensity   = 1;

        gsap.set(cursor, { scale: 0.85, opacity: 0 });
        gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.28, ease: "back.out(1.6)" });

        msgTimer = setInterval(() => {
          const elapsed = hoverStart ? Date.now() - hoverStart : 0;
          let ni = 0;
          for (let i = thresholds.length - 1; i >= 0; i--) {
            if (elapsed >= thresholds[i]) { ni = i; break; }
          }
          ni = Math.min(ni, messages.length - 1);
          if (ni !== curIdx) {
            curIdx = ni;
            setMsgIdx(ni);
            strokeColorRef.current = colors[ni];
            if (ni === messages.length - 1) onLastMessage?.();
          }
        }, 200);

      } else if (!isOver && hoverActive) {
        // ── EXIT ─────────────────────────────────────────────────────
        hoverActive     = false;
        hoverStart      = null;
        targetIntensity = 0;

        if (msgTimer) { clearInterval(msgTimer); msgTimer = null; }
        curIdx = 0;
        setMsgIdx(0);
        strokeColorRef.current = colors[0];

        gsap.to(cursor, { opacity: 0, scale: 0.85, duration: 0.22 });
      }
    };

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (msgTimer) clearInterval(msgTimer);
      cancelAnimationFrame(rafId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Full-viewport SVG — contour path lives here ────────────────── */}
      {/*
        The <path> has NO `d` prop — React never writes to that attribute,
        so the rAF loop can imperatively call setAttribute("d", ...) without
        the attribute being wiped on React re-renders.

        `stroke` is also written imperatively (via strokeColorRef) for the
        same reason.  Only `fill`, `strokeWidth`, and `strokeLinecap` are
        managed by React because they never change.
      */}
      <svg
        aria-hidden
        style={{
          position:      "fixed",
          inset:         0,
          width:         "100vw",
          height:        "100vh",
          pointerEvents: "none",
          zIndex:        9998,
          overflow:      "visible",
        }}
      >
        <path
          ref={contourPathRef}
          fill="none"
          stroke={colors[0]}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0 }}
        />
      </svg>

      {/* ── Figma-style cursor: arrow + badge ──────────────────────────── */}
      <div
        ref={cursorDivRef}
        data-photo-cursor
        className="portrait-cursor-bubble"
        style={{
          position:      "fixed",
          left:          0,
          top:           0,
          pointerEvents: "none",
          zIndex:        9999,
        }}
      >
        {/* Cursor arrow — tip aligns with mouse position */}
        <svg
          width="18"
          height="22"
          viewBox="0 0 18 22"
          aria-hidden
          style={{ display: "block", flexShrink: 0 }}
        >
          <path
            d="M 1 1 L 1 19 L 5.5 14 L 9 21 L 11.5 20 L 8 13 L 14 13 Z"
            fill={colors[msgIdx]}
          />
          <path
            d="M 1 1 L 1 19 L 5.5 14 L 9 21 L 11.5 20 L 8 13 L 14 13 Z"
            fill="none"
            stroke="rgba(0,0,0,0.28)"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </svg>

        {/* Coloured badge pill below the arrow shaft */}
        <div
          className="portrait-cursor-badge"
          style={{ background: colors[msgIdx] }}
        >
          <span key={`lbl-${msgIdx}`} className="portrait-cursor-badge-text">
            {messages[msgIdx]}
          </span>
        </div>
      </div>

      {/* ── Scoped styles ──────────────────────────────────────────────── */}
      <style>{`
        /* Park off-screen until GSAP animates it in */
        .portrait-cursor-bubble { opacity: 0; }

        .portrait-cursor-badge {
          position:   absolute;
          top:        17px;
          left:       15px;
          padding:    4px 10px;
          border-radius: 5px;
          white-space: nowrap;
          line-height: 1;
        }

        .portrait-cursor-badge-text {
          display:        inline-block;
          font-size:      0.68rem;
          font-weight:    700;
          color:          #fff;
          letter-spacing: 0.045em;
          font-family:    var(--font-body, sans-serif);
          white-space:    nowrap;
          animation:      portraitBadgeIn 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes portraitBadgeIn {
          from { opacity: 0; transform: translateY(4px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }

        /* Hide on tablet / mobile — contour is desktop-only */
        @media (max-width: 1024px) {
          [data-photo-cursor]   { display: none !important; }
        }
      `}</style>
    </>
  );
}
