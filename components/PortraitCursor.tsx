"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { gsap } from "gsap";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PortraitCursorProps {
  /** Transparent PNG for per-pixel alpha hit-testing */
  imageSrc: string;
  /** Ref to the photo-column container div in Hero */
  containerRef: RefObject<HTMLDivElement>;
  /** Progressive hover messages */
  messages: readonly string[];
  /**
   * Accent colours — only `colors[0]` is used as the fixed bubble colour.
   * The bubble does NOT change colour as messages advance.
   */
  colors: readonly string[];
  /** Cumulative hover-time thresholds (ms), one per message */
  thresholds: readonly number[];
  /** Called once when the last message is reached */
  onLastMessage?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getRenderedRect(container: DOMRect, natW: number, natH: number) {
  const scale = Math.min(container.width / natW, container.height / natH);
  const rW    = natW * scale;
  const rH    = natH * scale;
  return {
    left:   container.left + container.width  - rW,
    top:    container.top  + container.height - rH,
    right:  container.left + container.width,
    bottom: container.top  + container.height,
    width:  rW,
    height: rH,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PortraitCursor({
  imageSrc,
  containerRef,
  messages,
  colors,
  thresholds,
  onLastMessage,
}: PortraitCursorProps) {
  // ── State ─────────────────────────────────────────────────────────────────────
  const [msgIdx,      setMsgIdx]      = useState(0);
  const [displayText, setDisplayText] = useState(messages[0]);
  const [colorIdx,    setColorIdx]    = useState(0);

  // ── Refs ──────────────────────────────────────────────────────────────────────
  const cursorDivRef = useRef<HTMLDivElement>(null);
  const typingRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Typewriter effect — fires whenever the message index advances ─────────────
  useEffect(() => {
    if (typingRef.current) clearTimeout(typingRef.current);

    const target = messages[msgIdx];
    setDisplayText(""); // blank slate before typing starts

    let charIdx = 0;

    const typeNext = () => {
      charIdx++;
      setDisplayText(target.slice(0, charIdx));
      if (charIdx < target.length) {
        const delay = 38 + Math.random() * 28; // slight human variation
        typingRef.current = setTimeout(typeNext, delay);
      }
    };

    typingRef.current = setTimeout(typeNext, 60); // small initial pause

    return () => { if (typingRef.current) clearTimeout(typingRef.current); };
  }, [msgIdx, messages]);

  // ── Main cursor effect (hit-test canvas + GSAP tracking) ────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth <= 1024) return;

    const cursor = cursorDivRef.current;
    if (!cursor) return;

    // Per-pixel canvas hit-test
    const offscreen = document.createElement("canvas");
    const offCtx    = offscreen.getContext("2d", { willReadFrequently: true });
    let hitLoaded = false, hitNatW = 1, hitNatH = 1;

    const hitImg = new window.Image();
    hitImg.onload = () => {
      hitNatW          = hitImg.naturalWidth;
      hitNatH          = hitImg.naturalHeight;
      offscreen.width  = hitNatW;
      offscreen.height = hitNatH;
      offCtx?.drawImage(hitImg, 0, 0);
      hitLoaded        = true;
    };
    hitImg.src = imageSrc;

    const isOverPerson = (mx: number, my: number): boolean => {
      if (!hitLoaded || !offCtx || !containerRef.current) return false;
      const cr = containerRef.current.getBoundingClientRect();
      const rr = getRenderedRect(cr, hitNatW, hitNatH);
      if (mx < rr.left || mx > rr.right || my < rr.top || my > rr.bottom) return false;
      const px = Math.floor((mx - rr.left) / rr.width  * hitNatW);
      const py = Math.floor((my - rr.top)  / rr.height * hitNatH);
      if (px < 0 || px >= hitNatW || py < 0 || py >= hitNatH) return false;
      try { return offCtx.getImageData(px, py, 1, 1).data[3] > 25; }
      catch { return false; }
    };

    // GSAP — park off-screen, then track mouse with minimal lag
    gsap.set(cursor, { x: -600, y: -600, opacity: 0 });
    const cxTo = gsap.quickTo(cursor, "x", { duration: 0.07, ease: "power1.out" });
    const cyTo = gsap.quickTo(cursor, "y", { duration: 0.07, ease: "power1.out" });

    // Hover state machine
    // Timer advances messages based on total hover time, but only fires when
    // the mouse has moved recently — so staying still pauses progression.
    const MOVE_IDLE_MS = 240; // ms of stillness before pausing the timer
    let hoverActive  = false;
    let hoverStart: number | null = null;
    let lastMoveTime = 0;
    let msgTimer: ReturnType<typeof setInterval> | null = null;
    let curIdx       = 0;

    const handleMove = (e: MouseEvent) => {
      cxTo(e.clientX);
      cyTo(e.clientY);
      const isOver = isOverPerson(e.clientX, e.clientY);

      // Always stamp the last move time while inside the photo
      if (isOver) lastMoveTime = Date.now();

      if (isOver && !hoverActive) {
        // ── ENTER ────────────────────────────────────────────────────────
        hoverActive  = true;
        hoverStart   = Date.now();
        lastMoveTime = Date.now();
        gsap.set(cursor, { scale: 0.88, opacity: 0 });
        gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.28, ease: "back.out(1.6)" });

        msgTimer = setInterval(() => {
          // Pause progression if mouse has been still too long
          if (Date.now() - lastMoveTime > MOVE_IDLE_MS) return;

          const elapsed = hoverStart ? Date.now() - hoverStart : 0;
          let ni = 0;
          for (let i = thresholds.length - 1; i >= 0; i--) {
            if (elapsed >= thresholds[i]) { ni = i; break; }
          }
          ni = Math.min(ni, messages.length - 1);
          if (ni !== curIdx) {
            curIdx = ni;
            setMsgIdx(ni);
            if (ni === messages.length - 1) onLastMessage?.();
          }
        }, 200);

      } else if (!isOver && hoverActive) {
        // ── EXIT ─────────────────────────────────────────────────────────
        hoverActive  = false;
        hoverStart   = null;
        lastMoveTime = 0;
        if (msgTimer) { clearInterval(msgTimer); msgTimer = null; }
        curIdx = 0;
        setMsgIdx(0);
        setColorIdx(i => i + 1); // next hover gets the next accent colour
        gsap.to(cursor, { opacity: 0, scale: 0.88, duration: 0.22 });
      }
    };

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (msgTimer) clearInterval(msgTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bubble colour cycles through colors[] each time the user re-hovers
  const bubbleColor = colors[colorIdx % colors.length];

  return (
    <>
      <div
        ref={cursorDivRef}
        data-photo-cursor
        className="pcursor-root"
        style={{ position: "fixed", left: 0, top: 0, pointerEvents: "none", zIndex: 9999 }}
      >
        {/* Black arrow cursor */}
        <svg
          width="17"
          height="21"
          viewBox="0 0 17 21"
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            display: "block",
            filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,0.35))",
          }}
        >
          <path
            d="M1 1 L1 18 L5.5 13 L9 20.5 L11.5 19.5 L8 12.5 L14 12.5 Z"
            fill="#0d0d0d"
          />
          <path
            d="M1 1 L1 18 L5.5 13 L9 20.5 L11.5 19.5 L8 12.5 L14 12.5 Z"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="0.9"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        {/* iMessage-style pill bubble — fixed color, never changes */}
        <div className="pcursor-pill" style={{ backgroundColor: bubbleColor }}>
          <span className="pcursor-text">{displayText}</span>
          <span className="pcursor-caret" aria-hidden>|</span>
        </div>
      </div>

      <style>{`
        .pcursor-root { opacity: 0; }

        .pcursor-pill {
          position:         absolute;
          top:              8px;
          left:             12px;
          display:          inline-flex;
          align-items:      center;
          justify-content:  center;
          padding:          7px 14px;
          border-radius:    240px 999px 999px 999px;
          border:           1.5px solid rgba(0,0,0,0.20);
          white-space:      nowrap;
          line-height:      normal;
          box-shadow:       0 3px 0 rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.15);
          background-image: linear-gradient(to bottom, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0) 60%);
        }

        .pcursor-text {
          font-size:      0.8rem;
          font-weight:    600;
          color:          #fff;
          font-family:    var(--font-body, -apple-system, sans-serif);
          letter-spacing: 0.01em;
          line-height:    1;
          vertical-align: middle;
        }

        .pcursor-caret {
          display:        inline-block;
          margin-left:    1px;
          font-size:      0.8rem;
          font-weight:    300;
          color:          rgba(255,255,255,0.82);
          animation:      pcursorBlink 0.9s step-end infinite;
          line-height:    1;
          vertical-align: middle;
          font-family:    var(--font-body, -apple-system, sans-serif);
        }

        @keyframes pcursorBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        @media (max-width: 1024px) {
          [data-photo-cursor] { display: none !important; }
        }
      `}</style>
    </>
  );
}
