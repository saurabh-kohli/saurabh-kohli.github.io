"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const ROW_A = [
  { phrase: "Own the Outcome",    sub: "No spectators, only players"        },
  { phrase: "Write Clean Code",   sub: "Future-you says thank you"          },
  { phrase: "Build with Purpose", sub: "Every line earns its place"         },
];

const ROW_B = [
  { phrase: "Move Markets",       sub: "Build things that shift the needle" },
  { phrase: "Think in Systems",   sub: "Architecture before implementation" },
  { phrase: "Stay Curious",       sub: "The best engineers never stop"      },
  { phrase: "Ship Fast",          sub: "Velocity is a feature"              },
];

// Render 6 copies so the track always looks infinite
const REPEATS = 6;

function StripCard({ phrase, sub }: { phrase: string; sub: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "0.25em",
        marginRight: "clamp(0.5rem, 1.4vw, 1.2rem)",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: '"DK Midnight Chalker", var(--font-display)',
          fontWeight: 400,
          fontSize: "clamp(2rem, 5.5vw, 5rem)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "rgba(255,255,255,0.28)",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {phrase}
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 400,
          fontSize: "clamp(0.62rem, 1vw, 0.78rem)",
          fontStyle: "italic",
          letterSpacing: "0.02em",
          color: "rgba(255,255,255,0.16)",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {sub}
      </span>
    </span>
  );
}

function Sep() {
  return (
    <span
      aria-hidden
      style={{
        color: "var(--red)",
        fontSize: "clamp(0.8rem, 1.5vw, 1.2rem)",
        marginRight: "clamp(0.5rem, 1.4vw, 1.2rem)",
        lineHeight: 1,
        flexShrink: 0,
        opacity: 0.7,
      }}
    >
      ↗
    </span>
  );
}

function Track({
  items,
  trackRef,
}: {
  items: typeof ROW_A;
  trackRef: React.RefObject<HTMLDivElement>;
}) {
  // Flatten REPEATS copies — sep after every item since the strip never ends
  const repeated = Array.from({ length: REPEATS }, (_, gi) =>
    items.map((item, li) => ({ ...item, uid: `${gi}-${li}` }))
  ).flat();

  return (
    <div style={{ overflow: "hidden" }}>
      <div
        ref={trackRef}
        style={{
          display: "inline-flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          willChange: "transform",
        }}
      >
        {repeated.map((item) => (
          <span key={item.uid} style={{ display: "inline-flex", alignItems: "center" }}>
            <StripCard phrase={item.phrase} sub={item.sub} />
            <Sep />
          </span>
        ))}
      </div>
    </div>
  );
}

export function ManifestoStrip() {
  const [hovered, setHovered] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackARef  = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const trackBRef  = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const wrapper = wrapperRef.current;
    const trackA  = trackARef.current;
    const trackB  = trackBRef.current;
    if (!wrapper || !trackA || !trackB) return;

    const ctx = gsap.context(() => {
      // 0.25× viewport width — minimal distance for a very slow, drifting feel
      const travel = window.innerWidth * 0.25;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          // Active the entire time the strip is anywhere in the viewport
          start: "top bottom",
          end: "bottom top",
          scrub: 4,             // high lag — animation drifts lazily behind scroll
          invalidateOnRefresh: true,
        },
      });

      // ROW A — slides left as you scroll down
      tl.fromTo(trackA, { x: 0 }, { x: -travel, ease: "none" }, 0);
      // ROW B — slides right (counter-direction)
      tl.fromTo(trackB, { x: -travel }, { x: 0, ease: "none" }, 0);
    }, wrapper);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapperRef}
      id="values"
      aria-label="What I stand for"
      style={{ position: "relative", zIndex: 2, marginTop: "-130vh" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Callout bubble ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${hovered ? 1 : 0.55})`,
          opacity: hovered ? 1 : 0,
          pointerEvents: "none",
          zIndex: 10,
          background: "var(--red)",
          borderRadius: "9999px",
          padding: "0.65em 1.4em",
          display: "flex",
          alignItems: "center",
          transition: "opacity 0.3s cubic-bezier(0.22,1,0.36,1), transform 0.38s cubic-bezier(0.22,1,0.36,1)",
          boxShadow: "0 4px 32px rgba(245,78,38,0.35)",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "clamp(0.65rem, 1vw, 0.8rem)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#fff",
            animation: hovered ? "bubble-text 0.42s cubic-bezier(0.22,1,0.36,1) both" : "none",
          }}
        >
          What I Stand For
        </span>
      </div>

      {/* ── Two-row strip ── */}
      <div
        style={{
          borderTop: "0.5px solid var(--border)",
          borderBottom: "0.5px solid var(--border)",
          background: "var(--bg-2)",
          filter: hovered ? "blur(1.5px)" : "none",
          transition: "filter 0.3s ease",
        }}
      >
        {/* Row A — slides left */}
        <div style={{ borderBottom: "0.5px solid var(--border)", padding: "clamp(1.2rem, 2.8vw, 2.2rem) 0" }}>
          <Track items={ROW_A} trackRef={trackARef} />
        </div>

        {/* Row B — slides right */}
        <div style={{ padding: "clamp(1.2rem, 2.8vw, 2.2rem) 0" }}>
          <Track items={ROW_B} trackRef={trackBRef} />
        </div>
      </div>

      <style>{`
        @keyframes bubble-text {
          from { opacity: 0; letter-spacing: 0.28em; }
          to   { opacity: 1; letter-spacing: 0.14em; }
        }
      `}</style>
    </div>
  );
}
