"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    quote: `Saurabh has a unique combination of UX and programming skills. This enables him to provide minute attention to UX details while developing applications. He goes the extra mile in addressing UX concerns that even the UX designers did not think of.`,
    heading: "Among the most detail-oriented I've worked with",
    author: "Colleague",
    context: "Morgan Stanley",
    accentColor: "var(--accent)",
  },
  {
    quote: `Saurabh calls himself a full-stack developer. I found him to be more than just that. He understands the business, he can think through workflow, he has a very good grasp of end user mental model and he is very articulate about his point of view.`,
    heading: "More than just a full-stack developer",
    author: "Colleague",
    context: "BNY",
    accentColor: "var(--c-purple)",
  },
  {
    quote: `What sets Saurabh apart is his rare ability to own a problem end-to-end. He bridges design, engineering and product thinking in a way that few engineers can. He doesn't just build what's asked — he improves it.`,
    heading: "Bridges design, engineering & product",
    author: "Senior Leader",
    context: "BNY",
    accentColor: "var(--c-cyan)",
  },
  {
    quote: `Saurabh has an incredible instinct for performance. When he took over the platform refactor, we saw load times drop by 80% within two sprints. His systematic approach to debugging is something the whole team learned from.`,
    heading: "80% perf gain in two sprints",
    author: "Engineering Manager",
    context: "Morgan Stanley",
    accentColor: "var(--c-orange)",
  },
];

// Each card occupies this much vertical scroll distance before the next one enters.
const SCROLL_PER_CARD = 700; // px
const N = TESTIMONIALS.length;
// Total *extra* scroll beyond the sticky viewport height: (N-1) transitions.
const SCROLL_TOTAL = (N - 1) * SCROLL_PER_CARD;

