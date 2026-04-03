"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 18, suffix: "+", label: "Years Experience", color: "var(--lime)" },
  { value: 5,  suffix: "",  label: "Fortune 500 Firms", color: "var(--violet)" },
  { value: 4,  suffix: "",  label: "White Papers", color: "var(--sky)" },
  { value: 3,  suffix: "",  label: "Patents Filed", color: "var(--amber)" },
  { value: 15, suffix: "+", label: "LinkedIn Recs", color: "var(--red)" },
];

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nums = ref.current?.querySelectorAll<HTMLSpanElement>(".stat-num");
    nums?.forEach((el, i) => {
      if (reduced) { el.textContent = String(STATS[i].value); return; }
      ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, { val: STATS[i].value, duration: 1.6, ease: "power2.out",
          onUpdate: () => { el.textContent = Math.round(obj.val).toString(); }
        });
      }});
    });
  }, []);

  return (
    <div ref={ref} style={{ borderBottom: "0.5px solid var(--border)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)" }} className="stats-grid">
        {STATS.map((s, i) => (
          <div
            key={i}
            className="stat-cell"
            style={{
              padding: "var(--space-xl) var(--space-lg)",
              borderRight: i < 4 ? "0.5px solid var(--border)" : "none",
              textAlign: "center",
              transition: "background 0.3s",
              cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-2)"}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
          >
            <div
              className="display"
              style={{ fontSize: "clamp(2.5rem,5vw,4.5rem)", lineHeight: 1, color: s.color }}
            >
              <span className="stat-num">0</span>{s.suffix}
            </div>
            <div className="label" style={{ marginTop: "0.6rem" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <style>{`@media(max-width:640px){.stats-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
    </div>
  );
}
