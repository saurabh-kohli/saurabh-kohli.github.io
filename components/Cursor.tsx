"use client";

import { useEffect, useRef } from "react";

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
    };

    const onMouseLeave = () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const onMouseEnter = () => {
      dot.style.opacity = "1";
      ring.style.opacity = "0.5";
    };

    const onMouseDown = () => {
      dot.style.transform += " scale(0.6)";
    };

    const onMouseUp = () => {
      dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const loop = () => {
      ringX = lerp(ringX, mouseX, 0.08);
      ringY = lerp(ringY, mouseY, 0.08);
      ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const HOVER_SELECTORS = "a, button, .case-card, .award-card, .writing-card";

    const addHover = (el: Element) => {
      const enter = () => {
        ring.style.transform += " scale(2.5)";
        ring.style.background = "var(--red-dim)";
        dot.style.width = "12px";
        dot.style.height = "12px";

        let label = "";
        if (el.classList.contains("writing-card")) label = "Read ↗";
        else if (el.classList.contains("github-link")) label = "Code ↗";
        else if (el.classList.contains("orcid-link")) label = "ORCID ↗";

        if (label) {
          ring.innerHTML = label;
          ring.style.display = "flex";
          ring.style.alignItems = "center";
          ring.style.justifyContent = "center";
          ring.style.fontSize = "9px";
          ring.style.color = "#fff";
          ring.style.background = "var(--red)";
          ring.style.border = "none";
        }
      };

      const leave = () => {
        ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
        ring.style.background = "transparent";
        ring.style.display = "block";
        ring.style.border = "1px solid var(--ink)";
        ring.style.fontSize = "";
        ring.style.color = "";
        ring.innerHTML = "";
        dot.style.width = "8px";
        dot.style.height = "8px";
      };

      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    };

    document.querySelectorAll(HOVER_SELECTORS).forEach(addHover);

    const observer = new MutationObserver(() => {
      document.querySelectorAll(HOVER_SELECTORS).forEach(addHover);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <>
      <div
        id="cursor-dot"
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          background: "var(--ink)",
          borderRadius: "50%",
          zIndex: 9999,
          pointerEvents: "none",
          willChange: "transform",
        }}
      />
      <div
        id="cursor-ring"
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          border: "1px solid var(--ink)",
          borderRadius: "50%",
          opacity: 0.5,
          zIndex: 9998,
          pointerEvents: "none",
          willChange: "transform",
          transition: "width 0.3s, height 0.3s, background 0.3s",
        }}
      />
    </>
  );
}
