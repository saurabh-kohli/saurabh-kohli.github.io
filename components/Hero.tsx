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
  const photoCursorBubbleRef = useRef<HTMLDivElement>(null);         // Figma-style cursor
  const photoOutlineSvgRef   = useRef<SVGSVGElement>(null);          // SVG morphing outline
  const turbRef              = useRef<SVGFETurbulenceElement>(null);  // feTurbulence node
  const displaceRef          = useRef<SVGFEDisplacementMapElement>(null); // feDisplacementMap
  const floodRef             = useRef<SVGFEFloodElement>(null);      // feFlood — color control
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
    const cursor     = photoCursorBubbleRef.current;
    const outlineSvg = photoOutlineSvgRef.current;
    const turb       = turbRef.current;
    const disp       = displaceRef.current;
    const flood      = floodRef.current;
    if (!cursor) return;

    // ── Offscreen canvas for per-pixel transparency hit-testing ──────────
    // Loads the transparent PNG (same subject as saurabh.svg) for reliable
    // canvas access. getImageData(x,y).data[3] tells us the alpha at that pixel
    // so we only trigger cursor effects over the actual visible person.
    const offscreen = document.createElement("canvas");
    const offCtx    = offscreen.getContext("2d", { willReadFrequently: true });
    let imgLoaded = false;
    let natW = 1, natH = 1;

    const hitImg = new window.Image();
    hitImg.onload = () => {
      natW = hitImg.naturalWidth;
      natH = hitImg.naturalHeight;
      offscreen.width  = natW;
      offscreen.height = natH;
      offCtx?.drawImage(hitImg, 0, 0);
      imgLoaded = true;
    };
    hitImg.src = "/saurabh-transparent.png";

    // ── Helpers ──────────────────────────────────────────────────────────

    // Returns screen-space bounding rect of the image as rendered by
    // objectFit:contain + objectPosition:bottom-right inside its container.
    const getRenderedRect = (c: DOMRect) => {
      const scale = Math.min(c.width / natW, c.height / natH); // "contain" scale
      const rW = natW * scale;
      const rH = natH * scale;
      return {                                    // right- and bottom-aligned
        left:   c.left + c.width  - rW,
        top:    c.top  + c.height - rH,
        right:  c.left + c.width,
        bottom: c.top  + c.height,
        width:  rW,
        height: rH,
      };
    };

    // Returns true only if (cx,cy) is over a non-transparent pixel of the portrait.
    const isOverPerson = (
      cx: number, cy: number,
      r: ReturnType<typeof getRenderedRect>,
    ): boolean => {
      if (!imgLoaded || !offCtx) return false;
      if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return false;
      const pX = Math.floor((cx - r.left) / r.width  * natW);
      const pY = Math.floor((cy - r.top)  / r.height * natH);
      if (pX < 0 || pX >= natW || pY < 0 || pY >= natH) return false;
      try { return offCtx.getImageData(pX, pY, 1, 1).data[3] > 25; }
      catch { return false; }
    };

    // ── State ────────────────────────────────────────────────────────────
    let hoverActive = false;
    let hoverStart: number | null = null;
    let msgTimer: ReturnType<typeof setInterval> | null = null;
    let curIdx = 0;

    // Park off-screen; CSS class handles initial opacity:0
    gsap.set(cursor, { x: -400, y: -400, scale: 0.9 });

    // Figma cursor tracks mouse with near-instant lag
    const cxTo = gsap.quickTo(cursor, "x", { duration: 0.07, ease: "power1.out" });
    const cyTo = gsap.quickTo(cursor, "y", { duration: 0.07, ease: "power1.out" });

    // Continuous turbulence loop — keeps the outline wavy while hovering
    const waveTl = turb
      ? gsap.timeline({ repeat: -1 })
          .to(turb, { attr: { baseFrequency: "0.020 0.010" }, duration: 3.5, ease: "sine.inOut" })
          .to(turb, { attr: { baseFrequency: "0.008 0.018" }, duration: 4.2, ease: "sine.inOut" })
          .to(turb, { attr: { baseFrequency: "0.015 0.013" }, duration: 3.0, ease: "sine.inOut" })
      : null;

    // ── Handlers ─────────────────────────────────────────────────────────
    const handleMove = (e: MouseEvent) => {
      const photoEl = document.querySelector<HTMLElement>(".hero-photo-col");
      if (!photoEl) return;
      const rect     = photoEl.getBoundingClientRect();
      const rendered = getRenderedRect(rect);
      // Pixel-accurate: only true when cursor is over a non-transparent pixel
      const isOver   = isOverPerson(e.clientX, e.clientY, rendered);

      // Figma cursor tip tracks mouse exactly
      cxTo(e.clientX);
      cyTo(e.clientY);

      if (isOver && !hoverActive) {
        // ── ENTER ────────────────────────────────────────────────────
        hoverActive = true;
        hoverStart  = Date.now();

        gsap.set(cursor, { scale: 0.85, opacity: 0 });
        gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.28, ease: "back.out(1.6)" });

        if (outlineSvg) gsap.to(outlineSvg, { opacity: 1, duration: 0.55, ease: "power2.out" });
        if (disp)       gsap.to(disp, { attr: { scale: 28 }, duration: 1.1, ease: "power2.out" });

        msgTimer = setInterval(() => {
          const elapsed = hoverStart ? Date.now() - hoverStart : 0;
          let newIdx = 0;
          for (let i = MSG_THRESHOLDS.length - 1; i >= 0; i--) {
            if (elapsed >= MSG_THRESHOLDS[i]) { newIdx = i; break; }
          }
          newIdx = Math.min(newIdx, CURSOR_MESSAGES.length - 1);
          if (newIdx !== curIdx) {
            curIdx = newIdx;
            setMsgIdx(newIdx);
            // Recolour the outline ring via feFlood flood-color
            if (flood) flood.setAttribute("flood-color", BUBBLE_COLORS[newIdx]);
            if (newIdx === CURSOR_MESSAGES.length - 1) fireConfetti();
          }
        }, 200);

      } else if (!isOver && hoverActive) {
        // ── EXIT ─────────────────────────────────────────────────────
        hoverActive = false;
        hoverStart  = null;
        if (msgTimer) { clearInterval(msgTimer); msgTimer = null; }

        curIdx = 0;
        setMsgIdx(0);
        if (flood) flood.setAttribute("flood-color", BUBBLE_COLORS[0]);

        gsap.to(cursor,     { opacity: 0, scale: 0.85, duration: 0.22 });
        if (disp)       gsap.to(disp,       { attr: { scale: 0 }, duration: 0.75, ease: "power2.inOut" });
        if (outlineSvg) gsap.to(outlineSvg, { opacity: 0, x: 0, y: 0, duration: 0.5, delay: 0.55 });
      }

      // Magnetic pull: outline drifts toward cursor relative to image centre
      if (isOver && outlineSvg && imgLoaded) {
        const relX  = (e.clientX - rendered.left) / rendered.width;   // 0 – 1
        const relY  = (e.clientY - rendered.top)  / rendered.height;  // 0 – 1
        const pullX = (relX - 0.50) * 22;
        const pullY = (relY - 0.50) * 14;
        gsap.to(outlineSvg, { x: pullX, y: pullY, duration: 0.85, ease: "power2.out", overwrite: "auto" });
      }
    };

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (msgTimer) clearInterval(msgTimer);
      if (waveTl)   waveTl.kill();
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
            src={asset("/saurabh.svg")}
            alt="Saurabh Kohli"
            fill
            style={{
              objectFit: "contain",
              objectPosition: "bottom right",
            }}
            priority
          />

          {/* ── Wavy morphing outline — smooth curvy line around the silhouette ── */}
          <svg
            ref={photoOutlineSvgRef}
            aria-hidden
            data-photo-cursor
            className="photo-outline-svg"
            style={{
              position: "absolute",
              top: 0, left: 0,
              width: "100%", height: "100%",
              overflow: "visible",
              pointerEvents: "none",
              zIndex: 3,
            }}
          >
            <defs>
              {/*
                Smooth-contour outline filter:
                1. feTurbulence         — fractal noise for wavy displacement
                2. feMorphology(dilate) — heavily expands the silhouette, merging
                                          fine details (hair, fingers) into a single
                                          smooth rounded blob ~22px outside the body
                3. feDisplacementMap    — warps the blob with noise (scale 0→28 on hover)
                4. feMorphology(erode)  — erodes back inward, leaving a thin ~3px ring
                5. feComposite(out)     — strips the filled interior, ring only remains
                6. feFlood + feComposite(in) — fills the ring with the accent colour
              */}
              <filter id="portrait-morph" x="-20%" y="-15%" width="140%" height="130%">
                <feTurbulence
                  ref={turbRef}
                  type="fractalNoise"
                  baseFrequency="0.012 0.008"
                  numOctaves="4"
                  seed="7"
                  result="noise"
                />
                {/* Large dilation rounds off concavities → smooth curvy hull */}
                <feMorphology
                  in="SourceAlpha"
                  operator="dilate"
                  radius="22"
                  result="bigBlob"
                />
                {/* Displace the smooth blob with noise → wavy outline shape */}
                <feDisplacementMap
                  ref={displaceRef}
                  in="bigBlob"
                  in2="noise"
                  scale="0"
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result="warpedBlob"
                />
                {/* Erode inward to leave only a ~1px ring at the outer edge */}
                <feMorphology
                  in="warpedBlob"
                  operator="erode"
                  radius="21"
                  result="innerBlob"
                />
                <feComposite in="warpedBlob" in2="innerBlob" operator="out" result="ring" />
                {/* Fill the ring with the accent colour */}
                <feFlood
                  ref={floodRef}
                  floodColor={BUBBLE_COLORS[0]}
                  floodOpacity="0.92"
                  result="color"
                />
                <feComposite in="color" in2="ring" operator="in" />
              </filter>
            </defs>
            {/* SVG <image> — preserveAspectRatio mirrors objectFit:contain + bottom-right */}
            <image
              href="/saurabh-transparent.png"
              x="0" y="0"
              width="100%" height="100%"
              preserveAspectRatio="xMaxYMax meet"
              filter="url(#portrait-morph)"
            />
          </svg>
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

      {/* ── Figma-style cursor — arrow + coloured badge, follows mouse ── */}
      <div
        ref={photoCursorBubbleRef}
        data-photo-cursor
        className="photo-cursor-bubble figma-cursor"
        style={{
          position:      "fixed",
          left:          0,
          top:           0,
          pointerEvents: "none",
          zIndex:        9999,
        }}
      >
        {/* Cursor arrow (tip aligns with mouse position) */}
        <svg
          width="18" height="22"
          viewBox="0 0 18 22"
          style={{ display: "block", flexShrink: 0 }}
          aria-hidden
        >
          <path
            d="M 1 1 L 1 19 L 5.5 14 L 9 21 L 11.5 20 L 8 13 L 14 13 Z"
            fill={BUBBLE_COLORS[msgIdx]}
          />
          <path
            d="M 1 1 L 1 19 L 5.5 14 L 9 21 L 11.5 20 L 8 13 L 14 13 Z"
            fill="none"
            stroke="rgba(0,0,0,0.28)"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </svg>

        {/* Badge — coloured pill below the arrow shaft */}
        <div
          className="figma-badge"
          style={{ background: BUBBLE_COLORS[msgIdx] }}
        >
          <span key={`lbl-${msgIdx}`} className="figma-badge-text">
            {CURSOR_MESSAGES[msgIdx]}
          </span>
        </div>
      </div>

      <style>{`
        /* Initial hidden state — CSS class prevents React re-renders from stomping
           GSAP's live opacity value on the Figma cursor and SVG outline. */
        .photo-cursor-bubble { opacity: 0; }
        .photo-outline-svg   { opacity: 0; }

        /* ── Figma-style cursor ───────────────────────────────────────────────── */
        .figma-cursor {
          display: block;
          position: fixed;
        }
        /* Badge pill — colour set via inline style, updated with BUBBLE_COLORS */
        .figma-badge {
          position: absolute;
          top: 17px;
          left: 15px;
          padding: 4px 10px;
          border-radius: 5px;
          white-space: nowrap;
          line-height: 1;
        }
        /* Text inside the badge */
        .figma-badge-text {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.045em;
          font-family: var(--font-body);
          white-space: nowrap;
          animation: badgeIn 0.22s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes badgeIn {
          from { opacity: 0; transform: translateY(4px) scale(0.92); }
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

