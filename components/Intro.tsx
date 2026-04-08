"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { asset } from "@/lib/asset";

const CREDENTIALS = [
  "ARCHITECT",
  "ENGINEER",
  "BUILDER",
  "DESIGNER",
  "LEADER",
  "INNOVATOR",
  "CREATOR",
  "THINKER"
];

/* ─── Canvas confetti ────────────────────────────────────────── */
function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10001";
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  // getContext("2d") can return null on memory-constrained mobile devices
  if (!ctx) { canvas.remove(); return; }
  const COLORS = ["#F54E26","#ffffff","#52525b","#a1a1aa"];
  type P = { x:number;y:number;vx:number;vy:number;color:string;w:number;h:number;rot:number;rotV:number;shape:"rect"|"circle" };
  const pts: P[] = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: -Math.random() * 320,
    vx: (Math.random() - 0.5) * 5,
    vy: Math.random() * 4 + 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    w: Math.random() * 11 + 5,
    h: Math.random() * 6 + 3,
    rot: Math.random() * 360,
    rotV: (Math.random() - 0.5) * 12,
    shape: Math.random() > 0.45 ? "rect" : "circle",
  }));
  const start = performance.now();
  const dur = 2600;
  const tick = (now: number) => {
    const e = now - start;
    if (e > dur) { canvas.remove(); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const alpha = Math.max(0, 1 - e / dur);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.rot += p.rotV;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = alpha; ctx.fillStyle = p.color;
      if (p.shape === "rect") { ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h); }
      else { ctx.beginPath(); ctx.ellipse(0, 0, p.w/2, p.h/2, 0, 0, Math.PI*2); ctx.fill(); }
      ctx.restore();
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function Intro() {
  const overlayRef   = useRef<HTMLDivElement>(null);
  const wrapRef      = useRef<HTMLDivElement>(null);
  const logoRef      = useRef<HTMLDivElement>(null);
  const morphWrapRef = useRef<HTMLDivElement>(null);
  const text1Ref     = useRef<HTMLSpanElement>(null);
  const text2Ref     = useRef<HTMLSpanElement>(null);
  const barTrackRef  = useRef<HTMLDivElement>(null);
  const barFillRef   = useRef<HTMLDivElement>(null);
  const counterRef   = useRef<HTMLSpanElement>(null);
  const statusRef    = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    
    // Lock page scroll + pointer events while the intro is visible
    document.body.classList.add("intro-active");

    let ctx = gsap.context(() => {
      /* ── Morphing text engine ── */
      const morphTime    = 0.8; // Faster morphs
      const cooldownTime = 0.4; // Shorter cooldown
      let textIndex = 0;
      let morphAmt  = 0;
      let cooldown  = cooldownTime;
      let lastTime  = performance.now();
      let rafId     = 0;
      let morphStarted = false;

      const setMorphStyles = (fraction: number) => {
        const t1 = text1Ref.current; const t2 = text2Ref.current;
        if (!t1 || !t2) return;
        t2.style.filter  = `blur(${Math.min(8 / Math.max(fraction, 0.001) - 8, 100)}px)`;
        t2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
        const inv = 1 - fraction;
        t1.style.filter  = `blur(${Math.min(8 / Math.max(inv, 0.001) - 8, 100)}px)`;
        t1.style.opacity = `${Math.pow(inv, 0.4) * 100}%`;
        t1.textContent   = CREDENTIALS[textIndex % CREDENTIALS.length];
        t2.textContent   = CREDENTIALS[(textIndex + 1) % CREDENTIALS.length];
      };
      const doMorph = () => {
        morphAmt -= cooldown; cooldown = 0;
        let frac = morphAmt / morphTime;
        if (frac >= 1) { cooldown = cooldownTime; frac = 1; }
        setMorphStyles(frac);
        if (frac === 1) textIndex++;
      };
      const doCooldown = () => {
        morphAmt = 0;
        const t1 = text1Ref.current; const t2 = text2Ref.current;
        if (t1 && t2) { t2.style.filter="none"; t2.style.opacity="100%"; t1.style.filter="none"; t1.style.opacity="0%"; }
      };
      const morphFrame = () => {
        rafId = requestAnimationFrame(morphFrame);
        const now = performance.now(); const dt = (now - lastTime) / 1000; lastTime = now;
        cooldown -= dt;
        if (cooldown <= 0) doMorph(); else doCooldown();
      };

      // Set initial
      gsap.set([logoRef.current, morphWrapRef.current, barTrackRef.current, statusRef.current], { opacity: 0 });
      gsap.set(logoRef.current,      { scale: 0.85, y: 20 });
      gsap.set(morphWrapRef.current, { y: 20 });

      const tl = gsap.timeline({
        onComplete: () => {
          cancelAnimationFrame(rafId);
          document.body.classList.remove("intro-active");
          try { sessionStorage.setItem("intro-done", "1"); } catch {}
          window.dispatchEvent(new CustomEvent("intro-complete"));
          setDone(true);
        },
      });

      // FAILSAFE: Ensure it unmounts even if GSAP timeline gets stuck
      const failsafeTimer = setTimeout(() => {
        cancelAnimationFrame(rafId);
        document.body.classList.remove("intro-active");
        try { sessionStorage.setItem("intro-done", "1"); } catch {}
        window.dispatchEvent(new CustomEvent("intro-complete"));
        setDone(true);
      }, 7000);

      const skip = () => tl.timeScale(20);
      window.addEventListener("keydown", skip);
      overlayRef.current?.addEventListener("click", skip);

      tl.to(logoRef.current,      { opacity: 1, scale: 1, y: 0, duration: 1.0, ease: "expo.out" }, 0.2);
      tl.to(barTrackRef.current,  { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.5);
      tl.to(statusRef.current,    { opacity: 1, duration: 0.4, ease: "power2.out" }, 0.6);
      tl.to(morphWrapRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }, 0.7);

      const obj = { val: 0 };
      tl.to(obj, {
        val: 100,
        duration: 5, // shortened duration
        ease: "power2.inOut",
        onUpdate() {
          const v = Math.round(obj.val);
          if (counterRef.current) counterRef.current.textContent = String(v).padStart(3, "0");
          if (barFillRef.current) barFillRef.current.style.width = obj.val + "%";
          if (statusRef.current) {
            if (v < 30)       statusRef.current.textContent = "INITIALISING...";
            else if (v < 60)  statusRef.current.textContent = "BUILDING UI...";
            else              statusRef.current.textContent = "READY ✦";
          }
          if (v >= 5 && !morphStarted) {
            morphStarted = true;
            lastTime = performance.now();
            if (text1Ref.current) text1Ref.current.textContent = CREDENTIALS[0];
            if (text2Ref.current) text2Ref.current.textContent = CREDENTIALS[1];
            morphFrame();
          }
        },
      }, 0.6);

      tl.call(() => fireConfetti(), [], "+=0.2");

      tl.to([logoRef.current, morphWrapRef.current, barTrackRef.current, statusRef.current], {
        opacity: 0, y: -20, stagger: 0.05, duration: 0.5, ease: "power2.in",
      }, "+=0.3");
      tl.to(overlayRef.current, {
        yPercent: -100, duration: 0.9, ease: "expo.inOut",
      }, "-=0.2");

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("keydown", skip);
        clearTimeout(failsafeTimer);
      };
    });

    return () => ctx.revert(); // proper cleanup for react 18 strict mode
  }, [done]);

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0a0a0a", // pure black VSK design
        overflow: "hidden",
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <svg style={{ position:"fixed", width:0, height:0, pointerEvents:"none" }} aria-hidden>
        <defs>
          <filter id="morph-threshold">
            <feColorMatrix in="SourceGraphic" type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140" />
          </filter>
        </defs>
      </svg>

      <div ref={wrapRef} style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "2rem", zIndex: 2,
      }}>
        <div ref={logoRef} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/sk-logo.gif")} alt="SK" width={320} height={320} style={{ borderRadius: 16 }} />
        </div>

        <div
          ref={morphWrapRef}
          style={{
            position: "relative",
            width: "clamp(260px, 80vw, 800px)",
            height: "4em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            filter: "url(#morph-threshold) blur(0.5px)",
          }}
        >
          <span ref={text1Ref} style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "clamp(2rem, 5vw, 4rem)",
            letterSpacing: "0.1em", fontWeight: 900, fontFamily: 'Anton, system-ui, sans-serif',
            color: "#ffffff", whiteSpace: "nowrap", textAlign: "center", textTransform: "uppercase"
          }} />
          <span ref={text2Ref} style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "clamp(2rem, 5vw, 4rem)",
            letterSpacing: "0.1em", fontWeight: 900, fontFamily: 'Anton, system-ui, sans-serif',
            color: "#ffffff", whiteSpace: "nowrap", textAlign: "center", textTransform: "uppercase"
          }} />
        </div>
      </div>

      <div style={{
        position: "absolute",
        bottom: "4.5rem",
        left: "clamp(1.5rem,5vw,6rem)",
        right: "clamp(1.5rem,5vw,6rem)",
        zIndex: 2,
      }}>
        <div ref={barTrackRef} style={{
          width: "100%", height: "2px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "2px", overflow: "hidden",
          position: "relative",
        }}>
          <div ref={barFillRef} style={{
            position: "absolute", inset: "0 auto 0 0",
            width: "0%", height: "100%",
            background: "#F54E26", borderRadius: "2px",
            transition: "width 0.1s linear",
          }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "1rem" }}>
          <span ref={statusRef} style={{
            fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)", fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600
          }}>
            INITIALISING...
          </span>
          <span ref={counterRef} style={{
            fontFamily: 'Anton, system-ui, sans-serif',
            fontSize: "clamp(3rem, 8vw, 7rem)", letterSpacing: "0.02em",
            color: "rgba(255,255,255,0.15)", lineHeight: 1,
          }}>
            000
          </span>
        </div>
      </div>

      <div style={{
        position: "absolute", bottom: "2rem", right: "clamp(1.5rem,5vw,6rem)", zIndex: 2,
        fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.3)", fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600
      }}>
        esc / click to skip
      </div>
    </div>
  );
}

