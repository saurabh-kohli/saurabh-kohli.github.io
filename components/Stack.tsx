"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  FaReact, FaAngular, FaHtml5, FaUniversalAccess, FaDrupal, 
  FaNodeJs, FaJava, FaServer, FaNetworkWired, FaDocker, FaAws, 
  FaBrain, FaBolt, FaChartBar, FaProjectDiagram 
} from "react-icons/fa";
import { SiTypescript, SiSnowflake, SiGraphql } from "react-icons/si";

gsap.registerPlugin(ScrollTrigger);

const STACKS = [
  { 
    category: "Frontend", 
    desc: "Architecting interactive, accessible, and highly scalable user interfaces.",
    color: "rgba(56, 189, 248, 0.25)", // Sky Blue glow
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
    ),
    items: [
      { name: "React", Icon: FaReact, hex: "#61DAFB" },
      { name: "Angular", Icon: FaAngular, hex: "#DD0031" },
      { name: "TypeScript", Icon: SiTypescript, hex: "#3178C6" },
      { name: "Web Components", Icon: FaHtml5, hex: "#E34F26" },
      { name: "A11y / WCAG", Icon: FaUniversalAccess, hex: "#ffffff" },
      { name: "Drupal / CMS", Icon: FaDrupal, hex: "#0678BE" }
    ] 
  },
  { 
    category: "Backend / Infra", 
    desc: "Designing robust, distributed microservices and cloud infrastructures.",
    color: "rgba(52, 211, 153, 0.25)", // Emerald glow
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
    ),
    items: [
      { name: "Node.js", Icon: FaNodeJs, hex: "#339933" },
      { name: "Java / Spring", Icon: FaJava, hex: "#f89820" },
      { name: "Kafka", Icon: FaServer, hex: "#ffffff" },
      { name: "Hazelcast", Icon: FaNetworkWired, hex: "#F84138" },
      { name: "Docker + CI/CD", Icon: FaDocker, hex: "#2496ED" },
      { name: "AWS", Icon: FaAws, hex: "#FF9900" }
    ] 
  },
  { 
    category: "AI & Data", 
    desc: "Building intelligent pipelines, vector networks, and high-throughput data lakes.",
    color: "rgba(168, 85, 247, 0.25)", // Purple glow
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
    ),
    items: [
      { name: "ML / AI", Icon: FaBrain, hex: "#E24A68" },
      { name: "Snowflake", Icon: SiSnowflake, hex: "#29B5E8" },
      { name: "WebSockets", Icon: FaBolt, hex: "#FACC15" },
      { name: "REST / GraphQL", Icon: SiGraphql, hex: "#E10098" },
      { name: "Kibana / ELK", Icon: FaChartBar, hex: "#005571" },
      { name: "MCP Protocol", Icon: FaProjectDiagram, hex: "#A855F7" }
    ] 
  },
];

export function Stack() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    
    // Smooth grid reveal
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.jhey-card');
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => gsap.fromTo(cards, 
          { y: 50, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "expo.out" }
        )
      });
    }
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('.jhey-card');
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (card as HTMLElement).style.setProperty("--x", `${x}px`);
      (card as HTMLElement).style.setProperty("--y", `${y}px`);
    });
  };

  return (
    <section id="stack" aria-label="Tech Stack" className="section relative pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
      {/* Structural glow backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-white/[0.02] blur-[120px] pointer-events-none rounded-full" />
      
      <div className="divider mb-16 h-px w-full bg-white/10" />
      <div className="section-header mb-16">
        <span className="label text-xs tracking-widest uppercase text-zinc-500 font-medium">02 · Technical Ecosystem</span>
      </div>
      
      <div 
        ref={containerRef} 
        onPointerMove={handlePointerMove}
        className="group grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 w-full"
      >
        {STACKS.map((col, i) => (
          <div 
            key={i} 
            className="jhey-card relative p-8 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md flex flex-col transition-colors duration-500 overflow-hidden"
            style={{ "--glow-color": col.color } as React.CSSProperties}
          >
            {/* Highlight Spotlight behind the content (Context-Aware Hover) */}
            <div 
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background: "radial-gradient(600px circle at var(--x, 0) var(--y, 0), var(--glow-color), transparent 40%)",
                zIndex: -1
              }}
            />

            {/* Glowing Border Mask (Context-Aware Jhey Hack) */}
            <div 
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background: "radial-gradient(400px circle at var(--x, 0) var(--y, 0), var(--glow-color), transparent 40%)",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                padding: "2px", // border thickness
                zIndex: 10
              }}
            />

            <div className="text-zinc-400 mb-6 flex items-center gap-4 relative z-10">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                {col.icon}
              </div>
              <h2 className="text-xl tracking-tight text-white font-medium">{col.category}</h2>
            </div>
            
            <p className="text-sm text-zinc-400 mb-8 leading-relaxed relative z-10">
              {col.desc}
            </p>
            
            <div className="flex flex-wrap gap-3 mt-auto relative z-10">
              {col.items.map((item, idx) => (
                <span 
                  key={idx} 
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full bg-white/[0.03] border border-white/[0.05] text-zinc-300 hover:bg-white/10 hover:text-white transition-colors duration-300 cursor-default"
                >
                  <item.Icon className="w-3.5 h-3.5" style={{ color: item.hex }} />
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
