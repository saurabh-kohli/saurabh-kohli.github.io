"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Load Beiruti from Google Fonts for SVG journal name labels
const BEIRUTI_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Beiruti:wght@400;700;900&display=swap');`;

// ── SVG cover designs — bold block colors, no glass ──────────────────────────

function Cover1() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      {/* base */}
      <rect width="200" height="300" fill="#111" />
      {/* big orange block */}
      <rect y="0" width="200" height="168" fill="#F54E26" />
      {/* diagonal stripe texture on orange block */}
      <line x1="-10" y1="40"  x2="80"  y2="-10" stroke="#e83d15" strokeWidth="18" />
      <line x1="20"  y1="80"  x2="130" y2="-10" stroke="#e83d15" strokeWidth="18" />
      <line x1="70"  y1="100" x2="200" y2="-10" stroke="#e83d15" strokeWidth="18" />
      <line x1="100" y1="168" x2="200" y2="80"  stroke="#e83d15" strokeWidth="18" />
      {/* "AI" large lettering */}
      <text x="14" y="152" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="88" fill="#fff" opacity="0.15" letterSpacing="-4">AI</text>
      {/* dark info band */}
      <rect y="168" width="200" height="132" fill="#111" />
      {/* accent rule */}
      <rect y="168" width="200" height="4" fill="#F54E26" />
      {/* journal name — plain text, no pill */}
      <text x="14" y="198" fontFamily="'Beiruti', 'Noto Sans Arabic', Arial, sans-serif" fontWeight="700" fontSize="16" fill="#F54E26" letterSpacing="0.3">Sarcouncil Journal of</text>
      <text x="14" y="219" fontFamily="'Beiruti', 'Noto Sans Arabic', Arial, sans-serif" fontWeight="700" fontSize="16" fill="#F54E26" letterSpacing="0.3">Engineering &amp; Computer</text>
      <text x="14" y="240" fontFamily="'Beiruti', 'Noto Sans Arabic', Arial, sans-serif" fontWeight="700" fontSize="16" fill="#F54E26" letterSpacing="0.3">Sciences</text>
      {/* abstract bar motif */}
      <rect x="14" y="252" width="120" height="2" fill="#F54E26" opacity="0.4" />
      <rect x="14" y="258" width="80"  height="2" fill="#F54E26" opacity="0.22" />
    </svg>
  );
}

function Cover2() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      {/* base */}
      <rect width="200" height="300" fill="#0e0b1e" />
      {/* full purple block top half */}
      <rect y="0" width="200" height="148" fill="#7c5cfc" />
      {/* concentric squares offset bottom-right */}
      <rect x="60"  y="30"  width="180" height="180" fill="none" stroke="#5a3de0" strokeWidth="18" />
      <rect x="80"  y="50"  width="140" height="140" fill="none" stroke="#5a3de0" strokeWidth="14" />
      <rect x="100" y="70"  width="100" height="100" fill="none" stroke="#5a3de0" strokeWidth="10" />
      <rect x="120" y="90"  width="60"  height="60"  fill="none" stroke="#5a3de0" strokeWidth="6" />
      {/* solid block overlay bottom */}
      <rect y="148" width="200" height="152" fill="#0e0b1e" />
      <rect y="148" width="200" height="4" fill="#7c5cfc" />
      {/* journal name — plain text, no pill */}
      <text x="14" y="174" fontFamily="'Beiruti', 'Noto Sans Arabic', Arial, sans-serif" fontWeight="700" fontSize="16" fill="#7c5cfc" letterSpacing="0.3">European Modern</text>
      <text x="14" y="195" fontFamily="'Beiruti', 'Noto Sans Arabic', Arial, sans-serif" fontWeight="700" fontSize="16" fill="#7c5cfc" letterSpacing="0.3">Studies Journal</text>
      {/* "M" ghost letter */}
      <text x="12" y="148" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="96" fill="#fff" opacity="0.07" letterSpacing="-6">M</text>
      {/* bar motif */}
      <rect x="14" y="209" width="130" height="2" fill="#7c5cfc" opacity="0.4" />
      <rect x="14" y="215" width="90"  height="2" fill="#7c5cfc" opacity="0.22" />
    </svg>
  );
}