export function Testimonials() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef   = useRef<HTMLDivElement>(null);
  // cardRefs point to full-stage overlay divs; GSAP sets x on them.
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const stRef      = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const wrapper = wrapperRef.current;
    const stage   = stageRef.current;
    if (!wrapper || !stage) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];

    /**
     * Left-to-right direction (opposite of the CodePen's right-to-left):
     *   x = (normalizedProgress − i) × vw
     *
     * At progress=0 (np=0):
     *   card 0 → x=0   (visible, centred in viewport)
     *   card 1 → x=−vw (one viewport to the LEFT, clipped)
     *   card 2 → x=−2vw …
     *
     * As you scroll down, np rises 0 → N−1.
     * Each card moves RIGHTWARD → enters from the LEFT edge → exits right.
     */
    const place = (progress: number) => {
      const vw = window.innerWidth;
      const np = progress * (N - 1);
      cards.forEach((card, i) => {
        gsap.set(card, { x: (np - i) * vw });
      });
    };

    // Establish initial positions before the ScrollTrigger fires.
    place(0);

    // Scroll-driven horizontal pan.
    stRef.current = ScrollTrigger.create({
      trigger: wrapper,
      start: "top top",
      end: `+=${SCROLL_TOTAL}`,
      scrub: 1,
      onUpdate: (self) => place(self.progress),
    });

    // Refresh layout on resize so pixel values stay accurate.
    const ro = new ResizeObserver(() => {
      stRef.current?.refresh();
      place(stRef.current?.progress ?? 0);
    });
    ro.observe(wrapper);

    return () => {
      stRef.current?.kill();
      ro.disconnect();
    };
  }, []);

  return (
    <section id="recommendations" aria-label="Recommendations">
      <style>{`
        @media (max-width: 640px) {
          .tm-heading-band {
            padding-top: 1.25rem !important;
            padding-bottom: 0.75rem !important;
          }
          .tm-heading-band .divider { margin-bottom: 1rem !important; }
          .tm-quote { font-size: 3.5rem !important; line-height: 0.7 !important; }
          .tm-card { gap: 0.75rem !important; padding: 1.25rem var(--pad-x) !important; }
        }
      `}</style>
      {/*
       * Tall wrapper — provides the vertical scroll distance that drives
       * the horizontal pan. Height = one stuck viewport + extra scroll.
       */}
      <div
        ref={wrapperRef}
        style={{ position: "relative", height: `calc(100vh + ${SCROLL_TOTAL}px)` }}
      >
        {/* ── Single sticky shell: heading sits at top, cards fill the rest ── */}
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--bg)",
          }}
        >
          {/* ── Heading band ── */}
          <div
            className="tm-heading-band"
            style={{
              flexShrink: 0,
              padding: "var(--space-xl) var(--pad-x) var(--space-lg)",
            }}
          >
            <div className="divider" style={{ marginBottom: "var(--space-xl)" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexWrap: "wrap",
                gap: "var(--space-md)",
              }}
            >
              <div>
                <div className="label" style={{ marginBottom: "0.75rem" }}>
                  07 · Recommendations
                </div>
                <h2
                  className="display"
                  style={{
                    fontSize: "clamp(2rem, 5vw, 4rem)",
                    color: "var(--text-1)",
                    lineHeight: 1.05,
                  }}
                >
                  Kind words,{" "}
                  <span className="display-italic" style={{ color: "var(--accent)" }}>
                    big ego boost
                  </span>
                </h2>
              </div>
              <a
                href="https://www.linkedin.com/in/kohlisaurabh"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
                aria-label="View all LinkedIn recommendations"
              >
                15 on LinkedIn ↗
              </a>
            </div>
          </div>

          {/* ── Card stage ── overflow:hidden clips off-screen cards ── */}
          <div
            ref={stageRef}
            style={{ flex: 1, position: "relative", overflow: "hidden" }}
          >
            {TESTIMONIALS.map((t, i) => (
              /*
               * The ref div IS the card — it fills the full stage (inset:0)
               * so cards are exactly the remaining viewport height × full width.
               * GSAP only sets `transform: translateX` here; all layout
               * styles are plain CSS, so there is no transform conflict.
               */
              <div
                key={i}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="tm-card"
                style={{
                  position: "absolute",
                  inset: 0,
                  willChange: "transform",
                  /* card surface */
                  background: "var(--surface)",
                  borderLeft: `4px solid ${t.accentColor}`,
                  /* content layout */
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-lg)",
                  padding: "var(--space-xl) var(--pad-x)",
                  boxSizing: "border-box",
                  overflowY: "auto",
                }}
              >
                {/* Quote glyph */}
                <div
                  className="display tm-quote"
                  style={{
                    fontSize: "clamp(5rem, 10vw, 9rem)",
                    color: t.accentColor,
                    lineHeight: 0.7,
                    userSelect: "none",
                  }}
                >
                  "
                </div>

                {/* Heading */}
                <h3
                  className="display"
                  style={{
                    fontSize: "clamp(1.6rem, 3.5vw, 3rem)",
                    color: "var(--text-1)",
                    lineHeight: 1.15,
                  }}
                >
                  {t.heading}
                </h3>

                {/* Quote body */}
                <p
                  style={{
                    fontSize: "clamp(1rem, 1.6vw, 1.25rem)",
                    color: "var(--text-2)",
                    lineHeight: 1.8,
                    flex: 1,
                  }}
                >
                  {t.quote}
                </p>

                {/* Attribution — pushed to bottom via marginTop:auto */}
                <div
                  style={{
                    marginTop: "auto",
                    borderTop: "0.5px solid var(--border)",
                    paddingTop: "var(--space-md)",
                    display: "flex",
                    gap: "var(--space-md)",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: t.accentColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#000",
                      flexShrink: 0,
                    }}
                  >
                    {t.author[0]}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-1)",
                        fontWeight: 500,
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {t.author}
                    </div>
                    <div className="label" style={{ color: "var(--text-3)" }}>
                      {t.context}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


