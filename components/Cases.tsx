"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */
const HOLDINGS = [
  {
    abbr:      "AI",
    cardBg:    "#141a06",
    innerBg:   "#0c1203",
    side:      "AGENTIFY",
    firm:      "BNY",
    year:      "2024–present",
    title:     "Conversational AI Portfolio Construction",
    desc:      "Architected BNY's Eliza-powered portfolio construction platform on a multi-agent orchestration workflow. MCP-based Nuggets integrate multiple investment systems, reducing portfolio generation from days to real time. Elasticsearch optimisation cut query latency from ~10 s to ~800 ms.",
    kpis: [
      { value: "60%",   label: "Gen Speed" },
      { value: "800ms", label: "Query Latency" },
      { value: "1",     label: "Patent Filed" },
    ],
    tags:    ["PL/SQL", "Elastic", "Azure", "Kubernetes", "Hazelcast", "Web Socket", "IONIC", "Python", "GO", "Kafka", "Snowflake", "MCP"],
    accent:  "#a8cc30",
    tagClass:"tag-lime",
    glowRgb: "168,204,48",
  },
  {
    abbr:      "DS",
    cardBg:    "#0f0b1e",
    innerBg:   "#090615",
    side:      "ARCHITECT",
    firm:      "BNY",
    year:      "2022–2024",
    title:     "Unified Design System at Enterprise Scale",
    desc:      "Built BNY's first enterprise-wide design system adopted by 40+ product teams. 320+ components, full WCAG 2.1 AA compliance — baked on design-token principles with strict Atomic design methodology.",
    kpis: [
      { value: "47+%", label: "Faster Time to Market" },
      { value: "35%",  label: "Cost Reduction" },
      { value: "320+", label: "Components" },
    ],
    tags:    ["Web Components", "A11y", "Storybook", "Svelte", "Design Tokens", "AST", "Ionic", "Capacitor", "Browser APIs"],
    accent:  "#7c5cfc",
    tagClass:"tag-violet",
    glowRgb: "124,92,252",
  },
  {
    abbr:      "WM",
    cardBg:    "#1c1505",
    innerBg:   "#120e03",
    side:      "MODERNIZE",
    firm:      "Morgan Stanley",
    year:      "2015–2018",
    title:     "WealthDesk + Unified Fee",
    desc:      "Led architecture-driven modernization of Morgan Stanley's wealth management ecosystem — unified WealthDesk, SOA enabling real-time Select UMA & UMAX, scalable account onboarding (AIUP), tiered fee re-architecture, and consistent data access across all systems.",
    kpis: [
      { value: "70%", label: "Faster Onboarding" },
      { value: "<2s", label: "Portfolio Latency" },
      { value: "60%", label: "Less Reconciliations" },
    ],
    tags:    ["Angular", "TypeScript", "Node.js", "MongoDB", "GraphQL", "GruntJS", "ExpressJS", "Spring Boot"],
    accent:  "#f59e0b",
    tagClass:"tag-amber",
    glowRgb: "245,158,11",
  },
  {
    abbr:      "FX",
    cardBg:    "#060e1a",
    innerBg:   "#040a12",
    side:      "MOBILIZE",
    firm:      "American Express",
    year:      "2014–2015",
    title:     "Global Payments Modernization",
    desc:      "Migrated AmEx's legacy payments UI to a React-based micro-frontend architecture. CI/CD pipeline cut release cycles from weeks to hours, directly reducing customer-facing incident rate.",
    kpis: [
      { value: "30%",  label: "Reduced Support Calls" },
      { value: "25%",  label: "Faster Deploys" },
      { value: "15+",  label: "Browsers / Devices Supported" },
    ],
    tags:    ["React", "NodeJS", "Docker", "CI/CD", "Apache Cordova", "JavaScript", "MongoDB", "Express"],
    accent:  "#0ea5e9",
    tagClass:"tag-sky",
    glowRgb: "14,165,233",
  },
];

/* Exit directions: even-index cards fly LEFT, odd fly RIGHT */
const EXIT_DIR  = [  -1,  1, -1,  1];
/* Base stack tilt when buried (degrees) */
const BASE_TILT = [0.0, 1.6, -1.1, 2.2];
/* px of scroll budget per card (dwell + exit) */
const SCROLL_PER_CARD = 900;
/* Fraction of each card's slot spent dwelling at front vs exiting */
const DWELL_FRAC = 0.44;
/* Extra px of scroll AFTER all cards exit — used to reveal the next section.
   The stage clips from the bottom (heading stays visible) while the next
   section physically scrolls up into the exposed gap. */
