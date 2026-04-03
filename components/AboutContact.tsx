"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import Image from "next/image";
import { asset } from "@/lib/asset";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

/* ── Orbit hobby thumbnails ─────────────────────────────────── */
const ORBIT_HOBBIES = [
  { label: "Biking",          src: "/hobbies/biking.svg" },
  { label: "Paddle Boarding", src: "/hobbies/paddle board.svg" },
  { label: "Running",         src: "/hobbies/running.svg" },
  { label: "Bhangra",         src: "/hobbies/bhangra.svg" },
  { label: "Hiking",          src: "/hobbies/hiking.svg" },
  { label: "Pickle Ball",     src: "/hobbies/pickle ball.svg" },
  { label: "Table Tennis",    src: "/hobbies/table tennis.svg" },
];
const ORBIT_DURATION = 16; // seconds per revolution

/* ── Social marks ───────────────────────────────────────────── */
const SOCIALS = [
  { mark: "in",  label: "LinkedIn", url: "https://www.linkedin.com/in/kohlisaurabh" },
  { mark: "M",   label: "Medium",   url: "https://saurabh-kohli.medium.com" },
  { mark: "GH",  label: "GitHub",   url: "https://github.com/me-saurabhkohli" },
];

export function AboutContact() {
  const sectionRef   = useRef<HTMLElement>(null);
  const leftColRef   = useRef<HTMLDivElement>(null);
  const rightColRef  = useRef<HTMLDivElement>(null);
  const portraitRef  = useRef<HTMLDivElement>(null);
  const svgRef       = useRef<SVGSVGElement>(null);
  const pathRef      = useRef<SVGPathElement>(null);
  const thumbRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const orbitTweens  = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    const col  = leftColRef.current;
    const svg  = svgRef.current;
    const path = pathRef.current;
    const rightCol = rightColRef.current;
    const section  = sectionRef.current;
    if (!col || !svg || !path) return;

    /* On mobile, left column has no natural height on first paint (its portrait
       child is position:absolute).  Seed a sensible height immediately so
       buildPath() never produces a zero-radius / degenerate arc, which causes
       GSAP MotionPathPlugin to throw on some mobile browsers. */
    const isMobilePortrait = () => window.innerWidth <= 768;
    if (isMobilePortrait() && rightColRef.current) {
      const rh = rightColRef.current.offsetHeight;
      if (rh > 0) col.style.height = `${rh}px`;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ── Build / rebuild ellipse orbit path ─────────────────── */
    const buildPath = () => {
      const w = col.offsetWidth;
      const h = col.offsetHeight;

      /* Guard: if the column has no height yet (mobile first paint), skip.
         A zero-radius arc is a degenerate SVG path — getTotalLength() can
         throw a DOMException in some mobile browsers (Chrome/Android). */
      if (h <= 0 || w <= 0) return;

      /* Portrait fills the column height — col is already sized to match the right side via grid stretch */
      const pH = col.offsetHeight;
      const pW = Math.min(pH * (620 / 860), w * 0.90, 700);

      /* Ellipse centre: shifted left on portrait + lower down the torso */
      const cx = pW * 0.38;
      const cy = h - pH + pH * 0.75;

      /* Strictly horizontal-major ellipse:
         rx drives the wide axis — ~30 % of the arc hides past the left boundary.
         ry is a flat fraction of rx (major axis is always horizontal).             */
      const rx = cx / 0.42;   // larger rx → bigger orbit radius
      const ry = rx * 0.28;   // flat minor axis — clearly horizontal-major

      svg.setAttribute("width",  String(w));
      svg.setAttribute("height", String(h));

      /*  Counterclockwise arc (sweep-flag = 0):
          progress 0 → 0.5 = upper arc (FRONT, visible above portrait)
          progress 0.5 → 1 = lower arc (BACK, hidden behind portrait via z-index)  */
      path.setAttribute(
        "d",
        `M ${cx - rx},${cy} A ${rx},${ry} 0 1,0 ${cx + rx},${cy} A ${rx},${ry} 0 1,0 ${cx - rx},${cy}`
      );
    };

    buildPath();

    /* ── Portrait + thumbnails: scroll-triggered entrance ───── */
    /* Hide everything initially so nothing flashes before scroll */
    gsap.set(".ac-portrait", { x: "-40%", opacity: 0 });
    thumbRefs.current.forEach(el => { if (el) gsap.set(el, { opacity: 0 }); });

    if (!reduced) {
      ScrollTrigger.create({
        trigger: col,
        start: "top 82%",
        once: true,
        onEnter: () => {
          /* Portrait flies in from the left */
          gsap.to(".ac-portrait", {
            x: "0%", opacity: 1,
            duration: 1.8, ease: "expo.out",
          });
          /* Thumbnails fade in, staggered after portrait has started moving */
          thumbRefs.current.forEach((el, i) => {
            if (el) gsap.to(el, { opacity: 1, duration: 0.55, delay: 0.5 + i * 0.12, ease: "power2.out" });
          });
        },
      });
    }

    /* ── Orbit thumbnails ────────────────────────────────────── */
    const startOrbit = () => {
      orbitTweens.current.forEach(t => t.kill());
      orbitTweens.current = [];

      /* Guard: skip orbit if the path is still degenerate (zero length).
         getTotalLength() on a zero-radius arc throws DOMException on some
         mobile browsers; check before invoking MotionPathPlugin. */
      try {
        if (!path || path.getTotalLength() < 1) return;
      } catch { return; }

      ORBIT_HOBBIES.forEach((_, i) => {
        const el = thumbRefs.current[i];
        if (!el || !path) return;

        /* Use let so the onUpdate callback can reference the tween by name */
        let tw: gsap.core.Tween;
        tw = gsap.to(el, {
          motionPath: {
            path,
            align: path,
            alignOrigin: [0.5, 0.5],
            autoRotate: false,
          },
          duration: ORBIT_DURATION,
          ease: "none",
          repeat: -1,
          onUpdate() {
            /* progress 0→0.5 = upper/front arc  → z-index 3 (above portrait)
               progress 0.5→1 = lower/back  arc  → z-index 1 (below portrait) */
            const p = tw.progress();
            el.style.zIndex = p > 0.5 && p < 1.0 ? "1" : "3";
          },
        });
        /* Stagger each thumbnail 25 % apart around the orbit */
        tw.progress(i / ORBIT_HOBBIES.length);
        orbitTweens.current.push(tw);
      });
    };

    if (!reduced) startOrbit();

    /* ── Right-column reveals ────────────────────────────────── */
    gsap.fromTo(
      ".ac-word .anim-clip",
      { y: "110%" },
      {
        y: "0%", stagger: 0.09, duration: 1.0, ease: "expo.out",
        scrollTrigger: { trigger: ".ac-headline", start: "top 82%", once: true },
      }
    );

    gsap.fromTo(
      [".ac-copy", ".ac-email", ".ac-socials"],
      { opacity: 0, y: 18 },
      {
        opacity: 1, y: 0, stagger: 0.1, duration: 0.85, ease: "expo.out",
        scrollTrigger: { trigger: ".ac-copy", start: "top 86%", once: true },
      }
    );

    /* ── Container-level scroll animations ──────────────────── */
    /* Left: scroll-driven parallax scale — portrait rises into frame */
    if (!reduced && section) {
      gsap.fromTo(
        col,
        { yPercent: 7, scale: 0.96, transformOrigin: "bottom left" },
        {
          yPercent: 0, scale: 1.0, ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top 20%",
            scrub: 1.6,
          },
        }
      );

      /* Right: converges in from the right — x drift + opacity via scrub */
      if (rightCol) {
        gsap.fromTo(
          rightCol,
          { x: 70, opacity: 0 },
          {
            x: 0, opacity: 1, ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 90%",
              end: "top 35%",
              scrub: 1.0,
            },
          }
        );
      }
    }

    /* ── Resize → rebuild path & re-orbit ───────────────────── */
    /* Sync portrait height to the left column's actual rendered height.
       CSS height:100% on an absolutely-positioned child may not resolve when
       the containing block only has min-height (not an explicit height).
       Setting it in JS via offsetHeight is always accurate.               */
    const syncPortrait = () => {
      if (!portraitRef.current) return;

      /* ── Mobile (stacked layout): col has no intrinsic height since all children
         are position:absolute — explicitly match it to the contact column height. ── */
      const isMobile = window.innerWidth <= 768;
      if (isMobile && rightCol) {
        col.style.height = `${rightCol.offsetHeight}px`;
      } else {
        col.style.height = "";
      }

      /* Portrait height always tracks the column */
      portraitRef.current.style.height = `${col.offsetHeight}px`;

      /* ── Bleed-left calculation (ResizeObserver-driven) ────────────────────────
         As the column narrows below 560 px, n grows from 0 → 40.
         maxWidth: calc(100% + n%)  keeps the right edge anchored to the column edge.
         marginLeft: -n%            bleeds the portrait leftward into overflow:hidden.
         Net effect: portrait right edge stays flush with the column, left side bleeds
         progressively further as available width shrinks.                          ── */
      const colW = col.offsetWidth;
      const n = parseFloat(
        Math.min(40, Math.max(0, ((560 - colW) / (560 - 240)) * 40)).toFixed(1)
      );
      portraitRef.current.style.maxWidth  = `calc(100% + ${n}%)`;
      portraitRef.current.style.marginLeft = `-${n}%`;
    };
    syncPortrait();

    const ro = new ResizeObserver(() => {
      syncPortrait();
      buildPath();
      if (!reduced) startOrbit();
    });
    ro.observe(col);
    /* Also watch the right column — when its height changes (e.g. font-size change,
       viewport resize re-wrapping text), the portrait column must re-sync.          */
    if (rightCol) ro.observe(rightCol);

    return () => {
      ro.disconnect();
      orbitTweens.current.forEach(t => t.kill());
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === col || String(st.trigger).includes("ac-")) st.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about-contact"
      aria-label="About and Contact"
      style={{
        /* Remove left padding so portrait bleeds to viewport edge */
        paddingLeft: 0,
        paddingRight: "var(--pad-x)",
        paddingTop: "var(--space-xl)",
        paddingBottom: 0,
        overflow: "hidden",
        background: "var(--bg)",
        borderTop: "0.5px solid var(--border)",
      }}
    >
      {/* ── Two-column grid ─────────────────────────────────────── */}
      <div
        className="ac-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)",
          alignItems: "stretch",
          minHeight: "clamp(640px, 96vh, 1120px)",
        }}
      >
        {/* ════════════════════════════════════════════════════════
            LEFT — portrait stage + orbit
        ════════════════════════════════════════════════════════ */}
        <div
          ref={leftColRef}
          className="ac-left"
          style={{
            position: "relative",
            overflow: "hidden",
            /* Soft left-edge fade so thumbnails materialise from the dark */
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 8%, black 18%, black 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 8%, black 18%, black 100%)",
          }}
        >
          {/* Invisible SVG that holds the orbit path */}
          <svg
            ref={svgRef}
            aria-hidden="true"
            focusable="false"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none",
              /* overflow:visible so GSAP can still read coords beyond the SVG bounds */
              overflow: "visible",
            }}
          >
            <path ref={pathRef} fill="none" stroke="none" />
          </svg>

          {/* Orbit thumbnails — GSAP will transform these along the path */}
          {ORBIT_HOBBIES.map((h, i) => (
            <div
              key={h.label}
              ref={el => { thumbRefs.current[i] = el; }}
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 180,
                height: 180,
                /* No card background — raw SVG icon only */
                background: "none",
                border: "none",
                borderRadius: 0,
                overflow: "visible",
                pointerEvents: "none",
                /* z-index toggled at runtime by onUpdate (1 = behind portrait, 3 = in front) */
                zIndex: 3,
              }}
            >
              <Image
                src={h.src}
                alt={h.label}
                width={180}
                height={180}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.5))",
                }}
              />
            </div>
          ))}

          {/* Portrait — pinned to bottom-left; JS (syncPortrait) controls height,
               maxWidth and marginLeft so it always fills the column and bleeds
               left progressively as the viewport narrows.                     */}
          <div
            ref={portraitRef}
            className="ac-portrait"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              /* maxWidth + marginLeft are set dynamically in syncPortrait() */
              width: "auto",
              zIndex: 2,
            }}
          >
            <Image
              src={asset("/saurabh - 3.png")}
              alt="Saurabh Kohli"
              width={620}
              height={860}
              priority
              quality={95}
              style={{
                height: "100%",
                width: "auto",
                display: "block",
                objectFit: "contain",
                objectPosition: "bottom",
                filter: "drop-shadow(0 28px 56px rgba(0,0,0,0.55))",
              }}
            />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            RIGHT — content column
        ════════════════════════════════════════════════════════ */}
        <div
          ref={rightColRef}
          className="ac-right"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-end",
            textAlign: "right",
            padding:
              "var(--space-xl) var(--space-xl) var(--space-xl) clamp(1rem, 2vw, 1.5rem)",
            gap: "var(--space-lg)",
          }}
        >
          {/* Bold display headline — clip reveal */}
          <div className="ac-headline" style={{ marginTop: "0.25rem" }}>
            {["Let's build", "something", "remarkable."].map((word, i) => (
              <div
                key={i}
                className="ac-word"
                style={{ overflow: "hidden", lineHeight: 1.06 }}
              >
                <span
                  className="display anim-clip"
                  style={{
                    display: "block",
                    fontSize: "clamp(2.4rem, 4.2vw, 5.2rem)",
                    fontWeight: 800,
                    color: i === 2 ? "var(--accent)" : "var(--ink)",
                    willChange: "transform",
                  }}
                >
                  {word}
                </span>
              </div>
            ))}
          </div>

          {/* About copy */}
          <div
            className="ac-copy"
            style={{
              fontSize: "clamp(0.78rem, 0.9vw, 0.9rem)",
              color: "var(--ink-2)",
              lineHeight: 1.95,
              maxWidth: "72ch",
              marginTop: "0.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.85em",
            }}
          >
            <p style={{ margin: 0 }}>
              I work at the intersection of systems, architecture, and modernization — where the focus is not just on building solutions, but on shaping resilient, scalable, and future-ready ecosystems. My work demands structured thinking, long-horizon decision making, and the ability to operate effectively under complexity and ambiguity.
            </p>
            <p style={{ margin: 0 }}>
              Outside that domain, I deliberately anchor myself in movement and outdoor pursuits. Biking and running build endurance and reinforce consistency. Hiking forces adaptation to changing terrain. Paddle boarding requires balance in an inherently unstable environment. Table tennis and pickleball bring precision, reflex, and competitive focus — where small adjustments have immediate outcomes.
            </p>
            <p style={{ margin: 0 }}>
              These activities create a feedback loop. They strengthen discipline, improve mental clarity, and sustain a high-performance mindset. The same principles that apply on the trail, on the water, or across a court translate directly into how I approach architecture: maintain balance under pressure, optimize for endurance, adapt quickly, and execute with precision.
            </p>
          </div>

          {/* Email CTA */}
          <a
            href="mailto:iSaurabhKohli@gmail.com"
            className="ac-email"
            style={{
              display: "inline-block",
              alignSelf: "flex-end",
              fontSize: "clamp(0.95rem, 1.5vw, 1.25rem)",
              fontStyle: "italic",
              color: "var(--accent)",
              borderBottom: "1px solid transparent",
              transition: "border-color 0.25s ease",
              cursor: "pointer",
              textDecoration: "none",
            }}
            onMouseEnter={e =>
              ((e.currentTarget as HTMLAnchorElement).style.borderColor =
                "var(--accent)")
            }
            onMouseLeave={e =>
              ((e.currentTarget as HTMLAnchorElement).style.borderColor =
                "transparent")
            }
          >
            iSaurabhKohli@gmail.com
          </a>

          {/* Social icon circles */}
          <div
            className="ac-socials"
            style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}
          >
            {SOCIALS.map(s => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border:
                    "1px solid var(--border-mid, rgba(255,255,255,0.14))",
                  background: "var(--surface)",
                  fontSize: s.mark === "GH" ? "0.5rem" : "0.58rem",
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  color: "var(--ink-2)",
                  textDecoration: "none",
                  transition:
                    "background 0.22s ease, border-color 0.22s ease, color 0.22s ease",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = "var(--ink)";
                  el.style.color = "var(--bg)";
                  el.style.borderColor = "var(--ink)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = "var(--surface)";
                  el.style.color = "var(--ink-2)";
                  el.style.borderColor =
                    "var(--border-mid, rgba(255,255,255,0.14))";
                }}
              >
                {s.mark}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
