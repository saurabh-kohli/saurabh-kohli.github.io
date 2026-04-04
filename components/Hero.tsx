"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { asset } from "@/lib/asset";

gsap.registerPlugin(ScrollTrigger);

const PROFILE_LINKS = [
  { label: "LinkedIn", url: "https://www.linkedin.com/in/kohlisaurabh" },
  { label: "GitHub",   url: "https://github.com/me-saurabhkohli" },
  { label: "Medium",   url: "https://saurabh-kohli.medium.com" },
  { label: "ORCID",    url: "https://orcid.org/0009-0002-0106-5730" },
];

/* Messages for the photo hover cursor — progressive intervals: 2s, 3s, 4s… */
const CURSOR_MESSAGES = [
  "I'm Saurabh",
  "I'm still Saurabh",
  "Ok! call me Saby",
  "I'm not Virat Kohli",
  "Are you stalking?",
  "Calling 911...",
  "U're my friend",
  "It seems BFF",
] as const;

/* Vibrant accent colours — one per message */
const BUBBLE_COLORS = [
  "#F54E26", // orange-red  — "I'm Saurabh"
  "#a8cc30", // lime        — "I'm still Saurabh"
  "#7c5cfc", // violet      — "Ok! call me Saby"
  "#0ea5e9", // sky         — "I'm not Virat Kohli"
  "#f59e0b", // amber       — "Are you stalking?"
  "#f43f5e", // rose        — "Calling 911..."
  "#a8cc30", // lime        — "U're my friend"
  "#7c5cfc", // violet      — "It seems BFF"
] as const;

/* Cumulative hover-time thresholds for each message (ms).
   1st instant, 2nd after +2s, 3rd +3s, 4th +4s… */
const MSG_THRESHOLDS = [0, 2000, 5000, 9000, 14000, 20000, 27000, 35000] as const;