const REVEAL_SCROLL = 800;

/** Maps ScrollTrigger progress [0,1] → rawIdx [0,N].
 *  Each card slot = dwell phase (rawIdx frozen) + exit phase (rawIdx advances). */
function mapProgress(p: number, N: number): number {
  const slot = 1 / N;
  for (let i = 0; i < N; i++) {
    const slotStart = i * slot;
    const dwellEnd  = slotStart + slot * DWELL_FRAC;
    const slotEnd   = (i + 1) * slot;
    if (p <= slotEnd || i === N - 1) {
      if (p <= dwellEnd) return i;
      const t = (p - dwellEnd) / (slot * (1 - DWELL_FRAC));
      return i + Math.min(t, 1);
    }
  }
  return N;
}

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
function parseKpi(raw: string) {
  const prefix = raw.match(/^[^0-9]*/)?.[0] ?? "";
  const num    = parseFloat(raw);
  const suffix = isNaN(num) ? "" : raw.replace(/^[^0-9]*[0-9.]+/, "");
  return { prefix, num, suffix, ok: !isNaN(num) };
}

function SparkBar({ weight, accent, animate }: { weight: number; accent: string; animate: boolean }) {
  const barRef = useRef<SVGRectElement>(null);
  const W = 140, H = 5, R = 3;
  useEffect(() => {
    if (!barRef.current) return;
    const filled = (weight / 100) * W;
    if (animate) {
      gsap.fromTo(barRef.current,
        { attr: { width: 0 } },
        { attr: { width: filled }, duration: 1.4, ease: "expo.out", delay: 0.2 }
      );
    } else {
      barRef.current.setAttribute("width", String(filled));
    }
  }, [animate, weight]);
  return (
    <svg width={W} height={H} style={{ display: "block", overflow: "visible" }} aria-hidden>
      <rect x={0} y={0} width={W} height={H} rx={R} fill="rgba(255,255,255,0.06)" />
      <rect ref={barRef} x={0} y={0} width={0} height={H} rx={R} fill={accent}
        style={{ filter: `drop-shadow(0 0 5px ${accent}88)` }} />
    </svg>
  );
}

