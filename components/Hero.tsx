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

/* Messages for the photo hover cursor — cycle every 30s of accumulated hover */
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

export function Hero() {
  const sectionRef     = useRef<HTMLElement>(null);
  const photoColRef    = useRef<HTMLDivElement>(null);
  const photoCursorRef = useRef<HTMLDivElement>(null);
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
    const cursor = photoCursorRef.current;
    if (!cursor) return;

    const MSG_STEP_MS = 30_000; // advance message every 30 s of accumulated hover
    let hoverActive  = false;
    let hoverStart: number | null = null;
    let accumMs      = 0;
    let msgTimer: ReturnType<typeof setInterval> | null = null;
    let curIdx       = 0;

    // Start slightly small so the hover-in scale: 1 gives a satisfying pop
    gsap.set(cursor, { scale: 0.85 });

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.55, ease: "power3.out" });

    const handleMove = (e: MouseEvent) => {
      const photoEl = document.querySelector<HTMLElement>(".hero-photo-col");
      if (!photoEl) return;

      const rect  = photoEl.getBoundingClientRect();
      // Trim 15 % from the left edge (transparent area) for a tighter hit zone
      const inX   = e.clientX >= rect.left + rect.width * 0.15 && e.clientX <= rect.right;
      const inY   = e.clientY >= rect.top  + rect.height * 0.05 && e.clientY <= rect.bottom - rect.height * 0.05;
      const isOver = inX && inY;

      if (isOver && !hoverActive) {
        hoverActive  = true;
        hoverStart   = Date.now();
        gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" });
        msgTimer = setInterval(() => {
          const total = accumMs + (hoverStart ? Date.now() - hoverStart : 0);
          const idx   = Math.min(Math.floor(total / MSG_STEP_MS), CURSOR_MESSAGES.length - 1);
          if (idx !== curIdx) { curIdx = idx; setMsgIdx(idx); }
        }, 2000);
      } else if (!isOver && hoverActive) {
        hoverActive = false;
        if (hoverStart) { accumMs += Date.now() - hoverStart; hoverStart = null; }
        if (msgTimer) { clearInterval(msgTimer); msgTimer = null; }
        gsap.to(cursor, { opacity: 0, scale: 0.85, duration: 0.25 });
      }

      if (isOver) {
        // Gentle magnetic pull toward the face area (upper portion of photo)
        const faceCx = rect.left + rect.width  * 0.58;
        const faceCy = rect.top  + rect.height * 0.28;
        xTo(e.clientX + (faceCx - e.clientX) * 0.1);
        yTo(e.clientY + (faceCy - e.clientY) * 0.07);
      }
    };

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (msgTimer) clearInterval(msgTimer);
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

      {/* Embedded SVG Filter for Gooey Text — always rendered; zero-size so no layout impact */}
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
          {/* Noisy displacement filter for the photo hover cursor ring */}
          <filter id="cursor-noise-filter" x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.028 0.028"
              numOctaves="3"
              result="turb"
            >
              <animate
                attributeName="baseFrequency"
                values="0.028 0.028;0.052 0.044;0.030 0.020;0.028 0.028"
                dur="5s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="turb"
              scale="16"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* ── Photo hover cursor — desktop only ──────────────────────────── */}
      <div
        ref={photoCursorRef}
        data-photo-cursor
        style={{
          position:      "fixed",
          left:          "-55px",   // GSAP x=clientX → ring center lands on mouse
          top:           "-55px",
          width:         "110px",
          pointerEvents: "none",
          zIndex:        9999,
          opacity:       0,
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
        }}
      >
        {/* Noisy ring */}
        <div style={{
          width:        "110px",
          height:       "110px",
          borderRadius: "50%",
          border:       "1.5px solid rgba(255,255,255,0.85)",
          filter:       "url(#cursor-noise-filter)",
          willChange:   "filter",
          flexShrink:   0,
        }} />
        {/* Text bubble — re-mounts on each message change to trigger fade-in */}
        <div
          key={msgIdx}
          style={{
            marginTop:      "10px",
            fontSize:       "0.72rem",
            fontWeight:     600,
            color:          "#fff",
            background:     "rgba(10,10,10,0.65)",
            padding:        "4px 14px",
            borderRadius:   "100px",
            whiteSpace:     "nowrap",
            backdropFilter: "blur(10px)",
            border:         "0.5px solid rgba(255,255,255,0.2)",
            letterSpacing:  "0.03em",
            fontFamily:     "var(--font-body)",
            animation:      "photoCursorLabel 0.4s ease forwards",
          }}
        >
          {CURSOR_MESSAGES[msgIdx]}
        </div>
      </div>

      <style>{`
        @keyframes photoCursorLabel {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          #hero {
            grid-template-columns: 1fr !important;
            padding-top: 96px !important;
          }
          /* Hide photo on tablet — too visually noisy with text overlapping */
          .hero-photo-col { display: none !important; }
          /* Hide photo cursor on tablet */
          [data-photo-cursor] { display: none !important; }
        }
        @media (max-width: 640px) {
          /* Mobile: photo starts fully visible (GSAP fades it as text enters).
             opacity is intentionally NOT !important so GSAP inline style wins. */
          .hero-photo-col {
            display: block !important;
            opacity: 1;
            width: 100% !important;
            pointer-events: none;
          }
          /* Hide desktop-only photo cursor on mobile */
          [data-photo-cursor] { display: none !important; }
        }
        @media (max-width: 1024px) {
          /* Cursor is purely a desktop feature */
          [data-photo-cursor] { display: none !important; }
        }
      `}</style>
    </section>
  );
}

