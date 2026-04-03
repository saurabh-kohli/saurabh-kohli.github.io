"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TALKS = [
  {
    event: "WSO2Con 2025",
    location: "Barcelona, Spain",
    year: "2025",
    type: "Conference Talk",
    title: "API-First Architecture: Fostering Reuse at Enterprise Scale",
    description: `Presented the significance of an API-first approach in large-scale financial platforms, covering reusability patterns, governance, and the MCP protocol layer used at BNY to connect AI agents to Bloomberg, FactSet, and internal trading APIs.`,
    slides: null,
  },
];

export function Speaking() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const rows = containerRef.current?.querySelectorAll<HTMLElement>(".speak-row");
    rows?.forEach((row, i) => {
      gsap.fromTo(
        row,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "expo.out",
          scrollTrigger: { trigger: row, start: "top 88%", once: true },
        }
      );
    });
  }, []);

  return (
    <section id="speaking" aria-label="Speaking" className="section">
      <div className="divider" style={{ marginBottom: "var(--space-xl)" }} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "var(--space-xl)",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <span className="label">06 · Speaking</span>
        <span className="label" style={{ color: "var(--text-3)" }}>
          1 talk · More scheduled
        </span>
      </div>

      <div ref={containerRef}>
        {TALKS.map((talk, i) => (
          <div
            key={i}
            className="speak-row"
            style={{
              borderTop: "0.5px solid var(--border)",
              padding: "var(--space-xl) 0",
              display: "grid",
              gridTemplateColumns: "22% 1fr",
              gap: "var(--space-xl)",
            }}
          >
            {/* Left: year / meta */}
            <div>
              <div
                className="display"
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 5rem)",
                  color: "var(--text-3)",
                  lineHeight: 1,
                  marginBottom: "var(--space-md)",
                }}
              >
                {talk.year}
              </div>
              <div
                className="label"
                style={{ color: "var(--accent)", display: "block", marginBottom: "0.4rem" }}
              >
                {talk.event}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "0.4rem" }}>
                {talk.location}
              </div>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "0.65rem",
                  fontFamily: "var(--font-body)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--text-3)",
                  border: "0.5px solid var(--border-mid)",
                  padding: "3px 10px",
                  borderRadius: "2px",
                }}
              >
                {talk.type}
              </span>
            </div>

            {/* Right: title / description */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h2
                className="display"
                style={{
                  fontSize: "clamp(1.3rem, 2.5vw, 2rem)",
                  color: "var(--text-1)",
                  marginBottom: "var(--space-md)",
                  lineHeight: 1.2,
                }}
              >
                {talk.title}
              </h2>
              <p
                style={{
                  color: "var(--text-2)",
                  fontSize: "0.88rem",
                  lineHeight: 1.75,
                  maxWidth: "58ch",
                }}
              >
                {talk.description}
              </p>
              {talk.slides && (
                <a
                  href={talk.slides}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                  style={{ display: "inline-block", marginTop: "var(--space-lg)", alignSelf: "flex-start" }}
                >
                  View Slides ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .speak-row { grid-template-columns: 1fr !important; gap: var(--space-lg) !important; }
        }
      `}</style>
    </section>
  );
}