function KpiCounter({
  value, label, accent, run,
}: { value: string; label: string; accent: string; run: boolean }) {
  const elRef = useRef<HTMLSpanElement>(null);
  const { prefix, num, suffix, ok } = parseKpi(value);
  useEffect(() => {
    if (!run || !ok || !elRef.current) return;
    const el = elRef.current;
    const isInt = Number.isInteger(num);
    const obj = { val: 0 };
    gsap.to(obj, {
      val: num, duration: 1.4, ease: "power2.out",
      onUpdate() {
        el.textContent = prefix + (isInt ? Math.round(obj.val) : obj.val.toFixed(1));
      },
    });
  }, [run, ok, num, prefix]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.05em" }}>
        <span ref={elRef} style={{
          fontSize: "2rem", fontFamily: "var(--font-beiruti)",
          fontWeight: 800, color: accent, lineHeight: 1, letterSpacing: "-0.01em",
        }}>
          {ok ? prefix + Math.round(num) : value}
        </span>
        {ok && suffix && (
          <span style={{
            fontSize: "0.68rem", fontFamily: "var(--font-body)",
            fontWeight: 600, color: accent, opacity: 0.75, letterSpacing: "0.05em",
          }}>
            {suffix.toLowerCase()}
          </span>
        )}
      </div>
      <span style={{
        fontSize: "0.55rem", fontFamily: "var(--font-body)", fontWeight: 500,
        letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-2)",
      }}>
        {label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export function Cases() {
  const N          = HOLDINGS.length;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef   = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const hintRef    = useRef<HTMLDivElement>(null);

  /* animated = set of card indices whose KPI counters have fired */
  const [animated, setAnimated] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Set initial stack positions */
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const d = i;
      gsap.set(card, {
        x: 0,
        y: d * 24,
        rotation: BASE_TILT[i] ?? 0,
        scale: 1 - d * 0.065,
        opacity: [1, 0.80, 0.55, 0.28][d] ?? 0,
        zIndex: N - i,
      });
    });

    if (reduced) return;

    const activeIdxRef = { val: 0 };

    const st = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start:   "top top",
      end:     `+=${N * SCROLL_PER_CARD + REVEAL_SCROLL}`,
      scrub:   0.8,

      onUpdate(self) {
        /* ── Two-phase scroll budget ──────────────────────────────────────
           Phase 1: card animations   (0 → N * SCROLL_PER_CARD px)
           Phase 2: section reveal    (N * SCROLL_PER_CARD → + REVEAL_SCROLL px)
        ─────────────────────────────────────────────────────────────────── */
        const totalScroll  = N * SCROLL_PER_CARD + REVEAL_SCROLL;
        const rawScrollPx  = self.progress * totalScroll;
        const cardProgress = Math.min(rawScrollPx / (N * SCROLL_PER_CARD), 1);
        const rawIdx       = mapProgress(cardProgress, N);
        const snapIdx      = Math.min(N - 1, Math.max(0, Math.round(rawIdx)));

        /* Fade scroll hint */
        if (hintRef.current && self.progress > 0.04) {
          hintRef.current.style.opacity   = "0";
          hintRef.current.style.transform = "translateY(6px)";
        }

        /* ── Phase 2: clip stage from bottom so the next section scrolls in ──
           inset(0 0 X% 0) = clip X% off the bottom.
           At X = 0   → full stage visible (cards area).
           At X = 100 → stage fully clipped / invisible.
           Meanwhile the next section has physically scrolled into the
           uncovered viewport area behind the clipped stage.
           Reveal starts the moment the last card begins its exit (dwell ends).
        ─────────────────────────────────────────────────────────────────── */
        // rawScrollPx when the last card finishes its dwell and starts moving
        const lastCardExitStart = (N - 1) * SCROLL_PER_CARD + SCROLL_PER_CARD * DWELL_FRAC;
        // span from that point to the very end of the scroll budget
        const revealSpan        = N * SCROLL_PER_CARD + REVEAL_SCROLL - lastCardExitStart;
        const revealT = Math.max(0, Math.min(1, (rawScrollPx - lastCardExitStart) / revealSpan));
        if (stageRef.current) {
          const clip = revealT * 100; // clip stage fully (heading is now outside)
          stageRef.current.style.clipPath =
            clip > 0.05 ? `inset(0 0 ${clip.toFixed(1)}% 0)` : '';
        }

        /* ── Heading exit: slides off the top as ManifestoStrip reveals ──
           The visible top edge of ManifestoStrip (through clipPath) is at:
             visibleStripTop = (1 - revealT) * vh  (from viewport top)
           When that reaches heading's bottom edge, we start pushing heading up.
           heading exits completely when visibleStripTop = 0.
        ─────────────────────────────────────────────────────────────────── */
        if (headingRef.current) {
          const vh       = window.innerHeight;
          const headingH = headingRef.current.offsetHeight;
          const visibleStripTop = (1 - revealT) * vh;
          const pushT = Math.max(0, Math.min(1, (headingH - visibleStripTop) / headingH));
          gsap.set(headingRef.current, { y: -pushT * headingH });
        }

        /* Trigger KPI counters when card snaps to front */
        if (snapIdx !== activeIdxRef.val) {
          activeIdxRef.val = snapIdx;
          setAnimated(prev => new Set(prev).add(snapIdx));
        }

        /* Per-card transform */
        HOLDINGS.forEach((_, i) => {
          const card = cardRefs.current[i];
          if (!card) return;

          const depth = i - rawIdx; // negative = exited, 0 = front, positive = buried

          if (depth <= -1) {
            /* Fully exited */
            const xDir = EXIT_DIR[i] ?? -1;
            gsap.set(card, { x: `${xDir * 115}%`, rotation: xDir * 15, opacity: 0, scale: 0.9 });

          } else if (depth < 0) {
            /* Mid-exit: depth in (-1, 0) → exitT in (0, 1) */
            const t    = -depth;                         // 0 at front → 1 fully gone
            const xDir = EXIT_DIR[i] ?? -1;
            gsap.set(card, {
              x:        `${xDir * t * 115}%`,
              rotation: xDir * t * 15,
              opacity:  Math.max(0, 1 - t * 1.35),
              scale:    1 - t * 0.06,
              y:        0,
            });

          } else {
            /* In stack: depth 0 = front, depth 1 = second, … */
            const d    = Math.min(depth, 3.5);
            const tilt = (BASE_TILT[i] ?? 0) * Math.min(d, 1);
            gsap.set(card, {
              x:        0,
              rotation: tilt,
              y:        d * 24,
              scale:    1 - d * 0.065,
              opacity:  d > 3.2 ? 0 : Math.max(0, 1 - d * 0.22),
            });
          }
        });
      },
    });

    return () => {
      st.kill();
      if (headingRef.current) gsap.set(headingRef.current, { y: 0 });
    };
  }, [N]);

  /* ─── Render ──────────────────────────────────────────────────────────── */
  return (
    <section id="work" aria-label="Selected Work" style={{ position: "relative", zIndex: 2 }}>

      {/* ── Scroll wrapper — provides the full scroll budget ─────────────── */}
      <div
        ref={wrapperRef}
        style={{ height: `calc(100vh + ${N * SCROLL_PER_CARD + REVEAL_SCROLL}px)`, position: "relative" }}
      >
        {/* ── Heading — sticky independently; exits when ManifestoStrip reveals ── */}
        <div
          ref={headingRef}
          className="section"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: "var(--bg)",
            paddingBottom: "1.5rem",
            flexShrink: 0,
          }}
        >
          <div className="section-header" style={{ marginBottom: "0.5rem" }}>
            <span className="label">01 · Selected Work</span>
            <span className="label">{N} Positions</span>
          </div>
          <h2 className="display" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.0 }}>
            <span style={{ fontFamily: "var(--font-backly)", fontWeight: 400, textTransform: "none", letterSpacing: "0.01em" }}>building</span>{" "}
            <span style={{ color: "var(--accent)", fontStyle: "italic" }}>Impact</span>
          </h2>
        </div>

        {/* Sticky stage — pins the card viewport for the duration */}
        <div
          ref={stageRef}
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 10,
          }}>

          {/* ── Card + progress — centred in the remaining space ── */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "3rem",
          }}>

          {/* ── Card stack ─────────────────────────────────────────── */}
          <div
            className="rl-stack"
            style={{
              position: "relative",
              width: "min(900px, 70vw)",
              height: "min(430px, 52vh)",
            }}
          >
            {HOLDINGS.map((h, i) => (
              <div
                key={h.abbr}
                ref={el => { cardRefs.current[i] = el; }}
                className="rl-card"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 20,
                  overflow: "hidden",
                  border: `1px solid rgba(${h.glowRgb}, 0.35)`,
                  borderTop: `2.5px solid ${h.accent}`,
                  background: h.cardBg,
                  boxShadow: `0 32px 80px rgba(0,0,0,0.85)`,
                  padding: "1.75rem 2rem",
                  display: "flex",
                  flexDirection: "row",
                  gap: "1.75rem",
                  willChange: "transform",
                  backfaceVisibility: "hidden",
                }}
              >
                {/* ── Tags — top-right absolute ── */}
                <div className="rl-tags" style={{
                  position: "absolute",
                  top: "1.25rem",
                  right: "1.75rem",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.35rem",
                  justifyContent: "flex-end",
                  zIndex: 2,
                  maxWidth: "clamp(160px, 28%, 260px)",
                }}>
                  {h.tags.map(tag => (
                    <span key={tag} className={`tag ${h.tagClass}`}>{tag}</span>
                  ))}
                </div>

                {/* ── SIDE — bottom-left absolute, display font ── */}
                <div style={{ position: "absolute", bottom: "-1.5rem", left: "1.75rem", zIndex: 2, lineHeight: 1 }}>
                  <span style={{
                    fontFamily: "var(--font-sloppy-hollow)",
                    fontSize: "6rem",
                    fontWeight: 400,
                    color: h.accent,
                    opacity: 0.4,
                    letterSpacing: "0",
                  }}>
                    {h.side}
                  </span>
                </div>

                {/* ── Left column: firm+year · title · desc ── */}
                <div style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                  minWidth: 0,
                  position: "relative",
                  zIndex: 1,
                  paddingBottom: "3.5rem",
                }}>
                  {/* Firm + Year */}
                  <div>
                    <div style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: h.accent,
                      letterSpacing: "0.04em",
                      lineHeight: 1.3,
                    }}>
                      {h.firm}
                    </div>
                    <div className="label" style={{ fontSize: "0.54rem", marginTop: "0.12rem", color: "var(--ink-3)" }}>
                      {h.year}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontFamily: "var(--font-party-pocket)",
                    fontSize: "clamp(1.7rem, 3.2vw, 2.6rem)",
                    fontWeight: 400,
                    color: "var(--ink)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.01em",
                    margin: 0,
                  }}>
                    {h.title}
                  </h3>

                  {/* Description */}
                  <p className="rl-desc">
                    {h.desc}
                  </p>
                </div>

                {/* ── Right column: KPI cards pushed to bottom ── */}
                <div style={{
                  width: "clamp(160px, 26%, 240px)",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  position: "relative",
                  zIndex: 1,
                  justifyContent: "flex-end",
                  paddingTop: "2.5rem",
                }}>
                    {h.kpis.map((kpi, ki) => (
                      <div key={ki} className="kpi-card" style={{
                        background: `rgba(${h.glowRgb}, 0.05)`,
                        border: `1px solid rgba(${h.glowRgb}, 0.14)`,
                        borderRadius: 8,
                        padding: "0.35rem 0.55rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        cursor: "default",
                        transformOrigin: "center center",
                        transition: "border-color 0.2s ease, background 0.2s ease",
                      }}>
                        <KpiCounter
                          value={kpi.value}
                          label={kpi.label}
                          accent={h.accent}
                          run={animated.has(i)}
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          </div>{/* end card+progress centered wrapper */}

          {/* ── Scroll hint ────────────────────────────────────────── */}
          <div
            ref={hintRef}
            style={{
              position: "absolute",
              bottom: "2.2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.35rem",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}
          >
            <span className="label" style={{ fontSize: "0.57rem", color: "var(--ink-3)" }}>
              scroll to explore
            </span>
            <span className="rl-arrow">↓</span>
          </div>
        </div>
      </div>

      <style>{`
        /* Description line-clamp */
        .rl-desc {
          font-family: var(--font-body);
          font-size: 0.78rem;
          line-height: 1.78;
          color: var(--ink);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        /* KPI card hover — continuous gentle rock */
        @keyframes kpi-rock {
          0%, 100% { transform: rotate(-1.8deg) scale(1.02); }
          50%       { transform: rotate( 1.8deg) scale(1.02); }
        }
        .kpi-card:hover {
          animation: kpi-rock 0.55s ease-in-out infinite;
        }

        /* Bouncing scroll arrow */
        .rl-arrow {
          color: var(--ink-3);
          font-size: 0.7rem;
          animation: rl-bounce 1.6s ease-in-out infinite;
        }
        @keyframes rl-bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(5px); }
        }

        /* Tag colour overrides */
        .tag-amber { border-color: #f59e0b; color: #f59e0b; background: rgba(245,158,11,0.1); }
        .tag-sky   { border-color: #0ea5e9; color: #0ea5e9; background: rgba(14,165,233,0.1); }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .rl-stack {
            width: calc(100vw - 2.5rem) !important;
            height: auto !important;
            min-height: calc(100dvh - 240px) !important;
          }
          .rl-card {
            flex-direction: column !important;
            padding: 3.5rem 1.2rem 1.2rem !important;
            gap: 1rem !important;
          }
          /* Right KPI column: go full-width, horizontal row */
          .rl-card > div:last-child {
            width: 100% !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            justify-content: flex-start !important;
            padding-top: 0 !important;
          }
          /* Tags: static so they don't overlap title; smaller pills */
          .rl-tags {
            position: static !important;
            max-width: 100% !important;
            justify-content: flex-start !important;
            margin-bottom: 0.5rem;
          }
          .rl-tags .tag {
            font-size: 0.52rem !important;
            padding: 2px 6px !important;
          }
          .rl-desc {
            -webkit-line-clamp: 3 !important;
          }
        }
        @media (max-width: 480px) {
          .rl-stack {
            min-height: calc(100dvh - 200px) !important;
          }
        }
      `}</style>
    </section>
  );
}
