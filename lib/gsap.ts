import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initLenis() {
  const lenis = new Lenis({
    duration: 1.4,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on("scroll", () => ScrollTrigger.update());
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function initScrollAnimations() {
  if (typeof window === "undefined") return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const animate = (fn: () => void) => {
    if (!reduced) fn();
  };

  animate(() => {
    // Section labels
    gsap.utils.toArray<HTMLElement>(".label").forEach((el) => {
      gsap.fromTo(
        el,
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
        }
      );
    });

    // Divider draw-in
    gsap.utils.toArray<HTMLElement>(".divider").forEach((el) => {
      gsap.fromTo(
        el,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 95%" },
        }
      );
    });

    // Writing cards
    gsap.utils.toArray<HTMLElement>(".writing-card").forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: i * 0.12,
          ease: "expo.out",
          scrollTrigger: { trigger: card, start: "top 88%", once: true },
        }
      );
    });
  });
}
