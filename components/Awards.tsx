"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AWARDS: Array<{
  name: string; body: string; category: string;
  year: string; tier: string; logo: string; logoFilter?: string;
  logoMaxHeight?: string; logoMaxWidth?: string;
  secondaryLogo?: string; secondaryLogoFilter?: string;
  borderTier?: string;
  badge?: string;
}> = [
  // ── sorted by year (ascending) ──────────────────────────────────────
  {
    name: "Best in Class Engineer",
    body: "BNY",
    category: "Platform Efficiency",
    year: "2019",
    tier: "Internal",
    logo: "/awards/BNY_logo_2024.svg",
  },
  {
    name: "Best Private Wealth Bank Award",
    body: "CIO Magazine",
    category: "AdvicePath℠ – Wealth Management Team",
    year: "2021",
    tier: "International",
    logo: "/awards/CIO100_trans.png",
    logoFilter:        "brightness(0) invert(1)",
    logoMaxHeight:     "110px",
    logoMaxWidth:      "210px",
    secondaryLogo:       "/awards/BNY_logo_2024.svg",
    secondaryLogoFilter: "brightness(0) invert(1)",
    borderTier:          "Internal",
  },
  {
    name: "Titan Innovation Award",
    body: "IAA",
    category: "Artificial Intelligence",
    year: "2025",
    tier: "International",
    logo: "/awards/TIA-Logo.png",
    borderTier: "Gold",
    badge:      "/awards/badge-gold.svg",
  },
  {
    name: "Aureum Award",
    body: "Aureum International",
    category: "Fintech Impact",
    year: "2025",
    tier: "International",
    logo: "/awards/latest_logo-trans.png",
    borderTier: "Gold",
    badge:      "/awards/badge-gold.svg",
  },
  {
    name: "NY Digital Award",
    body: "IAA",
    category: "AI & Machine Learning",
    year: "2025",
    tier: "International",
    logo: "/awards/NYDA_logo.svg",
    borderTier: "Silver",
    badge:      "/awards/badge-silver.svg",
  },
  {
    name: "Innovation Award",
    body: "BNY",
    category: "Conversational AI Patent",
    year: "2026",
    tier: "Internal",
    logo: "/awards/BNY_logo_2024.svg",
  },
];

const TIER_COLOR: Record<string, string> = {
  International: "#818cf8",
  Gold:          "#f59e0b",
  Silver:        "#94a3b8",
  Internal:      "#2B9CAE",
};

/** Conic-gradient for the spinning ring — a bright "comet" sweeps the border */
const TIER_RING: Record<string, string> = {
  International: "conic-gradient(from 0deg, transparent 0%, transparent 60%, #312e81 68%, #818cf8 74%, #e0e7ff 78%, #818cf8 82%, #312e81 88%, transparent 94%, transparent 100%)",
  Gold:          "conic-gradient(from 0deg, transparent 0%, transparent 60%, #92400e 68%, #f59e0b 74%, #fef3c7 78%, #f59e0b 82%, #92400e 88%, transparent 94%, transparent 100%)",
  Silver:        "conic-gradient(from 0deg, transparent 0%, transparent 60%, #334155 68%, #94a3b8 74%, #f1f5f9 78%, #94a3b8 82%, #334155 88%, transparent 94%, transparent 100%)",
  Internal:      "conic-gradient(from 0deg, transparent 0%, transparent 60%, #0e5a67 68%, #2B9CAE 74%, #a8ecf5 78%, #2B9CAE 82%, #0e5a67 88%, transparent 94%, transparent 100%)",
};

/** Outer glow colour for the active (centre) card */
const TIER_GLOW: Record<string, string> = {
  International: "rgba(129,140,248,0.40)",
  Gold:          "rgba(245,158,11,0.40)",
  Silver:        "rgba(148,163,184,0.30)",
  Internal:      "rgba(43,156,174,0.45)",
};

/**
 * Continuous distance → visual property helpers.
 * dist = 0 → centre card; dist = ±1 → immediate flanking; dist = ±2 → outer flanking.
 * Cards at |dist| > 2.5 are hidden off-screen.
 */
