"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const ROLES = [
  {
    years: "2018–Present", title: "Senior Principal Full Stack",     firm: "BNY, New York",
    projects: [
      "Portfolio Construction Platform",
      "Unified Design System",
      "AppStory Chrome Plugin",
      "Precision Direct Indexing & Tax Transition",
      "Navigator",
      "AdvicePath℠",
    ],
  },
  {
    years: "2015–2018",   title: "Tech Lead (Tech Mahindra)", firm: "Morgan Stanley, New York",
    projects: [
      "Unified Fee Calculator",
      "WealthDesk Advisor Client Portal",
      "Portfolio Management (UMAX)",
      "Select UMA Modernization",
    ],
  },
  {
    years: "2014–2015",   title: "IT Analyst (TCS)",          firm: "American Express, Phoenix",
    projects: [
      "Payments platform digitalization",
      "Account Dashboard redesign",
    ],
  },
  {
    years: "2011–2014",   title: "IT Analyst (TCS)",          firm: "Bank of America, Bangalore",
    projects: [
      "Fraud Detection Validator",
      "Customer Data Reconciliation Tool",
    ],
  },
  {
    years: "2007–2011",   title: "Lead Engineer (HCL)",       firm: "NBC Universal, Noida",
    projects: [
      "OpenText (Vignette) → Drupal CMS migration",
      "Google Ads monetisation integration",
      "Sweepstakes and Newsletter Implementation",
    ],
  },
];

const N = ROLES.length;
const f = (n: number) => n.toFixed(1);

/** Split "Project Name [tag1][tag2]" → { name, tags } */
function parseTech(proj: string): { name: string; tags: string[] } {
  const tags: string[] = [];
  const name = proj.replace(/\[([^\]]+)\]/g, (_, t) => { tags.push(t); return ""; }).trim();
  return { name, tags };
}

