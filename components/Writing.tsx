"use client";
import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// ─── Article data ─────────────────────────────────────────────────────────────
const ARTICLES = [
  {
    title: "Is Benchmarking Score Enough to Choose an LLM?",
    subtitle: "The AI leaderboard you trust is probably misleading you",
    date: "Mar 2026", readTime: "8 min",
    publication: "Towards AI",
    tags: ["LLM", "Benchmarking", "AI"],
    url: "https://saurabh-kohli.medium.com",
    images: [
      "/writing/a1-a.webp",
      "/writing/a1-b.webp",
    ],
    gradient: "linear-gradient(135deg,#1a0533 0%,#4b1d8a 55%,#7c3aed 100%)",
    rotation: -25,
    hoverColor: "#a78bfa",
  },
  {
    title: "Are You Ready to Lose the AI Race?",
    subtitle: "The gap between AI leaders and laggards is compounding — fast",
    date: "Mar 2026", readTime: "6 min",
    publication: "Towards AI",
    tags: ["AI Strategy", "Leadership"],
    url: "https://saurabh-kohli.medium.com",
    images: [
      "/writing/a2-a.webp",
      "/writing/a2-b.webp",
    ],
    gradient: "linear-gradient(135deg,#0f0a1e 0%,#2d1b69 55%,#6d28d9 100%)",
    rotation: 25,
    hoverColor: "#f59e0b",
  },
  {
    title: "AI Did Not Simplify Architecture",
    subtitle: "It just moved the complexity somewhere harder to see",
    date: "Feb 2026", readTime: "7 min",
    publication: "Towards AI",
    tags: ["Architecture", "Systems Design"],
    url: "https://saurabh-kohli.medium.com",
    images: [
      "/writing/a3-a.webp",
      "/writing/a3-b.webp",
    ],
    gradient: "linear-gradient(135deg,#140a2e 0%,#3b0764 55%,#7e22ce 100%)",
    rotation: -25,
    hoverColor: "#60a5fa",
  },
  {
    title: "Your Nightly ETL is a Time Bomb",
    subtitle: "Batch pipelines are silently accumulating risk in your data platform",
    date: "Feb 2026", readTime: "7 min",
    publication: "Towards Data Engineering",
    tags: ["ETL", "Data Engineering", "CDC"],
    url: "https://saurabh-kohli.medium.com",
    images: [
      "/writing/a4-a.webp",
      "/writing/a4-b.webp",
    ],
    gradient: "linear-gradient(135deg,#1c0a00 0%,#92400e 55%,#d97706 100%)",
    rotation: 25,
    hoverColor: "#34d399",
  },
  {
    title: "Agent Frameworks & Observability",
    subtitle: "How to keep AI agents from becoming black boxes in production",
    date: "Feb 2026", readTime: "9 min",
    publication: "Towards AI",
    tags: ["AI Agents", "Observability", "LLMOps"],
    url: "https://saurabh-kohli.medium.com",
    images: [
      "/writing/a5-a.webp",
      "/writing/a5-b.webp",
    ],
    gradient: "linear-gradient(135deg,#0d1117 0%,#1d3a5a 55%,#1e40af 100%)",
    rotation: -25,
    hoverColor: "#f472b6",
  },
  {
    title: "Cache as a Service (CaaS)",
    subtitle: "Designing multi-tenant, multi-cloud caching infrastructure at scale",
    date: "Jan 2026", readTime: "10 min",
    publication: "AWS in Plain English",
    tags: ["AWS", "Caching", "Multi-Cloud"],
    url: "https://saurabh-kohli.medium.com",
    images: [
      "/writing/a6-a.webp",
      "/writing/a6-b.webp",
    ],
    gradient: "linear-gradient(135deg,#0a0f1a 0%,#064e3b 55%,#059669 100%)",
    rotation: 25,
    hoverColor: "#fb923c",
  },
  {
    title: "The Invisible Hand of AI",
    subtitle: "Taming risk in finance's new era of autonomous agents",
    date: "Dec 2025", readTime: "8 min",
    publication: "Medium",
    tags: ["Fintech", "AI Risk", "Finance"],
    url: "https://saurabh-kohli.medium.com",
    images: [
      "/writing/a7-a.webp",
      "/writing/a7-b.webp",
    ],
    gradient: "linear-gradient(135deg,#0a1628 0%,#134e4a 55%,#0f766e 100%)",
    rotation: -25,
    hoverColor: "#a3e635",
  },
  {
    title: "The Next Frontier in Portfolio Optimization",
    subtitle: "Agentic workflows and conversational AI reshaping investment strategy",
    date: "Oct 2025", readTime: "7 min",
    publication: "Medium",
    tags: ["AI Agents", "Portfolio", "MCP"],
    url: "https://medium.com/@isaurabhkohli/the-next-frontier-in-portfolio-optimization-f1389852b5ab",
    images: [
      "/writing/a8-a.webp",
    ],
    gradient: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 55%,#1d4ed8 100%)",
    rotation: 25,
    hoverColor: "#22d3ee",
  },
];

