"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const ITEMS = [
  "AI ARCHITECT",
  "SYSTEMS THINKER",
  "PRODUCT BUILDER",
  "FAIL FAST ADVOCATE",
  "FINTECH PIONEER",
  "DATA DRIVEN",
  "NEXT.JS ENTHUSIAST",
  "USER EXPERIENCE EXPERT",
];

export function Marquee() {
  const track1Ref = useRef<HTMLDivElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const tween1Ref = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // Row 1: left → right scroll
    tween1Ref.current = gsap.to(track1Ref.current, {
      x: "-50%", duration: 28, ease: "none", repeat: -1,
    });

    const slow = () => { tween1Ref.current?.timeScale(0.25); };
    const fast = () => { tween1Ref.current?.timeScale(1); };
    const el = wrapRef.current;
    el?.addEventListener("mouseenter", slow);
    el?.addEventListener("mouseleave", fast);

    return () => {
      el?.removeEventListener("mouseenter", slow);
      el?.removeEventListener("mouseleave", fast);
      tween1Ref.current?.kill();
    };
  }, []);

  const double  = [...ITEMS,   ...ITEMS];

  const Item = ({ label, dim }: { label: string; dim?: boolean }) => (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <span style={{
        fontFamily: '"Essence Purelight", var(--font-display)',
        fontWeight: 400,
        fontSize: "clamp(3.5rem, 7vw, 6rem)",
        letterSpacing: "0.02em",
        textTransform: "uppercase",
        color: dim ? "rgba(10,10,10,0.4)" : "#0a0a0a", // inverted because tape is orange
        whiteSpace: "nowrap",
        padding: "0 2.2rem",
      }}>
        {label}
      </span>
      <span style={{
        color: dim ? "rgba(10,10,10,0.2)" : "rgba(10,10,10,0.8)",
        fontSize: "1.5rem",
        flexShrink: 0,
        fontWeight: 900
      }}>
        ✱
      </span>
    </span>
  );

  return (
    <div
      ref={wrapRef}
      style={{
        overflow: "hidden",
        background: "var(--violet)", // VSK aesthetic uses vibrant purples/limes to balance
        paddingTop: "0.25rem",
        paddingBottom: "0.25rem",
        transform: "rotate(-3deg) scale(1.05)",
        transformOrigin: "center",
        zIndex: 50,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
      }}
    >
      {/* Row 1 — bright, left → scroll */}
      <div ref={track1Ref} style={{ display: "flex", width: "max-content", willChange: "transform" }}>
        {double.map((item, i) => <Item key={i} label={item} />)}
      </div>
    </div>
  );
}