export function Timeline() {
  const rightRef  = useRef<HTMLDivElement>(null);
  const svgRef    = useRef<SVGSVGElement>(null);
  const pathRef   = useRef<SVGPathElement>(null);
  const ghostRef  = useRef<SVGPathElement>(null);
  const dotRef    = useRef<SVGCircleElement>(null);
  const nodeRefs  = useRef<(SVGCircleElement | null)[]>(Array.from({ length: N }, () => null));
  const entryRefs = useRef<(HTMLDivElement   | null)[]>(Array.from({ length: N }, () => null));
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>(Array.from({ length: N }, () => null));
  const stRef     = useRef<ScrollTrigger | null>(null);
  const lenRef    = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const container = rightRef.current;
    const svg       = svgRef.current;
    const path      = pathRef.current;
    const ghost     = ghostRef.current;
    const dot       = dotRef.current;
    if (!container || !svg || !path || !ghost || !dot) return;

    /* ── build / rebuild the SVG path from live entry positions ── */
    const buildPath = () => {
      const W = container.offsetWidth;
      const H = container.offsetHeight;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

      // On mobile (< 720px) the layout collapses to a single left-aligned column.
      // Use a narrow left-edge cx (20px) with no sway so the path becomes a
      // straight vertical indicator line on the left — rebuilt live via ResizeObserver.
      const isMobile = W < 720;
      const cx   = isMobile ? W - 20 : W * 0.50;
      const SWAY = isMobile ? 0  : W * 0.07;

      // Use getBoundingClientRect() relative to the container's own rect.
      // This bypasses the offsetParent chain entirely and works correctly
      // regardless of any CSS transforms or overflow on ancestor elements.
      const cRect = container.getBoundingClientRect();
      const stops = titleRefs.current.map((el, i) => {
        if (!el) return { x: cx, y: (H / (N - 1)) * i };
        const r = el.getBoundingClientRect();
        return { x: cx, y: (r.top - cRect.top) + r.height / 2 };
      });

      // True S-curve per segment: cp1 and cp2 lean to *opposite* sides,
      // and the sign flips every segment → serpentine river look
      let d = `M ${f(stops[0].x)} ${f(stops[0].y)}`;
      for (let i = 1; i < N; i++) {
        const { y: y0 } = stops[i - 1];
        const { y: y1 } = stops[i];
        const gap  = y1 - y0;
        const sign = i % 2 === 0 ? 1 : -1;       // alternates per segment
        const cp1x = cx + sign * SWAY;
        const cp2x = cx - sign * SWAY;             // opposite side → real S-curve
        d += ` C ${f(cp1x)} ${f(y0 + gap * 0.3)},${f(cp2x)} ${f(y0 + gap * 0.7)},${f(cx)} ${f(y1)}`;
      }

      path.setAttribute("d", d);
      ghost.setAttribute("d", d);

      // Place waypoint rings at each stop
      stops.forEach(({ y }, i) => {
        nodeRefs.current[i]?.setAttribute("cx", f(cx));
        nodeRefs.current[i]?.setAttribute("cy", f(y));
      });

      lenRef.current = path.getTotalLength();
      gsap.set(path, { strokeDasharray: lenRef.current, strokeDashoffset: lenRef.current });
      const p0 = path.getPointAtLength(0);
      dot.setAttribute("cx", f(p0.x));
      dot.setAttribute("cy", f(p0.y));
    };

    // Wait for all fonts (incl. BacklyHighs) to load so h3 heights are final,
    // then step one rAF to let the browser flush any resulting reflows before
    // we measure offsetTop values and build the path.
    document.fonts.ready.then(() => requestAnimationFrame(() => {
      /* ── measure first, then set initial hidden states ── */
      buildPath();

      gsap.set(entryRefs.current, { autoAlpha: 0, x: (i: number) => i % 2 === 0 ? 22 : -22 });

      // Hide circles by collapsing the r attribute to 0.
      // This avoids any CSS transform / svgOrigin complexity — SVG circles always
      // render centered at (cx,cy) regardless of r, so no origin math is needed.
      nodeRefs.current.forEach((node) => {
        if (node) node.setAttribute("r", "0");
      });

      gsap.set(dot, { opacity: 0 });

      const revealed  = new Set<number>();
      const nodedone  = new Set<number>();
      let   lastPulse = -1;

      /* ── main scroll driver ── */
      stRef.current = ScrollTrigger.create({
        trigger: container,
        start:   "top 75%",
        end:     "bottom 30%",
        scrub:   0.6,
        onUpdate(self) {
          const p   = self.progress;
          const len = lenRef.current;
          if (!len) return;

          // 1. Draw path progressively (DrawSVG equivalent via dashoffset)
          gsap.set(path, { strokeDashoffset: len * (1 - p) });

          // 2. Move glowing dot along path (MotionPath equivalent via getPointAtLength)
          const pt = path.getPointAtLength(p * len);
          gsap.set(dot, { attr: { cx: pt.x.toFixed(1), cy: pt.y.toFixed(1) }, opacity: p > 0.02 ? 1 : 0 });

          // 3. Reveal entries + pop nodes as dot reaches each waypoint.
          // On mobile the container is much taller than the viewport, so the
          // linear sp = p*(N-1) mapping fires too late for lower entries.
          // Instead, check each title's actual viewport position directly.
          const sp = p * (N - 1); // 0 → 4
          const isMobile = container.offsetWidth < 720;

          if (isMobile) {
            // Trigger when the entry's title mid-point crosses 60% of the viewport height
            const vhMid = window.innerHeight * 0.60;
            entryRefs.current.forEach((el, i) => {
              if (!el || revealed.has(i)) return;
              const titleEl = titleRefs.current[i];
              if (!titleEl) return;
              const { top, height } = titleEl.getBoundingClientRect();
              if (top + height * 0.5 <= vhMid) {
                revealed.add(i);
                gsap.to(el, { autoAlpha: 1, x: 0, duration: 0.55, ease: "power2.out" });
              }
            });
            nodeRefs.current.forEach((node, i) => {
              if (!node || nodedone.has(i)) return;
              const titleEl = titleRefs.current[i];
              if (!titleEl) return;
              const { top, height } = titleEl.getBoundingClientRect();
              if (top + height * 0.5 <= vhMid) {
                nodedone.add(i);
                gsap.to(node, { attr: { r: 5.5 }, duration: 0.4, ease: "back.out(2.5)" });
              }
            });
          } else {
            entryRefs.current.forEach((el, i) => {
              if (!el || revealed.has(i)) return;
              if (sp >= i - 0.12) {
                revealed.add(i);
                gsap.to(el, { autoAlpha: 1, x: 0, duration: 0.55, ease: "power2.out" });
              }
            });
            nodeRefs.current.forEach((node, i) => {
              if (!node || nodedone.has(i)) return;
              if (sp >= i - 0.08) {
                nodedone.add(i);
                // Grow r from 0 → 5.5 — no transforms, so no origin issues ever.
                gsap.to(node, { attr: { r: 5.5 }, duration: 0.4, ease: "back.out(2.5)" });
              }
            });
          }

          // 4. Elastic pulse at each waypoint
          const nearest = Math.round(sp);
          if (nearest !== lastPulse && Math.abs(sp - nearest) < 0.14 && nearest >= 0 && nearest < N) {
            lastPulse = nearest;
            const node = nodeRefs.current[nearest];
            if (node) {
              // Pulse: expand r then settle — pure attribute, no transform origin needed.
              gsap.fromTo(node,
                { attr: { r: 5.5 } },
                { attr: { r: 14 }, duration: 0.16, ease: "elastic(3, 1)", overwrite: "auto",
                  onComplete: () => { gsap.to(node, { attr: { r: 5.5 }, duration: 0.35, ease: "power2.out" }); } }
              );
            }
          }
        },
      });

      ScrollTrigger.refresh();
    })); // end fonts.ready → rAF

    /* ── rebuild on resize ── */
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        buildPath();
        stRef.current?.refresh();
      }));
    });
    ro.observe(container);

    return () => { stRef.current?.kill(); ro.disconnect(); };
  }, []);

  return (
    <section id="career" aria-label="Career" className="section">
      <div className="divider" style={{ marginBottom: "var(--space-xl)" }} />
      <div className="section-header" style={{ marginBottom: "var(--space-md)" }}>
        <span className="label">03 · Career</span>
      </div>

      <div className="tl-grid" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--space-2xl)", alignItems: "start" }}>

        {/* ── Left sticky heading ── */}
        <div className="tl-sticky-head" style={{ position: "sticky", top: 120 }}>
          <h2 className="display" style={{ fontSize: "clamp(2rem,4vw,3rem)", marginBottom: "var(--space-md)", lineHeight: 1.1 }}>
            18 years.<br />Five firms.
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: "0.88rem", lineHeight: 1.8 }}>
            One consistent thread: shipping products that perform at scale.
          </p>
        </div>

        {/* ── Right: SVG motion-path timeline ── */}
        <div ref={rightRef} style={{ position: "relative" }}>

          {/* SVG layer: ghost track + animated draw path + nodes + traveling dot */}
          <svg ref={svgRef} aria-hidden="true" className="tl-svg"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
            <defs>
              <filter id="tl-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Dim ghost track */}
            <path ref={ghostRef} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
            {/* Animated accent draw */}
            <path ref={pathRef}  fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
            {/* Waypoint rings */}
            {ROLES.map((_, i) => (
              <circle key={i} ref={el => { nodeRefs.current[i] = el; }}
                r="5.5" fill="var(--bg)" stroke="var(--accent)" strokeWidth="1.5" />
            ))}
            {/* Glowing traveling dot */}
            <circle ref={dotRef} r="9" fill="var(--accent)" filter="url(#tl-glow)" />
          </svg>

          {/* Entry cards — alternate right / left flanking the centre lane
               Left cards  (odd):  0 – 40 %   text-align right
               Right cards (even): 60 – 100 %  text-align left
               Path + nodes live in the 40–60 % centre channel            */}
          {ROLES.map((r, i) => {
            const isRight = i % 2 === 0;
            return (
              <div key={i} ref={el => { entryRefs.current[i] = el; }} className="tl-entry"
                style={{
                  width: "40%",
                  marginLeft: isRight ? "60%" : "0",
                  paddingTop: "var(--space-lg)",
                  paddingBottom: "var(--space-lg)",
                  textAlign: isRight ? "left" : "right",
                  opacity: 0, /* prevent SSR flash */
                }}>
                <span style={{ fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase",
                  display: "block", marginBottom: "0.5rem", color: "var(--accent)" }}>
                  {r.years}
                </span>
                <h3 ref={el => { titleRefs.current[i] = el; }}
                  className="display" style={{ fontSize: "clamp(1rem,1.6vw,1.4rem)", marginBottom: "0.25rem", color: "var(--text-1)" }}>
                  {r.title}
                </h3>
                <div style={{ fontSize: "0.78rem", marginBottom: "0.6rem", color: "var(--text-2)" }}>
                  {r.firm}
                </div>
                {/* Project bullets with inline tech pills */}
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {r.projects.map((proj, j) => {
                    const { name, tags } = parseTech(proj);
                    return (
                      <li key={j} className={`tl-proj-item${isRight ? "" : " tl-proj-item-rev"}`} style={{
                        display: "flex",
                        flexDirection: isRight ? "row" : "row-reverse",
                        gap: "0.45rem",
                        alignItems: "flex-start",
                        fontSize: "0.78rem",
                        lineHeight: 1.65,
                        color: "var(--text-3)",
                        marginBottom: "0.35rem",
                      }}>
                        <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: "0.15em" }}>—</span>
                        <span className={`tl-proj-text${isRight ? "" : " tl-proj-text-rev"}`} style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", alignItems: "baseline",
                          justifyContent: isRight ? "flex-start" : "flex-end" }}>
                          <span>{name}</span>
                          {tags.map((tag, k) => (
                            <span key={k} style={{
                              display: "inline-block",
                              fontSize: "0.58rem",
                              letterSpacing: "0.07em",
                              fontFamily: "var(--font-mono, 'SF Mono', 'Fira Mono', monospace)",
                              color: "var(--accent)",
                              background: "rgba(245,78,38,0.08)",
                              border: "1px solid rgba(245,78,38,0.28)",
                              borderRadius: "4px",
                              padding: "0.1em 0.45em",
                              lineHeight: 1.6,
                              verticalAlign: "middle",
                            }}>
                              {tag}
                            </span>
                          ))}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .tl-grid { grid-template-columns: 1fr !important; }
          /* Restore sticky with background so entries scroll cleanly beneath it */
          .tl-sticky-head {
            position: sticky !important;
            top: 70px !important;
            background: var(--bg) !important;
            z-index: 10 !important;
            padding-bottom: 1.25rem !important;
          }
          /* Ensure subtitle text wraps and never overflows into entry blocks */
          .tl-sticky-head p {
            max-width: 100% !important;
            white-space: normal !important;
            overflow-wrap: break-word !important;
          }
          .tl-entry { width: 100% !important; margin-left: 0 !important; }
        }
        /* Mobile: right-aligned entries; path moves to extreme right (cx = W - 20).
           All bullets use row-reverse so the dash sits on the right.            */
        @media (max-width: 768px) {
          .tl-grid { gap: var(--space-lg) !important; }
          .tl-entry {
            width: 100% !important;
            margin-left: 0 !important;
            text-align: right !important;
            padding-right: 2rem !important;
            padding-left: 0 !important;
          }
          /* All bullet rows: dash on the right, text on the left */
          .tl-proj-item,
          .tl-proj-item-rev { flex-direction: row-reverse !important; }
          .tl-proj-text,
          .tl-proj-text-rev { justify-content: flex-end !important; }
        }
        @media (max-width: 640px) {
          .tl-entry {
            padding-top: 1rem !important;
            padding-bottom: 1rem !important;
            padding-right: 2rem !important;
            padding-left: 0 !important;
          }
          .tl-entry h3 { font-size: 1rem !important; }
        }
      `}</style>
    </section>
  );
}
