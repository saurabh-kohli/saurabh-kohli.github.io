"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { asset } from "@/lib/asset";

gsap.registerPlugin(ScrollTrigger);

/* ── Hobby data ─────────────────────────────────────────────── */
const HOBBY_SVG_CARDS = [
  { label: "Biking",          src: "/hobbies/biking.svg" },
  { label: "Paddle Boarding", src: "/hobbies/paddle%20board.svg" },
  { label: "Running",         src: "/hobbies/running.svg" },
  { label: "Bhangra",         src: "/hobbies/bhangra.svg" },
];

const HOBBY_TEXT_TAGS = ["Hiking", "Table Tennis", "Pickleball"];

/* Marquee ticker – all 7 */
const MARQUEE_ITEMS = [
  "Biking", "·", "Paddle Boarding", "·", "Hiking", "·",
  "Running", "·", "Table Tennis", "·", "Pickleball", "·", "Bhangra", "·",
];

export function About() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ── Portrait scale-in ─────────────────────────────────── */
    gsap.fromTo(
      ".about-img-wrap",
      { opacity: 0, scale: 0.92, y: 56 },
      {
        opacity: 1, scale: 1, y: 0,
        duration: 1.5, ease: "expo.out",
        scrollTrigger: { trigger: ".about-img-wrap", start: "top 80%", once: true },
      }
    );

    /* ── Display headline clip reveal ──────────────────────── */
    gsap.fromTo(
      ".about-headline .anim-clip",
      { y: "110%" },
      {
        y: "0%", stagger: 0.09, duration: 1.1, ease: "expo.out",
        scrollTrigger: { trigger: ".about-headline", start: "top 82%", once: true },
      }
    );

    /* ── Sub-headline + copy fade ──────────────────────────── */
    gsap.fromTo(
      [".about-sub", ".about-copy"],
      { opacity: 0, y: 22 },
      {
        opacity: 1, y: 0, stagger: 0.12, duration: 0.9, ease: "expo.out",
        scrollTrigger: { trigger: ".about-sub", start: "top 86%", once: true },
      }
    );

    /* ── Hobby cards stagger pop ───────────────────────────── */
    gsap.fromTo(
      ".hcard",
      { opacity: 0, y: 32, scale: 0.88 },
      {
        opacity: 1, y: 0, scale: 1,
        stagger: 0.08, duration: 0.6, ease: "back.out(1.6)",
        scrollTrigger: { trigger: ".about-hobbies-grid", start: "top 88%", once: true },
      }
    );

    /* ── Text tags fade ────────────────────────────────────── */
    gsap.fromTo(
      ".about-tags-row",
      { opacity: 0, y: 14 },
      {
        opacity: 1, y: 0, duration: 0.7, ease: "expo.out",
        scrollTrigger: { trigger: ".about-tags-row", start: "top 90%", once: true },
      }
    );

    /* ── Floating bob on SVG icons ─────────────────────────── */
    if (!reduced) {
      gsap.utils.toArray<HTMLElement>(".hcard-icon-inner").forEach((el, i) => {
        gsap.to(el, {
          y: -5, yoyo: true, repeat: -1,
          duration: 2.0 + i * 0.22, ease: "sine.inOut", delay: i * 0.38,
        });
      });
    }

    /* ── Mouse 3-D tilt on portrait ────────────────────────── */
    if (!reduced) {
      const tiltX = gsap.quickTo(".about-portrait-tilt", "rotateY", { duration: 1.3, ease: "power2.out" });
      const tiltY = gsap.quickTo(".about-portrait-tilt", "rotateX", { duration: 1.3, ease: "power2.out" });
      const onMove = (e: MouseEvent) => {
        tiltX((e.clientX / window.innerWidth  - 0.5) *  7);
        tiltY((e.clientY / window.innerHeight - 0.5) * -4);
      };
      window.addEventListener("mousemove", onMove);
      return () => window.removeEventListener("mousemove", onMove);
    }
  }, []);

  /* ── Marquee infinite scroll (CSS-driven, GSAP fallback) ─── */
  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;
    const tw = gsap.to(el, {
      x: "-50%", duration: 22, ease: "none", repeat: -1,
    });
    return () => { tw.kill(); };
  }, []);

  return (
    <section id="about" aria-label="About" className="section">

      {/* ── Divider + label ──────────────────────────────────── */}
      <div className="divider" style={{ marginBottom: "var(--space-xl)" }} />
      <div style={{
        display: "flex", alignItems: "baseline",
        justifyContent: "space-between", flexWrap: "wrap",
        gap: "0.5rem", marginBottom: "var(--space-xl)",
      }}>
        <span className="label">08 · Life Outside the Build</span>
      </div>

      {/* ── Editorial headline ──────────────────────────────── */}
      <div className="about-headline" style={{ marginBottom: "clamp(2.5rem, 5vw, 5rem)" }}>
        <div style={{ overflow: "hidden" }}>
          <span
            className="display anim-clip"
            style={{
              display: "block",
              fontSize: "clamp(3.2rem, 7.5vw, 8.5rem)",
              lineHeight: 0.92,
              letterSpacing: "-0.04em",
              color: "var(--ink)",
            }}
          >
            Beyond
          </span>
        </div>
        <div style={{ overflow: "hidden" }}>
          <span
            className="display anim-clip"
            style={{
              display: "block",
              fontSize: "clamp(3.2rem, 7.5vw, 8.5rem)",
              lineHeight: 0.92,
              letterSpacing: "-0.04em",
              color: "var(--accent)",
            }}
          >
            The Build.
          </span>
        </div>
      </div>

      {/* ── Main content: portrait (left) + copy-grid (right) ─ */}
      <div className="about-main-grid">

        {/* Portrait ───────────────────────────────────────── */}
        <div
          className="about-img-wrap"
          style={{
            perspective: "900px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="about-portrait-tilt"
            style={{ transformStyle: "preserve-3d", width: "100%" }}
          >
            <Image
              src={asset("/Saurabh%20Kohli%20-%202%20-%20transparent.png")}
              alt="Saurabh Kohli"
              width={620}
              height={860}
              priority
              quality={95}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "70vh",
                objectFit: "contain",
                filter: "drop-shadow(0 48px 96px rgba(0,0,0,0.55))",
                imageRendering: "crisp-edges",
              }}
            />
          </div>
        </div>

        {/* Copy + hobbies ──────────────────────────────────── */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "var(--space-lg)",
        }}>

          {/* Sub-label */}
          <p
            className="about-sub serif-italic"
            style={{
              fontSize: "clamp(1rem, 1.4vw, 1.35rem)",
              color: "var(--ink-2)",
              lineHeight: 1.55,
            }}
          >
            Architect. Builder. Perpetual mover.
          </p>

          {/* Body copy */}
          <p
            className="about-copy"
            style={{
              fontSize: "clamp(0.82rem, 0.98vw, 0.96rem)",
              color: "var(--ink-2)",
              lineHeight: 1.9,
              maxWidth: "44ch",
            }}
          >
            Most of my time is spent building systems that scale, modernizing
            platforms that matter, and thinking clearly about the architecture
            of what comes next. Outside of that, movement is how I reset and
            stay sharp. Biking mountain trails at dawn, paddle boarding before
            the world wakes up, hiking for altitude clarity, running to quiet
            the noise — and finishing the week at a table tennis table or on
            a pickleball court. Every pursuit is a different kind of discipline.
          </p>

          {/* Rule */}
          <div style={{ width: "40px", height: "1px", background: "var(--border-mid)" }} />

          {/* Hobby SVG cards */}
          <div className="about-hobbies-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.6rem",
          }}>
            {HOBBY_SVG_CARDS.map((h) => (
              <div
                key={h.label}
                className="hcard hcard-svg"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.55rem",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  padding: "1.1rem 0.4rem 0.9rem",
                  cursor: "pointer",
                  transition: "border-color 0.25s, background 0.25s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-mid)";
                  (e.currentTarget as HTMLDivElement).style.background = "var(--bg-3)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLDivElement).style.background = "var(--surface)";
                }}
              >
                <div className="hcard-icon-inner" style={{ width: 44, height: 44 }}>
                  <Image
                    src={h.src}
                    alt={h.label}
                    width={44}
                    height={44}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
                <span style={{
                  fontSize: "0.52rem",
                  color: "var(--ink-3)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}>
                  {h.label}
                </span>
              </div>
            ))}
          </div>

          {/* Text-only hobby tags */}
          <div className="about-tags-row" style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
            {HOBBY_TEXT_TAGS.map(h => (
              <span key={h} className="tag" style={{ fontSize: "0.58rem" }}>{h}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Marquee strip ────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          marginTop: "clamp(3rem, 6vw, 6rem)",
          overflow: "hidden",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "1rem 0",
          maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div
          ref={marqueeRef}
          style={{
            display: "flex",
            gap: "clamp(1.5rem, 3vw, 3rem)",
            whiteSpace: "nowrap",
            width: "max-content",
          }}
        >
          {/* Duplicate so marquee loops seamlessly */}
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              style={{
                fontSize: "clamp(0.7rem, 0.85vw, 0.85rem)",
                fontWeight: item === "·" ? 400 : 600,
                letterSpacing: item === "·" ? 0 : "0.1em",
                textTransform: "uppercase",
                color: item === "·" ? "var(--ink-3)" : "var(--ink-2)",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

    </section>
  );
}