const PUB_COLOR: Record<string, string> = {
  "Towards AI": "#0ea5e9",
  "Towards Data Engineering": "#d97706",
  "AWS in Plain English": "#10b981",
  "Medium": "var(--accent)",
};

// ─── Hover card constants ─────────────────────────────────────────────────────
const CYCLE_INTERVAL = 2.5; // seconds between crossfades

/** Pick 5 random articles — recomputed once per page load */
function pickRandom5() {
  const shuffled = [...ARTICLES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

// ─── Per-row image card ───────────────────────────────────────────────────────
interface CardHandle {
  animateIn: () => void;
  animateOut: () => void;
}

const ArticleImageCard = forwardRef<CardHandle, { images: string[]; rotation: number }>(
  function ArticleImageCard({ images, rotation }, ref) {
    const rootRef      = useRef<HTMLDivElement>(null);
    const layerARef    = useRef<HTMLImageElement | null>(null);
    const layerBRef    = useRef<HTMLImageElement | null>(null);
    const cycleTimer   = useRef<gsap.core.Tween | null>(null);
    const preloadTimer = useRef<gsap.core.Tween | null>(null);
    const topLayer     = useRef<"A" | "B">("A");
    const imgIdx       = useRef(0);

    // Initialise hidden state — yPercent:-50 persists across animations for
    // vertical centering on the row without a CSS transform conflict
    useEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      gsap.set(root, { opacity: 0, y: 40, rotation, yPercent: -50 });
    }, [rotation]);

    // ── Kill all in-flight cycle timers + layer tweens ─────────────────────
    const stopCycle = useCallback(() => {
      cycleTimer.current?.kill();
      cycleTimer.current = null;
      preloadTimer.current?.kill();
      preloadTimer.current = null;
      if (layerARef.current) gsap.killTweensOf(layerARef.current);
      if (layerBRef.current) gsap.killTweensOf(layerBRef.current);
    }, []);

    // ── Crossfade tick ─────────────────────────────────────────────────────
    const startCycle = useCallback(() => {
      if (images.length < 2) return;
      function tick() {
        const a = layerARef.current;
        const b = layerBRef.current;
        if (!a || !b) return;
        const visEl = topLayer.current === "A" ? a : b;
        const hidEl = topLayer.current === "A" ? b : a;
        gsap.to(hidEl, { opacity: 1, duration: 0.9, ease: "power2.inOut" });
        gsap.to(visEl, { opacity: 0, duration: 0.9, ease: "power2.inOut" });
        topLayer.current  = topLayer.current === "A" ? "B" : "A";
        imgIdx.current    = (imgIdx.current + 1) % images.length;
        const nextIdx     = (imgIdx.current + 1) % images.length;
        preloadTimer.current = gsap.delayedCall(0.95, () => {
          (visEl as HTMLImageElement).src = images[nextIdx];
        });
        cycleTimer.current = gsap.delayedCall(CYCLE_INTERVAL, tick);
      }
      cycleTimer.current = gsap.delayedCall(CYCLE_INTERVAL, tick);
    }, [images]);

    // ── Load images into layers ────────────────────────────────────────────
    const setLayers = useCallback(() => {
      const a = layerARef.current;
      const b = layerBRef.current;
      if (!a || !b) return;
      topLayer.current = "A";
      imgIdx.current   = 0;
      a.src = images[0];
      b.src = images.length > 1 ? images[1] : images[0];
      gsap.set(a, { opacity: 1 });
      gsap.set(b, { opacity: 0 });
    }, [images]);

    useImperativeHandle(ref, () => ({
      animateIn() {
        const root = rootRef.current;
        if (!root) return;
        stopCycle();
        setLayers();
        gsap.killTweensOf(root);
        // Start below + rotated; the card is already absolutely positioned within the row
        gsap.set(root, { y: 40, rotation });
        gsap.to(root, {
          opacity: 1, y: 0, rotation: -rotation / 2,
          duration: 0.5, ease: "back.out(1.4)",
          onComplete: startCycle,
        });
      },
      animateOut() {
        const root = rootRef.current;
        if (!root) return;
        stopCycle();
        gsap.killTweensOf(root);
        // Exit to the original entry rotation (vice versa of the settled position)
        gsap.to(root, {
          opacity: 0, y: 40, rotation,
          duration: 0.3, ease: "power2.in",
        });
      },
    }), [stopCycle, startCycle, setLayers, rotation]);

    return (
      <div
        ref={rootRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "70%",
          top: "50%",
          width: "280px",
          pointerEvents: "none",
          zIndex: 10,
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "6px",
          overflow: "hidden",
          willChange: "transform, opacity",
          opacity: 0,
        }}
      >
        {/* Layer A — sets natural container height */}
        <img
          ref={el => { layerARef.current = el; }}
          alt=""
          style={{ display: "block", width: "100%", height: "auto" }}
        />
        {/* Layer B — crossfades over Layer A */}
        <img
          ref={el => { layerBRef.current = el; }}
          alt=""
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "auto", opacity: 0 }}
        />
      </div>
    );
  }
);