function Cover3() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      {/* base */}
      <rect width="200" height="300" fill="#0f1a00" />
      {/* lime top block */}
      <rect y="0" width="200" height="158" fill="#a8cc30" />
      {/* concentric circles (target) centered top */}
      <circle cx="100" cy="79" r="90"  fill="none" stroke="#8aaa18" strokeWidth="20" />
      <circle cx="100" cy="79" r="60"  fill="none" stroke="#8aaa18" strokeWidth="16" />
      <circle cx="100" cy="79" r="30"  fill="none" stroke="#8aaa18" strokeWidth="12" />
      <circle cx="100" cy="79" r="8"   fill="#8aaa18" />
      {/* ghost letter */}
      <text x="8" y="148" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="96" fill="#fff" opacity="0.07">S</text>
      {/* dark lower half */}
      <rect y="158" width="200" height="142" fill="#0f1a00" />
      <rect y="158" width="200" height="4" fill="#a8cc30" />
      {/* journal name — plain text, no pill */}
      <text x="14" y="184" fontFamily="'Beiruti', 'Noto Sans Arabic', Arial, sans-serif" fontWeight="700" fontSize="16" fill="#a8cc30" letterSpacing="0.3">Sarcouncil Journal of</text>
      <text x="14" y="205" fontFamily="'Beiruti', 'Noto Sans Arabic', Arial, sans-serif" fontWeight="700" fontSize="16" fill="#a8cc30" letterSpacing="0.3">Multidisciplinary</text>
      {/* bar motif */}
      <rect x="14" y="219" width="140" height="2" fill="#a8cc30" opacity="0.4" />
      <rect x="14" y="225" width="100" height="2" fill="#a8cc30" opacity="0.22" />
    </svg>
  );
}

function Cover4() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      {/* base */}
      <rect width="200" height="300" fill="#060f18" />
      {/* sky-blue top block */}
      <rect y="0" width="200" height="160" fill="#0ea5e9" />
      {/* circuit / grid lines */}
      <line x1="0"   y1="40"  x2="200" y2="40"  stroke="#0891d1" strokeWidth="1.5" />
      <line x1="0"   y1="80"  x2="200" y2="80"  stroke="#0891d1" strokeWidth="1.5" />
      <line x1="0"   y1="120" x2="200" y2="120" stroke="#0891d1" strokeWidth="1.5" />
      <line x1="40"  y1="0"   x2="40"  y2="160" stroke="#0891d1" strokeWidth="1.5" />
      <line x1="80"  y1="0"   x2="80"  y2="160" stroke="#0891d1" strokeWidth="1.5" />
      <line x1="120" y1="0"   x2="120" y2="160" stroke="#0891d1" strokeWidth="1.5" />
      <line x1="160" y1="0"   x2="160" y2="160" stroke="#0891d1" strokeWidth="1.5" />
      {/* node dots at intersections */}
      {[40,80,120,160].map(x => [40,80,120].map(y => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#060f18" stroke="#0ea5e9" strokeWidth="2" />
      )))}
      {/* ghost letter */}
      <text x="4" y="150" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="96" fill="#fff" opacity="0.07">F</text>
      {/* dark lower half */}
      <rect y="160" width="200" height="140" fill="#060f18" />
      <rect y="160" width="200" height="4" fill="#0ea5e9" />
      {/* journal name — plain text, no pill */}
      <text x="14" y="184" fontFamily="'Beiruti', 'Noto Sans Arabic', Arial, sans-serif" fontWeight="700" fontSize="16" fill="#0ea5e9" letterSpacing="0.3">Journal of International</text>
      <text x="14" y="205" fontFamily="'Beiruti', 'Noto Sans Arabic', Arial, sans-serif" fontWeight="700" fontSize="16" fill="#0ea5e9" letterSpacing="0.3">Crisis &amp; Risk</text>
      <text x="14" y="226" fontFamily="'Beiruti', 'Noto Sans Arabic', Arial, sans-serif" fontWeight="700" fontSize="16" fill="#0ea5e9" letterSpacing="0.3">Communication Research</text>
      {/* bar motif */}
      <rect x="14" y="240" width="150" height="2" fill="#0ea5e9" opacity="0.4" />
      <rect x="14" y="246" width="110" height="2" fill="#0ea5e9" opacity="0.22" />
    </svg>
  );
}

const COVERS = [Cover1, Cover2, Cover3, Cover4];

