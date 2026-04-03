"use client";

import { useEffect, useRef } from "react";
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

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // SCSS morph animation bypasses GSAP word cycle math cleanly!
    
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      return;
    }

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
        </defs>
      </svg>

      <style>{`
        @media (min-width: 641px) and (max-width: 1023px) {
          #hero {
            grid-template-columns: 1fr !important;
            padding-top: 96px !important;
          }
          /* Hide photo on tablet — too visually noisy with text overlapping */
          .hero-photo-col { display: none !important; }
        }
        @media (max-width: 640px) {
          /* Show photo as a faint silhouette behind the text on mobile */
          .hero-photo-col {
            display: block !important;
            opacity: 0.18 !important;
            width: 100% !important;
            pointer-events: none;
          }
        }
      `}</style>
    </section>
  );
}