const xFromDist = (dist: number) => {
  // On mobile (< 720px): use viewport-relative steps so flanking cards
  // peek ~12-15% of vw from each edge (3-card deck experience).
  // On desktop: non-linear gap — dist=0→0, dist=±1→±340, dist=±2→±580.
  const vw   = typeof window !== "undefined" ? window.innerWidth : 1440;
  const isMob = vw < 720;
  const sign = dist < 0 ? -1 : 1;
  const abs  = Math.abs(dist);
  if (isMob) {
    // step ≈ 82 % of vw → flanking card peeks ~13 % from each edge
    const step = Math.round(vw * 0.82);
    return sign * (abs <= 1 ? abs * step : step + (abs - 1) * Math.round(vw * 0.92));
  }
  return sign * (abs <= 1 ? abs * 340 : 340 + (abs - 1) * 240);
};
const scaleFromDist = (abs: number) => {
  const vw    = typeof window !== "undefined" ? window.innerWidth : 1440;
  const isMob = vw < 720;
  // On mobile, keep flanking cards closer to full size so the peek is recognisable
  if (isMob) return Math.max(0.72, 1 - abs * 0.14);
  return Math.max(0.36, 1 - abs * 0.24);
};
const opacityFromDist = (abs: number) => {
  if (abs > 2.5) return 0;
  const vw    = typeof window !== "undefined" ? window.innerWidth : 1440;
  const isMob = vw < 720;
  // On mobile, flanking cards are more visible so the peek reads clearly
  if (isMob) return Math.max(0, 1 - abs * 0.22);
  return Math.max(0, 1 - abs * 0.38);
};
const zFromDist      = (abs: number)  => Math.round(5 - abs * 2);

const CARD_W          = 300;
const CARD_H          = 400;
const SCROLL_PER_CARD = 500; // px of scroll to advance one card

// ─────────────────────────────────────────────────────────────────────────────

