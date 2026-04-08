"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initLenis, initScrollAnimations } from "@/lib/gsap";

export function LenisProvider() {
  useEffect(() => {
    const lenis = initLenis();
    initScrollAnimations();

    // Always start Lenis paused — Intro plays on every page load.
    // It will be unpaused by the "intro-complete" event below.
    lenis.stop();

    // After the intro overlay exits: unlock scroll + recalculate ScrollTrigger positions
    const onIntroComplete = () => {
      lenis.start();
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