export function Writing() {
  const cardHandles = useRef<(CardHandle | null)[]>([]);
  const [visibleArticles] = useState(() => pickRandom5());

  // Scroll-reveal for rows
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      gsap.utils.toArray<HTMLElement>(".writing-row").forEach((row, i) => {
        gsap.fromTo(
          row,
          { opacity: 0, x: -16 },
          {
            opacity: 1, x: 0,
            duration: 0.55, ease: "expo.out",
            delay: i * 0.045,
            scrollTrigger: { trigger: row, start: "top 92%", once: true },
          }
        );
      });
    } else {
      gsap.utils.toArray<HTMLElement>(".writing-row").forEach(r => {
        r.style.opacity = "1";
        r.style.transform = "none";
      });
    }
    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  return (
    <section id="writing" aria-label="Writing" className="section">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="divider" style={{ marginBottom: "var(--space-xl)" }} />
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "var(--space-xl)" }}>
        <span className="label">06 · Writing</span>
        <a
          href="https://saurabh-kohli.medium.com"
          target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "0.65rem", color: "var(--text-3)", letterSpacing: "0.06em", transition: "color 0.2s", textDecoration: "none", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)"}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-3)"}
        >
          saurabh-kohli.medium.com ↗
        </a>
      </div>

      {/* ── Article list ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "70%", margin: "0 auto" }}>
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {visibleArticles.map((a, i) => (
            <a
              key={i}
              href={a.url}
              target="_blank" rel="noopener noreferrer"
              className="writing-row"
              onMouseEnter={e => {
                cardHandles.current[i]?.animateIn();
                const h2 = e.currentTarget.querySelector("h2");
                if (h2) (h2 as HTMLElement).style.color = a.hoverColor;
              }}
              onMouseLeave={e => {
                cardHandles.current[i]?.animateOut();
                const h2 = e.currentTarget.querySelector("h2");
                if (h2) (h2 as HTMLElement).style.color = "var(--text-1)";
              }}
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "start",
                gap: "var(--space-lg)",
                padding: "1.4rem 0",
                borderBottom: "1px solid var(--border)",
                textDecoration: "none",
                cursor: "pointer",
                overflow: "visible",
              }}
            >
              {/* left — title · subtitle · tags */}
              <div>
                <h2
                  className="display"
                  style={{
                    fontSize: "clamp(1.05rem, 1.8vw, 1.45rem)",
                    color: "var(--text-1)",
                    lineHeight: 1.25,
                    marginBottom: "0.3rem",
                    fontWeight: 600,
                    transition: "color 0.22s ease",
                  }}
                >
                  {a.title}
                </h2>
                <p style={{ fontSize: "0.72rem", color: "var(--text-3)", lineHeight: 1.5, marginBottom: "0.55rem" }}>
                  {a.subtitle}
                </p>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  {a.tags.map(t => (
                    <span key={t} className="tag" style={{ fontSize: "0.55rem" }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* right — publication · date */}
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem", paddingTop: "0.15rem", minWidth: "max-content" }}>
                <span style={{
                  fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.07em",
                  lineHeight: 1.6,
                  color: PUB_COLOR[a.publication] ?? "var(--text-1)",
                  textTransform: "uppercase",
                }}>
                  {a.publication}
                </span>
                <span style={{ fontSize: "0.6rem", color: "var(--text-3)", letterSpacing: "0.04em" }}>
                  {a.date} · {a.readTime}
                </span>
              </div>

              {/* ── Image card — absolutely positioned within this row ──── */}
              <ArticleImageCard
                ref={el => { cardHandles.current[i] = el; }}
                images={a.images}
                rotation={i % 2 === 0 ? -50 : 50}
              />
            </a>
          ))}
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <div style={{ marginTop: "var(--space-xl)" }}>
          <a href="https://saurabh-kohli.medium.com" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ cursor: "pointer" }}>
            All articles on Medium ↗
          </a>
        </div>
      </div>
    </section>
  );
}
