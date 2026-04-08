"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initLenis, initScrollAnimations } from "@/lib/gsap";

export function LenisProvider() {
  useEffect(() => {
    const lenis = initLenis();
    initScrollAnimations();

    // If the intro hasn't been shown yet this session, keep Lenis locked
    // until it fires "intro-complete" so the page can't be scrolled underneath.
    const alreadyDone =
      typeof window !== "undefined" &&
      sessionStorage.getItem("intro-done") === "1";

    if (!alreadyDone) {
      lenis.stop();
    }

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