/* ── Canvas confetti burst (same as Intro) — fires on the BFF message ── */
function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10001";
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.remove(); return; }
  const COLORS = ["#F54E26", "#a8cc30", "#7c5cfc", "#0ea5e9", "#f59e0b", "#f43f5e", "#ffffff"];
  type P = {
    x: number; y: number; vx: number; vy: number;
    color: string; w: number; h: number;
    rot: number; rotV: number; shape: "rect" | "circle";
  };
  const pts: P[] = Array.from({ length: 160 }, () => ({
    x:     Math.random() * canvas.width,
    y:     -Math.random() * 400,
    vx:    (Math.random() - 0.5) * 6,
    vy:    Math.random() * 5 + 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    w:     Math.random() * 12 + 5,
    h:     Math.random() * 7 + 3,
    rot:   Math.random() * 360,
    rotV:  (Math.random() - 0.5) * 14,
    shape: Math.random() > 0.45 ? "rect" : "circle",
  }));
  const start = performance.now();
  const dur   = 3000;
  const tick  = (now: number) => {
    const elapsed = now - start;
    if (elapsed > dur) { canvas.remove(); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const alpha = Math.max(0, 1 - elapsed / dur);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.13; p.rot += p.rotV;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = p.color;
      if (p.shape === "rect") {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function Hero() {
  const sectionRef           = useRef<HTMLElement>(null);
  const photoColRef          = useRef<HTMLDivElement>(null);
  const photoCursorRingRef   = useRef<HTMLDivElement>(null);  // morphing cursor blob
  const photoCursorBubbleRef = useRef<HTMLDivElement>(null);  // callout label
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    // SCSS morph animation bypasses GSAP word cycle math cleanly!
    
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMob   = window.innerWidth <= 640;

    if (reduced) {
      document.querySelectorAll<HTMLElement>(
        ".hero-greeting,.hero-meta,.hero-descriptor,.hero-ctas,.hero-cta-btns,.hero-links,.hero-scroll,.hero-photo-col"
      ).forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      document.querySelectorAll<HTMLElement>(".anim-clip").forEach((el) => {
        el.style.transform = "none";
      });
      // Reduced-motion on mobile: dim photo immediately to settled state
      if (isMob) {
        const photoEl = document.querySelector<HTMLElement>(".hero-photo-col");
        if (photoEl) photoEl.style.opacity = "0.15";
      }
      return;
    }

    // Mobile: start image at full opacity so it loads first; GSAP fades it once text begins
    if (isMob) gsap.set(".hero-photo-col", { opacity: 1 });

    // Set initial hidden states
    gsap.set(".hero-line-1 .anim-clip, .hero-line-2 .anim-clip, .hero-line-3 .anim-clip, .hero-subline .anim-clip", { y: "110%" });
    gsap.set(".hero-greeting, .hero-meta, .hero-descriptor, .hero-ctas, .hero-cta-btns, .hero-links, .hero-scroll", { opacity: 0 });

    // Dynamic delay: if intro was already played this session, reveal immediately
    const already = typeof window !== "undefined" && sessionStorage.getItem("intro-done") === "1";

    let activeTl: gsap.core.Timeline | null = null;
    let introListener: (() => void) | null = null;

    const buildTimeline = (delay: number) => {
      if (activeTl) activeTl.kill();
      activeTl = gsap.timeline({ defaults: { ease: "expo.out" }, delay });
      activeTl
        .fromTo(".hero-greeting",          { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 },  0)
        .fromTo(".hero-meta",              { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 },  0.05)
        .fromTo(".hero-line-1 .anim-clip", { y: "110%" },         { y: "0%", duration: 1.1 },            0.15)
        .fromTo(".hero-line-2 .anim-clip", { y: "110%" },         { y: "0%", duration: 1.1 },            0.20)
        .fromTo(".hero-line-3 .anim-clip", { y: "110%" },         { y: "0%", duration: 1.1 },            0.25)
        .fromTo(".hero-subline .anim-clip",{ y: "110%" },         { y: "0%", duration: 0.9 },            0.35)
        .fromTo(".hero-descriptor",        { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 },  0.45)
        .fromTo(".hero-ctas",              { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5 },  0.55)
        .fromTo(".hero-cta-btns",          { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5 },  0.60)
        .fromTo(".hero-links",             { opacity: 0 },        { opacity: 1, duration: 0.4 },         0.65)
        .fromTo(".hero-scroll",            { opacity: 0 },        { opacity: 0.5, duration: 0.5 },       0.70);
      // Mobile: fade image to ghost as text enters — image loads first, then recedes
      if (isMob) {
        activeTl.to(".hero-photo-col", { opacity: 0.15, duration: 1.8, ease: "power2.inOut" }, 0.12);
      }
    };

    if (already) {
      // Intro already played this session — skip the wait and reveal immediately
      buildTimeline(0.1);
    } else {
      // Wait for intro to complete, with a hard 8s fallback
      introListener = () => buildTimeline(0.3);
      window.addEventListener("intro-complete", introListener, { once: true });
      buildTimeline(8);
    }

    // Mouse parallax on photo (subtle counter-movement)
    const xTo = gsap.quickTo(".hero-photo-col", "x", { duration: 1.2, ease: "power3.out" });
    const yTo = gsap.quickTo(".hero-photo-col", "y", { duration: 1.5, ease: "power3.out" });
    const parallax = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * -18;
      const y = (e.clientY / window.innerHeight - 0.5) * -12;
      xTo(x); yTo(y);
    };
    window.addEventListener("mousemove", parallax);

    // Scroll parallax on photo
    gsap.to(".hero-photo-col", {
      y: 120, // Obvious scroll effect
      opacity: 0.1, // fade out slightly on scroll
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });

    return () => {
      if (activeTl) activeTl.kill();
      if (introListener) window.removeEventListener("intro-complete", introListener);
      window.removeEventListener("mousemove", parallax);
    };
  }, []); // Only run once on mount

  // ── Photo hover cursor — desktop (>1024px) only ───────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth <= 1024) return;
    const ring   = photoCursorRingRef.current;
    const bubble = photoCursorBubbleRef.current;
    if (!ring || !bubble) return;

    let hoverActive  = false;
    let hoverStart: number | null = null;
    let msgTimer: ReturnType<typeof setInterval> | null = null;
    let curIdx       = 0;
    let ringMorphTl: gsap.core.Timeline | null = null;
    // ringHalf tracks half the current ring width so centering stays correct
    // without using xPercent (which causes jumps during width animation)
    let ringHalf = 40; // half of 80px default

    // Park off-screen; CSS class handles initial opacity:0 so React re-renders
    // can never stomp GSAP's live opacity value.
    gsap.set(ring,   { x: -400, y: -400 });
    gsap.set(bubble, { x: -400, y: -400, scale: 0.9 });

    // Ring follows cursor — tighter lag so it visually hugs the cursor
    const rxTo = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
    const ryTo = gsap.quickTo(ring, "y", { duration: 0.4,  ease: "power3.out" });
    // Callout follows cursor very tightly
    const bxTo = gsap.quickTo(bubble, "x", { duration: 0.18, ease: "power2.out" });
    const byTo = gsap.quickTo(bubble, "y", { duration: 0.20, ease: "power2.out" });

    const handleMove = (e: MouseEvent) => {
      const photoEl = document.querySelector<HTMLElement>(".hero-photo-col");
      if (!photoEl) return;
      const rect   = photoEl.getBoundingClientRect();
      const inX    = e.clientX >= rect.left + rect.width * 0.15 && e.clientX <= rect.right;
      const inY    = e.clientY >= rect.top  + rect.height * 0.05 && e.clientY <= rect.bottom - rect.height * 0.05;
      const isOver = inX && inY;

      // Ring always tracks the cursor, offset by ringHalf so it centres on the cursor
      rxTo(e.clientX - ringHalf);
      ryTo(e.clientY - ringHalf);

      // Callout tracks cursor whenever visible
      if (hoverActive) {
        bxTo(e.clientX + 22);
        byTo(e.clientY - 54);
      }

      if (isOver && !hoverActive) {
        // ── ENTER: ring morphs into organic blob, callout appears ───────
        hoverActive = true;
        hoverStart  = Date.now();

        // Switch to large blob half-size immediately so centering is right
        ringHalf = 95; // half of 190px
        rxTo(e.clientX - ringHalf);
        ryTo(e.clientY - ringHalf);

        // Expand ring — do NOT use overwrite:true so quickTo x/y keep running
        if (ringMorphTl) { ringMorphTl.kill(); ringMorphTl = null; }
        gsap.to(ring, {
          width: 190, height: 190,
          borderRadius: "60% 40% 35% 65% / 55% 45% 60% 40%",
          borderColor: "rgba(255,255,255,0.42)",
          borderWidth: "1.5px",
          opacity: 0.5,
          duration: 0.9,
          ease: "power2.out",
        });
        // Blob morph starts AFTER the expand finishes (delay = expand duration)
        // so they don't fight over borderRadius
        ringMorphTl = gsap.timeline({ repeat: -1, delay: 0.9 })
          .to(ring, { borderRadius: "40% 60% 55% 45% / 62% 38% 56% 44%", duration: 3.8, ease: "sine.inOut" })
          .to(ring, { borderRadius: "55% 45% 62% 38% / 42% 58% 47% 53%", duration: 3.2, ease: "sine.inOut" })
          .to(ring, { borderRadius: "68% 32% 42% 58% / 55% 45% 62% 38%", duration: 4.1, ease: "sine.inOut" })
          .to(ring, { borderRadius: "44% 56% 58% 42% / 38% 62% 44% 56%", duration: 3.6, ease: "sine.inOut" })
          .to(ring, { borderRadius: "60% 40% 35% 65% / 55% 45% 60% 40%", duration: 3.5, ease: "sine.inOut" });

        // Callout: position it, then fade/scale in WITHOUT overwrite so bxTo/byTo
        // quickTo tweens are never killed by the opacity animation
        gsap.set(bubble, { x: e.clientX + 22, y: e.clientY - 54, scale: 0.9, opacity: 0 });
        gsap.to(bubble, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.5)" });
        bxTo(e.clientX + 22);
        byTo(e.clientY - 54);

        // Message timer — resets completely on every new hover session
        msgTimer = setInterval(() => {
          const elapsed = hoverStart ? Date.now() - hoverStart : 0;
          let newIdx  = 0;
          for (let i = MSG_THRESHOLDS.length - 1; i >= 0; i--) {
            if (elapsed >= MSG_THRESHOLDS[i]) { newIdx = i; break; }
          }
          newIdx = Math.min(newIdx, CURSOR_MESSAGES.length - 1);
          if (newIdx !== curIdx) {
            curIdx = newIdx;
            setMsgIdx(newIdx);
            if (newIdx === CURSOR_MESSAGES.length - 1) fireConfetti();
          }
        }, 200);

      } else if (!isOver && hoverActive) {
        // ── EXIT: ring contracts back to small circle, everything resets ──
        hoverActive = false;
        hoverStart  = null;
        if (msgTimer)    { clearInterval(msgTimer); msgTimer = null; }
        if (ringMorphTl) { ringMorphTl.kill(); ringMorphTl = null; }

        // Reset message index so next hover always starts from message 0
        curIdx = 0;
        setMsgIdx(0);

        // Restore half-size for small ring
        ringHalf = 40;
        rxTo(e.clientX - ringHalf);
        ryTo(e.clientY - ringHalf);

        gsap.to(ring, {
          width: 80, height: 80,
          borderRadius: "50%",
          borderColor: BUBBLE_COLORS[0],
          borderWidth: "2px",
          opacity: 0.65,
          duration: 0.55,
          ease: "power2.inOut",
          overwrite: true,
        });
        gsap.to(bubble, { opacity: 0, scale: 0.9, duration: 0.2 });
      }

      // Ring visibility: show only near the photo column
      if (!hoverActive) {
        const nearX = e.clientX >= rect.left - 150;
        const nearY = e.clientY >= rect.top && e.clientY <= rect.bottom;
        gsap.to(ring, { opacity: nearX && nearY ? 0.6 : 0, duration: 0.35 });
      }
    };

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (msgTimer)    clearInterval(msgTimer);
      if (ringMorphTl) ringMorphTl.kill();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // mounted state removed — SVG filter is now always server-rendered to avoid hydration mismatch

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="Hero"
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        padding: "0 var(--pad-x)",
        paddingTop: "80px",
        paddingBottom: "var(--space-xl)",
        position: "relative",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      {/* ── LEFT COLUMN ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", zIndex: 10, maxWidth: "60vw" }}>

        {/* Meta bar */}
        <div className="hero-meta" style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
        }}>
          <span className="label" style={{ color: "var(--accent)" }}>AI & ENGINEERING LEADER</span>
          <span className="label" style={{ color: "var(--ink-3)" }}>NEW YORK</span>
        </div>

        {/* Greeting / Manifesto like VSK */}
        <div style={{ marginTop: "1rem" }}>
          <div className="hero-line-1" style={{ overflow: "hidden" }}>
            <h1
              className="anim-clip display"
              style={{
                fontSize: "clamp(3.5rem, 8vw, 10rem)",
                display: "block",
                willChange: "transform",
                color: "var(--ink)",
                transform: "translateY(110%)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 0.9,
              }}
            >
              ENGINEERING
            </h1>
          </div>
          
          <div className="hero-line-2" style={{ overflow: "hidden", marginTop: "clamp(0.2rem, 1vw, 1rem)" }}>
            <div className="anim-clip morphing-box font-gooey" style={{ willChange: "transform" }}>
              {/* Layer 1: SVG Masked Goo Blob Filter */}
              <div className="morphing-layer-goo" />
            </div>
          </div>

          <div className="hero-line-3" style={{ overflow: "hidden" }}>
            <h1
              className="anim-clip display"
              style={{
                fontSize: "clamp(3.5rem, 8vw, 10rem)",
                display: "block",
                willChange: "transform",
                color: "transparent",
                WebkitTextStroke: "1px var(--ink-2)", // highly innovative stroke outline
                transform: "translateY(110%)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 0.9,
              }}
            >
              SYSTEMS.
            </h1>
          </div>
        </div>

        {/* Role subline */}
        <div className="hero-subline" style={{ overflow: "hidden", marginTop: "1rem" }}>
          <p
            className="anim-clip"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.3rem)",
              color: "var(--ink-2)",
              display: "block",
              willChange: "transform",
              transform: "translateY(110%)",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
            }}
          >
            SVP Engineering at <span style={{color: "var(--ink)"}}>BNY</span>. 18 years shipping products at scale.
          </p>
        </div>

        {/* Bio paragraph */}
        <p
          className="hero-descriptor"
          style={{
            color: "rgba(244,240,230,0.52)",
            fontSize: "clamp(0.88rem, 1.05vw, 1rem)",
            lineHeight: 1.8,
            maxWidth: 460,
          }}
        >
          Architect of AI-powered products at BNY, Morgan Stanley &amp; American Express.
          I build systems that move markets —{" "}
          <a
            href="#writing"
            style={{ borderBottom: "0.5px solid currentColor", transition: "color 0.2s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--red)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(244,240,230,0.52)")}
          >
            and write about them
          </a>.
        </p>

        {/* Role pills */}
        <div
          className="hero-ctas"
          style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap" }}
        >
          {[
            { label: "AI Architect", color: "var(--lime)",   dim: "rgba(168,204,48,0.14)"   },
            { label: "Full Stack",   color: "var(--violet)", dim: "rgba(124,92,252,0.14)"   },
            { label: "Fintech",      color: "var(--sky)",    dim: "rgba(14,165,233,0.14)"   },
            { label: "BNY",          color: "var(--amber)",  dim: "rgba(245,158,11,0.14)"   },
          ].map(pill => (
            <span key={pill.label} style={{
              fontSize: "0.7rem",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              letterSpacing: "0.08em",
              padding: "5px 13px",
              borderRadius: "100px",
              border: `1px solid ${pill.color}`,
              color: pill.color,
              background: pill.dim,
              textTransform: "uppercase",
            }}>
              {pill.label}
            </span>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hero-cta-btns" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <a href="#work" className="btn-filled">View work</a>
          <a
            href="https://saurabh-kohli.medium.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              border: "1.5px solid rgba(244,240,230,0.3)",
              color: "rgba(244,240,230,0.8)",
              padding: "0.72rem 1.8rem",
              borderRadius: "100px",
              fontFamily: "var(--font-body)",
              fontSize: "0.82rem",
              fontWeight: 600,
              display: "inline-block",
              transition: "border-color 0.25s, color 0.25s",
              letterSpacing: "0.04em",
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "#fff"; el.style.color = "#fff"; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "rgba(244,240,230,0.3)"; el.style.color = "rgba(244,240,230,0.8)"; }}
          >
            Read on Medium ↗
          </a>
        </div>

        {/* Social links */}
        <div
          className="hero-links"
          style={{ display: "flex", gap: "1.5rem", fontSize: "0.68rem", color: "rgba(244,240,230,0.35)", flexWrap: "wrap" }}
        >
          {PROFILE_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ transition: "color 0.2s", letterSpacing: "0.06em" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(244,240,230,0.85)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(244,240,230,0.35)")}
            >
              ↗ {l.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── RIGHT COLUMN — Photo ── */}
      <div
        className="hero-photo-col"
        ref={photoColRef}
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: "clamp(400px, 60vw, 900px)",
          height: "clamp(500px, 85vh, 1000px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {/* Transparent photo — standing from bottom */}
        <div style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}>
          <Image
            src={asset("/saurabh-transparent.png")}
            alt="Saurabh Kohli"
            fill
            style={{
              objectFit: "contain",
              objectPosition: "bottom right",
            }}
            priority
          />
        </div>
      </div>

      {/* Scroll hint */}
      <div
        className="hero-scroll"
        style={{
          position: "absolute",
          bottom: "2rem",
          right: "var(--pad-x)",
          fontSize: "0.6rem",
          color: "rgba(244,240,230,0.28)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          writingMode: "vertical-rl",
        }}
      >
        Scroll ↓
      </div>

      {/* Embedded SVG Filters — zero-size so no layout impact */}
      <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }} aria-hidden>
        <defs>
          <filter id="hero-morph-threshold">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feColorMatrix in="blur" mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 18 -7" result="goo" />
          </filter>
        </defs>
      </svg>

      {/* ── Cursor blob ring — follows mouse, morphs into organic blob on hover ── */}
      <div
        ref={photoCursorRingRef}
        data-photo-cursor
        className="photo-cursor-ring"
        style={{
          position:      "fixed",
          left:          0,
          top:           0,
          width:         "80px",
          height:        "80px",
          borderRadius:  "50%",
          border:        `2px solid ${BUBBLE_COLORS[0]}`,
          boxSizing:     "border-box",
          pointerEvents: "none",
          zIndex:        9998,
          willChange:    "transform, width, height, border-radius",
        }}
      />

      {/* ── Callout label — follows cursor, simple dark pill with tail ── */}
      <div
        ref={photoCursorBubbleRef}
        data-photo-cursor
        className="photo-cursor-bubble"
        style={{
          position:      "fixed",
          left:          0,
          top:           0,
          pointerEvents: "none",
          zIndex:        9999,
        }}
      >
        <div className="callout-bubble">
          <span key={`lbl-${msgIdx}`} className="callout-text">
            {CURSOR_MESSAGES[msgIdx]}
          </span>
        </div>
      </div>

      <style>{`
        /* Initial hidden state — GSAP controls live opacity via inline style,
           so we use CSS classes (not JSX style prop) to avoid React stomping
           GSAP's value on every re-render (e.g. when msgIdx changes). */
        .photo-cursor-ring   { opacity: 0; }
        .photo-cursor-bubble { opacity: 0; }

        /* ── Callout bubble — plain dark pill with downward tail ────────────── */
        .callout-bubble {
          position: relative;
          display: inline-block;
          padding: 8px 16px;
          border-radius: 12px;
          background: rgba(10, 10, 14, 0.88);
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          border: 0.5px solid rgba(255,255,255,0.1);
          white-space: nowrap;
        }
        /* Tail pointing down-left toward the cursor */
        .callout-bubble::after {
          content: '';
          position: absolute;
          left: 16px;
          bottom: -9px;
          width: 0; height: 0;
          border-left:  9px solid transparent;
          border-right: 9px solid transparent;
          border-top:   10px solid rgba(10,10,14,0.88);
        }
        /* Text: slide-up on each message change */
        .callout-text {
          display: inline-block;
          font-size: 0.73rem;
          font-weight: 700;
          color: rgba(244,240,230,0.9);
          letter-spacing: 0.055em;
          font-family: var(--font-body);
          white-space: nowrap;
          animation: calloutIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes calloutIn {
          from { opacity: 0; transform: translateY(6px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          #hero { grid-template-columns: 1fr !important; padding-top: 96px !important; }
          .hero-photo-col { display: none !important; }
          [data-photo-cursor] { display: none !important; }
        }
        @media (max-width: 640px) {
          .hero-photo-col {
            display: block !important; opacity: 1;
            width: 100% !important; pointer-events: none;
          }
          [data-photo-cursor] { display: none !important; }
        }
        @media (max-width: 1024px) {
          [data-photo-cursor] { display: none !important; }
        }
      `}</style>
    </section>
  );
}