const PAPERS = [
  {
    title:    "AI-Driven Orchestration Systems in Cloud-Native Financial Applications",
    subtitle: "A Framework for Next-Generation Investment Platforms",
    journal:  "Sarcouncil Journal of Engineering and Computer Sciences",
    journalCode: "SJECS",
    articleUrl: "https://sarcouncil.com/download-article/SJECS-477-2025-356-363.pdf",
    accent:   "#F54E26",
  },
  {
    title:    "Legacy System Modernization in Financial Institutions",
    subtitle: "A Comparative Analysis of Cloud-Native Migration Strategies",
    journal:  "European Modern Studies Journal",
    journalCode: "EMSJ",
    articleUrl: "https://lorojournals.com/index.php/emsj/article/view/1640/1595",
    accent:   "#7c5cfc",
  },
  {
    title:    "AI-Driven Modernization: Transforming Financial Services Applications",
    subtitle: "Enterprise Patterns for Scalable AI Integration",
    journal:  "Sarcouncil Journal of Multidisciplinary",
    journalCode: "SJMD",
    articleUrl: "https://sarcouncil.com/download-article/SJMD-301-2025-105-111.pdf",
    accent:   "#a8cc30",
  },
  {
    title:    "Financial Resilience: Cloud Architecture & AI Risk Integration",
    subtitle: "Systemic Risk Management in Next-Gen Platforms",
    journal:  "Journal of International Crisis and Risk Communication Research",
    journalCode: "JICRCR",
    articleUrl: "https://jicrcr.com/index.php/jicrcr/article/view/3254/2773",
    accent:   "#0ea5e9",
  },
];

