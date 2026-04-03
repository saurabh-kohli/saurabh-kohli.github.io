"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initLenis, initScrollAnimations } from "@/lib/gsap";

export function LenisProvider() {
  useEffect(() => {
    const lenis = initLenis();
    initScrollAnimations();

    // After the intro overlay exits, recalculate all ScrollTrigger positions
    // (positions computed while intro was covering the screen may be stale)
    const onIntroComplete = () => {
      setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    window.addEventListener("intro-complete", onIntroComplete, { once: true });

    return () => {
      lenis.destroy();
      window.removeEventListener("intro-complete", onIntroComplete);
    };
  }, []);

  return null;
}