export function Awards() {
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const stageRef     = useRef<HTMLDivElement>(null);
  const headingRef   = useRef<HTMLDivElement>(null);
  const cardRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const revealedRef = useRef(false);
  const scrollIdxRef = useRef(0); // continuous float: 0 … N-1

  /* ── mount ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    const N = AWARDS.length;

    /**
     * Place every card instantly based on a continuous scrollIdx.
     * dist = 0  → centre; dist = ±1 → flanking; dist = ±2 → outer; >2.5 → hidden.
     */
    const place = (scrollIdx: number) => {
      AWARDS.forEach((_, i) => {
        const card = cardRefs.current[i];
        if (!card) return;

        // shortest circular distance
        let dist = i - scrollIdx;
        if (dist >  N / 2) dist -= N;
        if (dist < -N / 2) dist += N;

        const abs    = Math.abs(dist);
        const hidden = abs > 2.5;

        gsap.set(card, {
          x:       hidden ? (dist >= 0 ? 800 : -800) : xFromDist(dist),
          scale:   hidden ? 0.3 : scaleFromDist(abs),
          opacity: hidden ? 0 : (revealedRef.current ? opacityFromDist(abs) : 0),
          zIndex:  hidden ? 0 : zFromDist(abs),
        });
      });
    };

    // initial hidden state
    place(0);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── 1. Reveal: fade cards in when wrapper enters view ────────────────
    ScrollTrigger.create({
      trigger: wrapperRef.current,
      start:   "top 80%",
      once:    true,
      onEnter: () => {
        revealedRef.current = true;
        AWARDS.forEach((_, i) => {
          const card = cardRefs.current[i];
          if (!card) return;
          let dist = i - scrollIdxRef.current;
          if (dist >  N / 2) dist -= N;
          if (dist < -N / 2) dist += N;
          const abs = Math.abs(dist);
          gsap.fromTo(
            card,
            { opacity: 0, y: 24 },
            {
              opacity:  abs > 2.5 ? 0 : opacityFromDist(abs),
              y:        0,
              duration: reduced ? 0 : 0.7,
              delay:    reduced ? 0 : abs * 0.09,
              ease:     "power2.out",
            }
          );
        });
      },
    });

    // ── 2. Scroll-driven rotation ────────────────────────────────────────
    ScrollTrigger.create({
      trigger: wrapperRef.current,
      start:   "top top",
      end:     `+=${N * SCROLL_PER_CARD}`,
      scrub:   0.6,          // lerp lag — smooth but responsive
      onUpdate: (self) => {
        scrollIdxRef.current = self.progress * (N - 1);
        place(scrollIdxRef.current);
      },
    });

    // ── 3. Heading exit — slides + fades out as the last card finishes ───
    // start fires when scroll has advanced (N-1)*SCROLL_PER_CARD past the
    // rotation-ST start (i.e. card N-2 is centred); end fires when all N
    // cards have been shown. Uses "top+=X top" = "the point X px below the
    // wrapper's top aligns with the viewport top", which maps cleanly to
    // X pixels of additional page scroll past the rotation start.
    if (headingRef.current) {
      gsap.fromTo(
        headingRef.current,
        { opacity: 1, y: 0 },
        {
          opacity: 0,
          y:       -40,
          ease:    "power2.in",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start:   `top+=${(N - 1) * SCROLL_PER_CARD} top`,
            end:     `top+=${N * SCROLL_PER_CARD} top`,
            scrub:   true,
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  /* ── render ─────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @keyframes award-border-spin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        .award-border-spin {
          animation: award-border-spin 4s linear infinite;
        }
        @media (max-width: 640px) {
          /* Narrow vignettes so peeking flanking cards aren't obscured */
          .aw-vignette { width: 14px !important; }
          .aw-card {
            width: calc(100vw - 2.5rem) !important;
            left: 1.25rem !important;
            height: min(380px, 70vh) !important;
            top: calc(50% - min(190px, 35vh)) !important;
          }
        }
      `}</style>
      <section id="awards" aria-label="Recognition" className="section">

        {/* ── Scroll wrapper — provides the full scroll budget ─────────── */}
        <div
          ref={wrapperRef}
          style={{
            position: "relative",
            height:   `calc(100vh + ${AWARDS.length * SCROLL_PER_CARD}px)`,
          }}
        >
          {/* ── Heading — sticky, sits above the card stage (like Cases) ── */}
          <div
            ref={headingRef}
            className="section"
            style={{
              position:       "sticky",
              top:            0,
              zIndex:         20,
              background:     "var(--bg)",
              paddingBottom:  "1.5rem",
              paddingTop:     "0",
              flexShrink:     0,
            }}
          >
            <div className="divider" style={{ marginBottom: "var(--space-xl)" }} />
            <div className="section-header" style={{ marginBottom: "0.5rem" }}>
              <span className="label">05 · Recognition</span>
              <span className="label" style={{ color: "var(--text-3)" }}>
                4 International · 2 Internal
              </span>
            </div>
            <h2 className="display" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.0 }}>
              <span style={{
                fontFamily:    "var(--font-backly)",
                fontWeight:    400,
                textTransform: "none",
                letterSpacing: "0.01em",
              }}>elite</span>{" "}
              <span style={{ color: "var(--accent)", fontStyle: "italic" }}>AWARDS</span>
            </h2>
          </div>

          {/* ── Sticky stage — 100 vh so cards sit at true center ───── */}
          <div
            ref={stageRef}
            style={{
              position:       "sticky",
              top:            0,
              height:         "100vh",
              background:     "var(--bg)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              overflow:       "hidden",
              userSelect:     "none",
              zIndex:         10,
            }}
          >
            {AWARDS.map((award, i) => {
              const tc = TIER_COLOR[award.tier] ?? "#6b7280";

              return (
                <div
                  key={i}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  aria-label={award.name}
                  className="aw-card"
                  style={{
                    position:     "absolute",
                    left:         `calc(50% - ${CARD_W / 2}px)`,
                    top:          `calc(50% - ${CARD_H / 2}px)`,
                    width:        `${CARD_W}px`,
                    height:       `${CARD_H}px`,
                    borderRadius: "18px",
                    overflow:     "hidden",
                    willChange:   "transform, opacity",
                    color:        "#fff",
                    boxShadow:    `0 8px 28px rgba(0,0,0,0.55), 0 0 24px 3px ${TIER_GLOW[award.borderTier ?? award.tier] ?? "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {/* ── Spinning ring ── */}
                  <div style={{
                    position:   "absolute",
                    inset:      "-50%",
                    background: TIER_RING[award.borderTier ?? award.tier] ?? TIER_RING.Internal,
                  }} className="award-border-spin" />

                  {/* ── Card face ── */}
                  <div style={{
                    position:     "absolute",
                    inset:        "2px",
                    borderRadius: "16px",
                    background:   "#252525",
                  }} />

                  {/* ── Badge ── */}
                  {award.badge && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={award.badge}
                      alt=""
                      aria-hidden="true"
                      style={{
                        position:        "absolute",
                        bottom:          "-18px",
                        right:           "-18px",
                        width:           "72px",
                        height:          "auto",
                        zIndex:          4,
                        transform:       "rotate(-45deg)",
                        transformOrigin: "center center",
                        opacity:         0.88,
                        filter:          "drop-shadow(0 2px 5px rgba(0,0,0,0.55))",
                      }}
                    />
                  )}

                  {/* ── Content ── */}
                  <div style={{
                    position:      "relative",
                    zIndex:        2,
                    height:        "100%",
                    display:       "flex",
                    flexDirection: "column",
                    padding:       "1.6rem 1.5rem 1.4rem",
                  }}>

                    {/* ── Top: tier pill + year ── */}
                    <div style={{
                      display:        "flex",
                      justifyContent: "space-between",
                      alignItems:     "center",
                      marginBottom:   "1rem",
                    }}>
                      <span style={{
                        fontSize:      "0.5rem",
                        fontWeight:    800,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color:         tc,
                        border:        `1px solid ${tc}44`,
                        borderRadius:  "100px",
                        padding:       "0.2rem 0.55rem",
                        lineHeight:    1,
                        background:    `${tc}12`,
                      }}>
                        {award.tier}
                      </span>
                      <span style={{
                        fontSize:           "0.5rem",
                        color:              "rgba(255,255,255,0.3)",
                        letterSpacing:      "0.1em",
                        fontVariantNumeric: "tabular-nums",
                      }}>
                        {award.year}
                      </span>
                    </div>

                    {/* ── Centre: logo ── */}
                    <div style={{
                      flex:           1,
                      display:        "flex",
                      flexDirection:  "column",
                      alignItems:     "center",
                      justifyContent: "center",
                      gap:            "0.5rem",
                      padding:        "0.5rem 0.75rem",
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={award.logo}
                        alt={award.body}
                        style={{
                          maxHeight:    award.logoMaxHeight ?? "68px",
                          maxWidth:     award.logoMaxWidth  ?? "168px",
                          objectFit:    "contain",
                          filter:       award.logoFilter ?? "brightness(0) invert(1)",
                          mixBlendMode: "screen",
                          opacity:      0.9,
                        }}
                        onError={(e) => {
                          const el = e.currentTarget;
                          el.style.display = "none";
                          const fb = el.nextElementSibling as HTMLElement | null;
                          if (fb) fb.style.display = "block";
                        }}
                      />
                      {/* text fallback */}
                      <span style={{
                        display:       "none",
                        fontSize:      "0.75rem",
                        fontWeight:    700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color:         "rgba(255,255,255,0.55)",
                        textAlign:     "center",
                      }}>
                        {award.body}
                      </span>
                      {/* ── Optional secondary logo ── */}
                      {award.secondaryLogo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={award.secondaryLogo}
                          alt="presented by BNY"
                          style={{
                            maxHeight:    "14px",
                            maxWidth:     "56px",
                            objectFit:    "contain",
                            filter:       award.secondaryLogoFilter ?? "brightness(0) invert(1)",
                            mixBlendMode: "screen",
                            opacity:      0.50,
                          }}
                        />
                      )}
                    </div>

                    {/* ── Bottom: name + category ── */}
                    <div>
                      <div style={{
                        height:       "0.5px",
                        background:   "linear-gradient(to right, rgba(255,255,255,0.12), transparent)",
                        marginBottom: "0.65rem",
                      }} />
                      <div style={{
                        fontSize:     "0.88rem",
                        fontWeight:   700,
                        color:        "#fff",
                        lineHeight:   1.3,
                        marginBottom: "0.32rem",
                        fontFamily:   "var(--font-display)",
                      }}>
                        {award.name}
                      </div>
                      <div style={{
                        fontSize:      "0.5rem",
                        color:         "rgba(255,255,255,0.38)",
                        letterSpacing: "0.11em",
                        textTransform: "uppercase",
                      }}>
                        {award.category}
                      </div>
                    </div>

                  </div>{/* end content */}
                </div>
              );
            })}

            {/* ── Edge vignettes ── */}
            <div className="aw-vignette" style={{
              position:      "absolute",
              top: 0, left: 0,
              width:         "140px",
              height:        "100%",
              background:    "linear-gradient(to right, var(--bg) 20%, transparent)",
              pointerEvents: "none",
              zIndex:        10,
            }} />
            <div className="aw-vignette" style={{
              position:      "absolute",
              top: 0, right: 0,
              width:         "140px",
              height:        "100%",
              background:    "linear-gradient(to left, var(--bg) 20%, transparent)",
              pointerEvents: "none",
              zIndex:        10,
            }} />
          </div>{/* end sticky stage */}
        </div>{/* end wrapper */}
      </section>
    </>
  );
}
