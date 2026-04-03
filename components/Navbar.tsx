"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Stack", href: "#stack" },
  { label: "Writing", href: "#writing" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const navRef     = useRef<HTMLElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    /* ── Displacement-map for the glass lens (built client-side so btoa is available) ── */
    const mapSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="128">' +
      '<defs>' +
      '<radialGradient id="rg" cx="50%" cy="50%" r="65%" gradientUnits="userSpaceOnUse" fx="50%" fy="50%">' +
      '<stop offset="0%"   stop-color="rgb(255,128,0)"/>' +   // R=max, B=0  → centre pushes outward on X
      '<stop offset="100%" stop-color="rgb(0,128,255)"/>' +   // R=0,   B=max → edge pulls inward on Y
      '</radialGradient>' +
      '</defs>' +
      '<rect width="512" height="128" fill="url(#rg)"/>' +
      '</svg>';
    if (feImageRef.current) {
      feImageRef.current.setAttribute(
        "href",
        "data:image/svg+xml;base64," + btoa(mapSvg)
      );
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reduced) {
      /* Entrance animation */
      gsap.fromTo(
        nav,
        { opacity: 0, y: -14 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.1, ease: "expo.out" }
      );

      /* Scroll-driven: deepen the frost tint as page scrolls */
      const st = ScrollTrigger.create({
        start: "80px top",
        onEnter: () => {
          gsap.to(nav, {
            background: "rgba(6,6,9,0.32)",
            boxShadow: [
              "0 0 0 0.5px rgba(255,255,255,0.16) inset",
              "0 1px 0 rgba(255,255,255,0.09) inset",
              "0 -1px 0 rgba(0,0,0,0.3) inset",
              "0 8px 40px rgba(0,0,0,0.35)",
            ].join(", "),
            borderColor: "rgba(255,255,255,0.11)",
            duration: 0.5,
          });
          gsap.to(".nav-link", { color: "rgba(244,240,230,0.65)", duration: 0.5 });
        },
        onLeaveBack: () => {
          gsap.to(nav, {
            background: "rgba(6,6,9,0.04)",
            boxShadow: [
              "0 0 0 0.5px rgba(255,255,255,0.08) inset",
              "0 1px 0 rgba(255,255,255,0.05) inset",
              "0 -1px 0 rgba(0,0,0,0.1) inset",
              "0 8px 32px rgba(0,0,0,0.12)",
            ].join(", "),
            borderColor: "rgba(255,255,255,0.05)",
            duration: 0.4,
          });
          gsap.to(".nav-link", { color: "rgba(244,240,230,0.75)", duration: 0.4 });
        },
      });

      return () => { st.kill(); };
    } else {
      nav.style.opacity = "1";
    }
  }, []);

  return (
    <>
      {/*
        ── Hidden SVG that defines the liquid-glass displacement filter ──────
        Must live in the document for backdrop-filter: url(#…) to resolve.
        Works in Chromium; Safari falls back to the WebkitBackdropFilter blur.
      */}
      <svg
        aria-hidden="true"
        focusable="false"
        style={{
          position: "fixed",
          width: 0,
          height: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <defs>
          <filter
            id="glass-filter"
            x="-10%"
            y="-60%"
            width="120%"
            height="220%"
            colorInterpolationFilters="sRGB"
          >
            {/* Displacement map loaded via data URI set in useEffect */}
            <feImage
              ref={feImageRef}
              result="map"
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
            />
            {/* Lens distortion — negative scale = barrel, positive = pincushion */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              xChannelSelector="R"
              yChannelSelector="B"
              scale="-160"
              result="displaced"
            />
            {/* Soft blur on displaced pixels mimics frosted depth */}
            <feGaussianBlur in="displaced" stdDeviation="9" result="blurred" />
            {/* Clip result to original element bounds */}
            <feComposite in="blurred" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
      </svg>

      <nav
        ref={navRef}
        role="navigation"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 var(--pad-x)",
          zIndex: 1000,
          opacity: 0,

          /* ── Liquid-glass surface ────────────────────────────── */
          background: "rgba(6,6,9,0.04)",
          /* Chromium: SVG displacement + saturate gives the lens warp */
          backdropFilter: "url(#glass-filter) saturate(1.9) brightness(1.12)",
          /* Safari fallback: plain blur-frost */
          WebkitBackdropFilter: "blur(18px) saturate(1.8) brightness(1.08)",

          /* Glass rim: inset highlights + drop shadow */
          boxShadow: [
            "0 0 0 0.5px rgba(255,255,255,0.08) inset",  // top rim highlight
            "0 1px 0 rgba(255,255,255,0.05) inset",       // inner top edge
            "0 -1px 0 rgba(0,0,0,0.1) inset",             // inner bottom edge
            "0 8px 32px rgba(0,0,0,0.12)",                 // ambient drop shadow
          ].join(", "),

          borderBottom: "0.5px solid rgba(255,255,255,0.05)",
          transition: "background 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease",
        }}
      >
        {/* ── Logo ─────────────────────────────────────────────── */}
        <a
          href="#"
          aria-label="Home"
          style={{ display: "flex", alignItems: "center", transition: "opacity 0.2s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.75"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
        >
          <img
            src="/sk-logo.svg"
            alt="SK Logo"
            width={38}
            height={38}
            style={{ objectFit: "contain", borderRadius: "6px", filter: "brightness(0) invert(1)" }}
          />
        </a>

        {/* ── Nav links ────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="label nav-link"
              style={{ color: "rgba(244,240,230,0.75)", transition: "color 0.2s", letterSpacing: "0.1em" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = ""; }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://github.com/me-saurabhkohli"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open GitHub in new tab"
            className="label nav-link"
            style={{ color: "rgba(244,240,230,0.5)", transition: "color 0.2s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--red)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = ""; }}
          >
            GH ↗
          </a>
        </div>
      </nav>
    </>
  );
}