export function Papers() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef     = useRef<HTMLDivElement>(null);

  // scroll-reveal entrance
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const books = rowRef.current?.querySelectorAll<HTMLDivElement>(".cp-book");
    books?.forEach((book, i) => {
      gsap.fromTo(
        book,
        { opacity: 0, y: 50 },
        {
          opacity:  1,
          y:        0,
          duration: 0.8,
          ease:     "expo.out",
          delay:    i * 0.13,
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
        }
      );
    });
  }, []);

  return (
    <>
      {/*
       * CSS follows the codepen exactly:
       * - .cp-book           → .book
       * - .cp-book-inside    → .book-inside  (pages block, box-shadow stripes)
       * - .cp-book-cover     → .book-cover   (flat at rest, rotateY(-30deg) on hover)
       * - .cp-effect         → .effect       (left gloss strip, widens on hover)
       * - .cp-light          → .light        (right shimmer, fades in on hover)
       * - .cp-title          → .title        (journal label above, fades in on hover)
       * - .cp-btn            → .btn          (read link below, fades in on hover)
       *
       * Per-book accent driven by --book-accent CSS custom property.
       */}
      <style>{`
        ${BEIRUTI_IMPORT}

        .cp-book {
          width: 200px;
          height: 300px;
          position: relative;
          text-align: center;
          cursor: pointer;
        }

        /* ── cover ──────────────────────────────────────────────────────── */
        .cp-book-cover {
          position: absolute;
          z-index: 1;
          width: 100%;
          height: 100%;
          transform-origin: 0 50%;
          border-radius: 3px;
          box-shadow:
            inset 4px 1px 3px rgba(255,255,255,0.12),
            inset 0 -1px 2px rgba(0,0,0,0.8);
          transition: all .5s ease-in-out;
          overflow: hidden;
        }

        .cp-book:hover .cp-book-cover {
          transform: perspective(2000px) rotateY(-30deg);
          transform-style: preserve-3d;
          box-shadow:
            inset 4px 1px 3px rgba(255,255,255,0.12),
            inset 0 -1px 2px rgba(0,0,0,0.8),
            10px 0px 10px -5px rgba(0,0,0,0.5);
        }

        /* ── effect: narrow gloss strip on left, widens on hover ─────────── */
        .cp-effect {
          width: 20px;
          height: 100%;
          margin-left: 10px;
          border-left: 2px solid rgba(0,0,0,0.06);
          background-image: linear-gradient(90deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%);
          transition: all .5s ease;
          position: relative;
          z-index: 3;
          float: left;
        }

        .cp-book:hover .cp-effect {
          width: 40px;
        }

        /* ── light: right-side shimmer, fades in on hover ────────────────── */
        .cp-light {
          width: 90%;
          height: 100%;
          position: absolute;
          border-radius: 3px;
          background-image: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 100%);
          top: 0;
          right: 0;
          opacity: 0.1;
          transition: all .5s ease;
          z-index: 3;
          pointer-events: none;
        }

        .cp-book:hover .cp-light {
          opacity: 1;
          width: 70%;
        }

        /* ── book-inside: pages block with inset box-shadow stripes ─────── */
        .cp-book-inside {
          width: calc(100% - 2px);
          height: 96%;
          position: relative;
          top: 2%;
          border: 1px solid #383838;
          border-radius: 3px;
          background: #1e1e1e;
          box-shadow:
            10px 40px 40px -10px rgba(0,0,0,0.6),
            inset -2px 0 0 #444,
            inset -3px 0 0 #2e2e2e,
            inset -4px 0 0 #1e1e1e,
            inset -5px 0 0 #2e2e2e,
            inset -6px 0 0 #1e1e1e,
            inset -7px 0 0 #2e2e2e,
            inset -8px 0 0 #1e1e1e,
            inset -9px 0 0 #2e2e2e;
        }

        /* ── title label above book, fades in on hover ───────────────────── */
        .cp-title {
          width: 200px;
          position: absolute;
          top: -12px;
          left: 0;
          transform: translateY(-100%);
          height: auto;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          opacity: 0;
          transition: all 1s ease-in-out;
          text-align: left;
        }

        .cp-book:hover .cp-title {
          opacity: 1;
        }

        /* ── read button below book, fades in on hover ───────────────────── */
        .cp-btn {
          position: relative;
          color: var(--book-accent);
          border: 1px solid var(--book-accent);
          background: transparent;
          padding: 7px 22px;
          font-size: 10px;
          letter-spacing: 2px;
          font-family: var(--font-body, monospace);
          font-weight: 600;
          text-transform: uppercase;
          border-radius: 50px;
          bottom: -42px;
          display: inline-block;
          opacity: 0;
          transition: all 1s ease-in-out;
          text-decoration: none;
        }

        .cp-book:hover .cp-btn {
          opacity: 1;
        }
      `}</style>

      <section ref={sectionRef} id="research" aria-label="Research" className="section">
        <div className="divider" style={{ marginBottom: "var(--space-xl)" }} />

        {/* header */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", marginBottom: "0.5rem",
          flexWrap: "wrap", gap: "0.5rem",
        }}>
          <span className="label">04 · Research</span>
          <a
            href="https://orcid.org/0009-0002-0106-5730"
            target="_blank" rel="noopener noreferrer"
            aria-label="Open ORCID profile in new tab"
            style={{
              fontSize: "0.68rem", fontFamily: "var(--font-body)",
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "var(--text-3)", border: "0.5px solid var(--border-mid)",
              padding: "3px 12px", borderRadius: "2px",
              transition: "color 0.2s, border-color 0.2s", textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-3)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-mid)";
            }}
          >
            ORCID ↗
          </a>
        </div>

        <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginBottom: "var(--space-xl)" }}>
          Peer-reviewed · Published journals · ORCID: 0009-0002-0106-5730
        </p>

        {/* books row */}
        <div ref={rowRef} style={{
          display: "flex", justifyContent: "center",
          alignItems: "flex-end", flexWrap: "wrap",
          gap: "52px", padding: "80px 0 60px",
        }}>
          {PAPERS.map((paper, i) => {
            const CoverSVG = COVERS[i];
            return (
              <div
                key={i}
                className="cp-book"
                style={{ "--book-accent": paper.accent } as React.CSSProperties}
              >
                {/* ── .title — full paper title, fades in above on hover */}
                <div className="cp-title">
                  <span style={{
                    fontSize: "0.58rem",
                    fontFamily: "var(--font-body, monospace)",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: paper.accent,
                  }}>
                    {paper.journalCode}
                  </span>
                  <p style={{
                    fontSize: "0.82rem",
                    fontFamily: "var(--font-display, serif)",
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1.35,
                    margin: 0,
                  }}>
                    {paper.title}
                  </p>
                </div>

                {/* ── .book-cover — flat at rest, rotateY(-30deg) on hover */}
                <div className="cp-book-cover">
                  {/* SVG cover art */}
                  <CoverSVG />

                  {/* ── .effect — left gloss strip */}
                  <div className="cp-effect" />

                  {/* ── .light — right shimmer */}
                  <div className="cp-light" />
                </div>

                {/* ── .book-inside — pages block, sits behind cover */}
                <div className="cp-book-inside" />

                {/* ── .btn — read link, fades in below on hover */}
                <a
                  href={paper.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cp-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  Read ↗
                </a>
              </div>
            );
          })}
        </div>

      </section>
    </>
  );
}