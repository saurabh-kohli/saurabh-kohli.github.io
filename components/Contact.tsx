"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LINKS = [
  { label: "LinkedIn", url: "https://www.linkedin.com/in/kohlisaurabh", className: "" },
  { label: "GitHub", url: "https://github.com/me-saurabhkohli", className: "github-link" },
  { label: "Medium", url: "https://saurabh-kohli.medium.com", className: "" },
  { label: "ORCID", url: "https://orcid.org/0009-0002-0106-5730", className: "orcid-link" },
];

export function Contact() {
  const headRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const words = headRef.current?.querySelectorAll<HTMLSpanElement>(".contact-word");
    words?.forEach((word, i) => {
      const inner = word.querySelector<HTMLSpanElement>(".contact-inner");
      if (!inner) return;
      gsap.fromTo(
        inner,
        { y: "110%" },
        {
          y: "0%",
          duration: 1.0,
          ease: "expo.out",
          delay: i * 0.14,
          scrollTrigger: {
            trigger: word,
            start: "top 85%",
            once: true,
          },
        }
      );
    });

    // Fade in email + links
    gsap.fromTo(
      ".contact-email",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "expo.out",
        scrollTrigger: { trigger: ".contact-email", start: "top 88%", once: true },
      }
    );

    gsap.fromTo(
      ".contact-links",
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "expo.out",
        delay: 0.15,
        scrollTrigger: { trigger: ".contact-links", start: "top 90%", once: true },
      }
    );
  }, []);

  const headline = ["Let's build", "something", "remarkable."];

  return (
    <section id="contact" aria-label="Contact" className="section">
      <div className="divider" style={{ marginBottom: "var(--space-2xl)" }} />

      {/* Word-reveal headline */}
      <div
        ref={headRef}
        style={{ textAlign: "center", marginBottom: "var(--space-xl)" }}
      >
        {headline.map((line, i) => (
          <div
            key={i}
            className="contact-word"
            style={{ overflow: "hidden", lineHeight: 1.08 }}
          >
            <span
              className="contact-inner display"
              style={{
                display: "block",
                fontSize: "clamp(3rem, 8vw, 7rem)",
                willChange: "transform",
                color: i === 2 ? "var(--red)" : "var(--ink)",
              }}
            >
              {line}
            </span>
          </div>
        ))}
      </div>

      {/* Email CTA */}
      <div
        className="contact-email"
        style={{ textAlign: "center", marginBottom: "var(--space-xl)" }}
      >
        <a
          href="mailto:iSaurabhKohli@gmail.com"
          className="display-italic"
          style={{
            fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)",
            color: "var(--red)",
            borderBottom: "1px solid transparent",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--red)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.borderColor = "transparent")
          }
        >
          iSaurabhKohli@gmail.com
        </a>
      </div>

      {/* Social links */}
      <div
        className="contact-links"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "var(--space-md)",
          flexWrap: "wrap",
          marginBottom: "var(--space-2xl)",
        }}
      >
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${link.label} in new tab`}
            className={`btn-ghost ${link.className}`}
          >
            {link.label} ↗
          </a>
        ))}
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: "0.5px solid var(--border)",
          paddingTop: "var(--space-lg)",
          paddingBottom: "var(--space-lg)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-md)",
        }}
      >
        <span
          className="display-italic"
          style={{ fontSize: "1rem", color: "var(--ink-2)" }}
        >
          Saurabh Kohli
        </span>
        <span className="label" style={{ color: "var(--ink-3)" }}>
          © 2025 · Built with Next.js + GSAP
        </span>
        <span className="label" style={{ color: "var(--ink-3)" }}>
          New York · London · Remote
        </span>
      </footer>
    </section>
  );
}
