# Saurabh Kohli — Portfolio Implementation Spec (v2)
**Principal Full Stack Engineer · SVP · Fintech AI · BNY Mellon**

> **For Claude Code / Cursor / Windsurf**: Read this entire file before writing a single line of code.
> Build a single-page portfolio at production quality. Every section, animation, and interaction is specified below.
> All content is sourced from: resume, LinkedIn (linkedin.com/in/kohlisaurabh), Medium (@isaurabhkohli),
> GitHub (github.com/me-saurabhkohli), and ORCID (orcid.org/0009-0002-0106-5730).

---

## Identity & Links

```
Name:       Saurabh Kohli
Title:      Senior Vice President | HoE Portfolio Construction
Location:   Livingston, New Jersey
Email:      iSaurabhKohli@gmail.com
LinkedIn:   https://www.linkedin.com/in/kohlisaurabh
Medium:     https://saurabh-kohli.medium.com
GitHub:     https://github.com/me-saurabhkohli
ORCID:      https://orcid.org/0009-0002-0106-5730
```

---

## Stack

```
Next.js 14 (App Router)
Tailwind CSS (layout utilities only — no component classes)
GSAP 3 + ScrollTrigger (all scroll animations)
Lenis (smooth scroll)
Custom cursor (vanilla JS)
Fonts: "DM Serif Display" (display) + "DM Sans" (body) via Google Fonts
No UI component libraries. No Framer Motion. No animation libraries except GSAP.
Deploy target: Vercel
```

---

## File Structure

```
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Cursor.tsx
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── Marquee.tsx
│   ├── Cases.tsx
│   ├── Stack.tsx
│   ├── Timeline.tsx
│   ├── Awards.tsx
│   ├── Papers.tsx
│   ├── Writing.tsx          ← Medium articles
│   ├── Testimonials.tsx     ← LinkedIn recommendations
│   ├── Speaking.tsx         ← Conference talks
│   └── Contact.tsx
├── lib/
│   └── gsap.ts
├── public/
│   └── og.png
└── PORTFOLIO_PROMPT.md
```

---

## Design Tokens

```css
:root {
  --bg:         #0a0a0a;
  --bg-2:       #111111;
  --bg-3:       #1a1a1a;
  --surface:    #1f1f1f;
  --border:     rgba(255,255,255,0.08);
  --border-mid: rgba(255,255,255,0.15);
  --text-1:     #f0ede8;
  --text-2:     #8a8680;
  --text-3:     #4a4845;
  --accent:     #c8f564;
  --accent-dim: rgba(200,245,100,0.12);

  --font-display: "DM Serif Display", Georgia, serif;
  --font-body:    "DM Sans", system-ui, sans-serif;

  --space-xs:  0.25rem;
  --space-sm:  0.5rem;
  --space-md:  1rem;
  --space-lg:  2rem;
  --space-xl:  4rem;
  --space-2xl: 8rem;

  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out:   cubic-bezier(0.87, 0, 0.13, 1);
  --dur-fast:  0.3s;
  --dur-mid:   0.6s;
  --dur-slow:  1.1s;
}
```

---

## Global Styles (`globals.css`)

```css
* { box-sizing: border-box; margin: 0; padding: 0; }

html {
  background: var(--bg);
  color: var(--text-1);
  font-family: var(--font-body);
  font-size: clamp(15px, 1.1vw, 17px);
  -webkit-font-smoothing: antialiased;
  cursor: none;
}

body { overflow-x: hidden; }

::selection { background: var(--accent); color: #000; }

a { color: inherit; text-decoration: none; }

.divider { width: 100%; height: 0.5px; background: var(--border); }

.section { padding: var(--space-2xl) clamp(1.5rem, 5vw, 6rem); }

.display {
  font-family: var(--font-display);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
}

.label {
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-3);
}
```

---

## Custom Cursor (`components/Cursor.tsx`)

Two elements: small dot (follows exactly) + large ring (trails with lerp lag).

```
Dot:  8px × 8px, background var(--accent), border-radius 50%, z-index 9999
Ring: 40px × 40px, border 1px solid var(--accent), border-radius 50%, opacity 0.5, z-index 9998
```

**Behavior:**
- Dot: `transform: translate(x-4px, y-4px)`, no lag.
- Ring: lerp factor `0.08` on every `requestAnimationFrame`.
- On hover of `a`, `button`, `.case-card`, `.award-card`, `.writing-card`:
  - Ring scales `2.5×`, background `var(--accent-dim)`. Dot shrinks to `4px`.
- On hover of `.writing-card`: inject `"Read ↗"` inside ring, `9px`, `color: #000`.
- On hover of `.github-link`: inject `"Code ↗"`.
- On hover of `.orcid-link`: inject `"ORCID ↗"`.
- `mousedown`: dot `0.6×`. `mouseup`: `1×`.
- Hide on `mouseleave`, show on `mouseenter`.
- Hidden via CSS on `max-width: 640px`.

---

## Smooth Scroll (`lib/gsap.ts`)

```ts
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initLenis() {
  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}
```

Call `initLenis()` in a `useEffect` in `app/layout.tsx`.

---

## Navbar (`components/Navbar.tsx`)

Fixed top. `height: 56px`. No background on load — reveals on scroll past `80px`.

**Left:** Monogram `SK`, `var(--font-display)`, `1.1rem`. Hover: letter-spacing `0 → 0.08em`.

**Right links:** `Work` · `Stack` · `Writing` · `Speaking` · `Contact`
- `0.75rem`, weight `500`. Hover: `var(--accent)`. Active section: `2px` underline `var(--accent)`.
- GitHub icon (Unicode `⌥`) links to `https://github.com/me-saurabhkohli`, new tab, `aria-label="GitHub"`.

**Background reveal:**
```js
ScrollTrigger.create({
  start: "80px top",
  onEnter: () => gsap.to(navbar, {
    backgroundColor: "rgba(10,10,10,0.85)",
    backdropFilter: "blur(12px)", duration: 0.4
  }),
  onLeaveBack: () => gsap.to(navbar, {
    backgroundColor: "transparent",
    backdropFilter: "blur(0px)", duration: 0.4
  }),
});
```

---

## Section 1 — Hero (`components/Hero.tsx`)

Full viewport height (`100svh`). Two columns ≥1024px, single column mobile. Items flex-end, `padding-bottom: var(--space-xl)`.

**Top-left label:**
```
"SVP Engineering · BNY Mellon · Livingston, NJ"
```
Fade in: `opacity 0→1`, `y: 12→0`, delay `0.1s`.

**Headline (two lines with word-reveal):**
```
Saurabh
Kohli
```
Font: `var(--font-display)`. Size: `clamp(4.5rem, 12vw, 11rem)`.
Each line in `overflow: hidden`. Inner span: `y: 110%→0`, `duration: 1.1s`, `ease: expo.out`.
"Saurabh" delay `0.2s`, "Kohli" delay `0.35s`.

**Right column:**

Descriptor (`var(--text-2)`, `0.95rem`, `line-height: 1.7`):
```
"Principal full-stack engineer with 18 years shipping AI-powered products
at BNY Mellon, Morgan Stanley, and American Express. I architect systems
that move markets — and write about them."
```
`"write about them"` links to `#writing` section on hover with `color: var(--accent)`.

Two CTAs: `"View work"` (filled, `var(--accent)`, `color: #000`) + `"Read on Medium ↗"` (ghost, links `https://saurabh-kohli.medium.com`). Fade in delay `0.9s`.

**Profile link strip** (below CTAs, `margin-top: 1rem`, `font-size: 0.72rem`, `color: var(--text-3)`, flex `gap: 1.5rem`):
```
↗ LinkedIn   ↗ GitHub   ↗ Medium   ↗ ORCID
```
Each opens new tab. Hover: `var(--text-2)`. Fade in delay `0.85s`.

**Bottom strip:** Rotating text `"AVAILABLE FOR ADVISORY · OPEN TO CTO ROLES · BASED IN NEW JERSEY · "` + scroll `↓` arrow.

---

## Section 2 — Marquee (`components/Marquee.tsx`)

Two copies, GSAP loop `x: "-50%"`, `duration: 30`, `repeat: -1`.

```
BNY Mellon · Morgan Stanley · American Express · Bank of America · NBC Universal ·
Titan AI Gold · Aureum Fintech Gold · NY Digital Award · WSO2Con Barcelona ·
Fortune Most Innovative 2025 · 4 White Papers · Patent Filed ·
```

Font: `var(--font-display)` italic, `clamp(1rem, 2.5vw, 1.4rem)`, `var(--text-3)`.
`·` separators: `var(--accent)`.
On `mouseenter`: slow to `duration: 80`. On `mouseleave`: resume `duration: 30`.

---

## Section 3 — Stats Bar

`grid-template-columns: repeat(5, 1fr)`. Count-up animation on scroll.

```
18+          5          4            3           15+
Years       Firms    White Papers  Patents    LinkedIn Recs
```

`var(--font-display)`, `clamp(2.5rem, 5vw, 4rem)`. Separated by `0.5px solid var(--border)`.

---

## Section 4 — Case Studies (`components/Cases.tsx`)

**Section label:** `"01 · Selected Work"` | right: `"4 case studies"`

```ts
const cases = [
  {
    number: "01",
    year: "2018–present",
    firm: "BNY Mellon",
    title: "Conversational AI Portfolio Construction",
    subDetail: "Powers BNY's 'Eliza' — 13 AI agents via MCP protocol, connecting Bloomberg, FactSet, and trading platforms.",
    impact: "15% lead growth · 10s→800ms load",
    tags: ["React", "Kafka", "Hazelcast", "Snowflake", "MCP"]
  },
  {
    number: "02",
    year: "2018–present",
    firm: "BNY Mellon",
    title: "Unified Design System at Enterprise Scale",
    subDetail: null,
    impact: "40% faster time-to-market · 35% perf gain",
    tags: ["Web Components", "A11y", "WCAG", "Design Tokens"]
  },
  {
    number: "03",
    year: "2015–2018",
    firm: "Morgan Stanley",
    title: "WealthDesk + AdvicePath Mobile App",
    subDetail: null,
    impact: "12% new accounts · 80% fewer trade errors",
    tags: ["Angular", "TypeScript", "Node.js"]
  },
  {
    number: "04",
    year: "2014–2015",
    firm: "American Express",
    title: "Global Payments Modernization",
    subDetail: null,
    impact: "30% drop in support calls · 25% faster deploys",
    tags: ["Angular", "Docker", "CI/CD"]
  },
];
```

Note on Case 1: the `subDetail` comes from Saurabh's Medium article describing the BNY "Eliza" system. Render it in `0.78rem`, `var(--text-3)`, italic, below the title.

**Card:** `background: var(--bg-2)`, `border: 0.5px solid var(--border)`, `border-radius: 4px`, `padding: var(--space-lg) var(--space-xl)`.
Hover: border `var(--border-mid)`, `translateY(-4px)`, `0.4s var(--ease-out-expo)`.
Impact: `var(--font-display)` italic, `var(--accent)`, `0.95rem`.
Tags: `0.7rem`, `padding: 3px 10px`, `border: 0.5px solid var(--border-mid)`, `border-radius: 2px`.

**Scroll animation:** `opacity: 0`, `y: 60px` → stagger `0.15s`, `duration: 0.9s`, `ease: expo.out`.

---

## Section 5 — Tech Stack (`components/Stack.tsx`)

**Section label:** `"02 · Tech Stack"`

Three columns. Each row: name left + proficiency bar right (48px × 3px, `var(--accent)` fill).
Animate width `0 → final%` on scroll enter.

```
Frontend                 Backend / Infra          AI & Data
────────                 ───────────────          ─────────
React           95%      Node.js         85%      ML / AI         75%
Angular         90%      Java / Spring   80%      Snowflake       80%
TypeScript      92%      Kafka           82%      WebSockets      85%
Web Components  85%      Hazelcast       78%      REST / GraphQL  88%
A11y / WCAG     88%      Docker + CI/CD  88%      Kibana / ELK    82%
Drupal / CMS    72%      Cloud (AWS)     80%      MCP Protocol    78%
```

`MCP Protocol` sourced from Medium article — Saurabh uses it to connect AI agents to financial data APIs at BNY.

---

## Section 6 — Career Timeline (`components/Timeline.tsx`)

**Section label:** `"03 · Career"`

Left: sticky heading (`position: sticky; top: 120px; align-self: flex-start`) + summary:
```
"18 years. Five firms. One consistent thread:
shipping products that perform at scale."
```

Right: five entries reverse-chron. Active entry (ScrollTrigger `toggleClass`): `border-left: 2px solid var(--accent)`, color `var(--text-1)`. Others: `var(--text-3)`.

```ts
const roles = [
  {
    years: "2018–Present",
    title: "Senior Vice President",
    firm: "BNY Mellon, New York",
    highlight: "AI portfolio construction · Unified Design System · Fortune Most Innovative 2025"
  },
  {
    years: "2015–2018",
    title: "Tech Lead (Tech Mahindra)",
    firm: "Morgan Stanley, New York",
    highlight: "WealthDesk · UMA account opening · 12% new accounts"
  },
  {
    years: "2014–2015",
    title: "IT Analyst (TCS)",
    firm: "American Express, Phoenix",
    highlight: "Global payments redesign · 30% fewer support calls"
  },
  {
    years: "2011–2014",
    title: "IT Analyst (TCS)",
    firm: "Bank of America, Bangalore",
    highlight: "Platform efficiency +20% · Fraud verification automation"
  },
  {
    years: "2007–2011",
    title: "Lead Engineer (HCL)",
    firm: "NBC Universal, Noida",
    highlight: "OpenText → Drupal migration · 70% cost saving · Google Ads monetization"
  },
];
```

---

## Section 7 — Writing (`components/Writing.tsx`)

**Section label:** `"04 · Writing"`
**Sub-label:** `"Published on Medium · saurabh-kohli.medium.com"`

```ts
const articles = [
  {
    title: "The Next Frontier in Portfolio Optimization",
    subtitle: "Agentic workflows and conversational AI are reshaping investment strategy",
    date: "Oct 2025",
    readTime: "7 min read",
    tags: ["AI Agents", "Portfolio", "MCP", "LLM"],
    url: "https://medium.com/@isaurabhkohli/the-next-frontier-in-portfolio-optimization-f1389852b5ab",
    excerpt: `In the rapidly evolving world of finance, the quest for smarter, faster,
and more adaptive investment strategies has never been more urgent. Autonomous
AI agents and natural language interfaces are revolutionizing how portfolio
managers interact with markets — and at BNY, we're building it.`
  },
  // Future articles: add as objects here. Component renders dynamically from this array.
];
```

**Card layout:**
- Grid: `repeat(auto-fill, minmax(320px, 1fr))`.
- Card: `background: var(--bg-2)`, `border: 0.5px solid var(--border)`, `border-radius: 4px`, `padding: var(--space-lg)`, class `writing-card`.
- Top row: date + read-time (`var(--text-3)`, `0.72rem`).
- Title: `var(--font-display)`, `1.4rem`, `var(--text-1)`.
- Subtitle: `var(--text-2)`, `0.85rem`, `line-height: 1.6`, `margin: 0.5rem 0`.
- Excerpt: `var(--text-3)`, `0.8rem`, clamped to 3 lines via `-webkit-line-clamp: 3`.
- Tags: same pill style as case study tags.
- Bottom: `"Read on Medium ↗"`, `var(--accent)`, `0.8rem`.
- Hover: `translateY(-4px)`, border `var(--border-mid)`.
- All links open `url` in new tab.

**CTA below:** `"More on Medium ↗"` ghost button → `https://saurabh-kohli.medium.com`, new tab.

**Scroll animation:**
```js
gsap.utils.toArray(".writing-card").forEach((card, i) => {
  gsap.fromTo(card, { opacity: 0, y: 40 }, {
    opacity: 1, y: 0, duration: 0.8, delay: i * 0.12, ease: "expo.out",
    scrollTrigger: { trigger: card, start: "top 88%", once: true }
  });
});
```

---

## Section 8 — Speaking (`components/Speaking.tsx`)

**Section label:** `"05 · Speaking"`

```ts
const talks = [
  {
    event: "WSO2Con 2025",
    location: "Barcelona, Spain",
    year: "2025",
    type: "Conference Talk",
    title: "API-First Architecture: Fostering Reuse at Enterprise Scale",
    description: `Presented the significance of an API-first approach in large-scale
financial platforms, covering reusability patterns, governance, and the MCP
protocol layer used at BNY to connect AI agents to Bloomberg, FactSet, and
internal trading APIs.`,
  },
  // Add future talks here
];
```

**Layout:** Full-width card per talk. Flex row: year/event column (`25%`) + title/description (`75%`).

- Year: `var(--font-display)`, `2.5rem`, `var(--text-3)`.
- Event: `label` style, `var(--accent)`, `0.7rem`.
- Location: `var(--text-3)`, `0.75rem`.
- Title: `var(--font-display)`, `1.3rem`, `var(--text-1)`. Hover: `var(--accent)`.
- Description: `var(--text-2)`, `0.85rem`, `line-height: 1.7`.
- Card: `border-top: 0.5px solid var(--border)`, `padding: var(--space-lg) 0`.

---

## Section 9 — Awards (`components/Awards.tsx`)

**Section label:** `"06 · Recognition"`

CSS Grid: `grid-template-columns: 1fr 1fr`, `gap: 1px`, `background: var(--border)`.

```ts
const awards = [
  { icon: "◆", name: "Titan Innovation Award", body: "International", category: "Artificial Intelligence (Gold)" },
  { icon: "◆", name: "Aureum Award",            body: "International", category: "Fintech Impact (Gold)" },
  { icon: "◇", name: "NY Digital Award",         body: "International", category: "AI & Machine Learning (Silver)" },
  { icon: "◇", name: "Best in Class Engineer",   body: "BNY Mellon",    category: "Platform Efficiency" },
  { icon: "◇", name: "Innovation Award",         body: "BNY Mellon",    category: "Conversational Agent Patent" },
];
```

Card: `background: var(--bg)`, `padding: var(--space-lg)`. Icon: `var(--accent)`, `1.5rem`. Name: `var(--font-display)`, `1.3rem`. Hover: `background: var(--bg-3)`.

---

## Section 10 — Research (`components/Papers.tsx`)

**Section label:** `"07 · Research"`

**Sub-label row:**
```
"Peer-reviewed · Published journals · ORCID: 0009-0002-0106-5730"
```
ORCID number: link to `https://orcid.org/0009-0002-0106-5730`, new tab, class `orcid-link`.

```ts
const papers = [
  {
    title: "AI-Driven Orchestration Systems in Cloud-Native Financial Applications",
    subtitle: "A Framework for Next-Generation Investment Platforms",
    journal: "SJECS",
    orcidUrl: "https://orcid.org/0009-0002-0106-5730"
  },
  {
    title: "Legacy System Modernization in Financial Institutions",
    subtitle: "A Comparative Analysis of Cloud-Native Migration Strategies",
    journal: "EMSJ",
    orcidUrl: "https://orcid.org/0009-0002-0106-5730"
  },
  {
    title: "AI-Driven Modernization: Transforming Financial Services Applications",
    subtitle: null,
    journal: "SJMD",
    orcidUrl: "https://orcid.org/0009-0002-0106-5730"
  },
  {
    title: "Financial Resilience: Cloud Architecture & AI Risk Integration",
    subtitle: null,
    journal: "JICRCR",
    orcidUrl: "https://orcid.org/0009-0002-0106-5730"
  },
];
```

**Row:** Full-width, `border-bottom: 0.5px solid var(--border)`, `padding: var(--space-md) 0`.
Flex: title left (`var(--font-display)`, `1.1rem`) + journal badge right.
Hover: title → `var(--text-1)`, row `background: var(--accent-dim)`. Cursor: `"↗ Read paper"`.
Each row links to `orcidUrl` in new tab.

---

## Section 11 — Testimonials (`components/Testimonials.tsx`)

**Section label:** `"08 · Recommendations"`

**Sub-label:** `"15 recommendations on LinkedIn"` with inline ghost link `"View all ↗"` → `https://www.linkedin.com/in/kohlisaurabh`.

```ts
const testimonials = [
  {
    quote: `"Saurabh has a unique combination of UX and programming skills.
This enables him to provide minute attention to UX details while developing
applications. He goes the extra mile in addressing UX concerns that even
the UX designers did not think of."`,
    author: "Colleague at Morgan Stanley",
    context: "Morgan Stanley, 2015–2018"
  },
  {
    quote: `"Saurabh calls himself a full-stack developer. I found him to be
more than just that. He understands the business, he can think through
workflow, he has a very good grasp of end user mental model and he is very
articulate about his point of view."`,
    author: "Colleague at BNY",
    context: "Advisory Fee Calculator, BNY Mellon"
  },
];
```

**Layout:** Two-column grid desktop, stacked mobile.

**Card:** `background: var(--bg-2)`, `border: 0.5px solid var(--border)`, `border-radius: 4px`, `padding: var(--space-lg)`.
Opening `"` glyph: `var(--font-display)`, `4rem`, `var(--accent)`, `line-height: 0.8`, top-left.
Quote: `var(--font-display)` italic, `1.05rem`, `var(--text-1)`, `line-height: 1.7`.
Author: `label` style, `var(--text-3)`, `margin-top: 1rem`.
Context: `var(--text-3)`, `0.72rem`.

**Scroll animation:** Alternating slide — even cards `x: -40→0`, odd cards `x: 40→0`. `opacity: 0→1`, `duration: 0.9s`.

---

## Section 12 — Contact (`components/Contact.tsx`)

Centered. `padding: var(--space-2xl)`.

**Large headline (word-reveal on scroll):**
```
Let's build
something
remarkable.
```
`var(--font-display)`, `clamp(3rem, 8vw, 7rem)`.

**Below headline:**
Email: `iSaurabhKohli@gmail.com` — `var(--accent)`, `var(--font-display)` italic, `1.4rem`. Hover: underline.

**Profile links row (all four profiles):**
```
[ LinkedIn ↗ ]  [ GitHub ↗ ]  [ Medium ↗ ]  [ ORCID ↗ ]
```
Ghost buttons. `border: 0.5px solid var(--border-mid)`, `padding: 0.65rem 1.5rem`, `border-radius: 2px`.

```ts
const links = [
  { label: "LinkedIn", url: "https://www.linkedin.com/in/kohlisaurabh" },
  { label: "GitHub",   url: "https://github.com/me-saurabhkohli",         className: "github-link" },
  { label: "Medium",   url: "https://saurabh-kohli.medium.com" },
  { label: "ORCID",    url: "https://orcid.org/0009-0002-0106-5730",       className: "orcid-link" },
];
```

All: `target="_blank" rel="noopener noreferrer"`.

**Footer:**
```
© 2025 Saurabh Kohli    ·    SK    ·    Built with Next.js
```
`label` style, `padding: var(--space-lg) 0`.

---

## Page Load Sequence

Single GSAP timeline with `.add()`:

```
t=0.00s  body opacity 0→1 (0.1s)
t=0.10s  navbar fade in (opacity 0→1, y: -10→0, 0.5s)
t=0.20s  hero label fade in (opacity 0→1, y: 8→0, 0.4s)
t=0.30s  "Saurabh" reveals (y: 110%→0, 1.1s, expo.out)
t=0.45s  "Kohli" reveals (y: 110%→0, 1.1s, expo.out)
t=0.70s  descriptor fade in (opacity 0→1, y: 20→0, 0.6s)
t=0.85s  profile link strip fade in (opacity 0→1, 0.4s)
t=0.90s  CTAs fade in (opacity 0→1, y: 16→0, 0.5s)
t=1.10s  bottom strip fade in (opacity 0→0.4, 0.6s)
```

---

## Global Scroll Animations

```js
// Section labels
gsap.utils.toArray(".label").forEach(el => {
  gsap.fromTo(el, { x: -20, opacity: 0 }, {
    x: 0, opacity: 1, duration: 0.6, ease: "expo.out",
    scrollTrigger: { trigger: el, start: "top 90%" }
  });
});

// Section fade
gsap.utils.toArray(".section").forEach(section => {
  gsap.fromTo(section, { opacity: 0 }, {
    opacity: 1, duration: 0.8,
    scrollTrigger: { trigger: section, start: "top 85%", once: true }
  });
});

// Divider draw-in
gsap.utils.toArray(".divider").forEach(el => {
  gsap.fromTo(el, { scaleX: 0, transformOrigin: "left center" }, {
    scaleX: 1, duration: 1.2, ease: "expo.out",
    scrollTrigger: { trigger: el, start: "top 95%" }
  });
});

// Writing cards
gsap.utils.toArray(".writing-card").forEach((card, i) => {
  gsap.fromTo(card, { opacity: 0, y: 40 }, {
    opacity: 1, y: 0, duration: 0.8, delay: i * 0.12, ease: "expo.out",
    scrollTrigger: { trigger: card, start: "top 88%", once: true }
  });
});

// Testimonials — alternating direction
gsap.utils.toArray(".testimonial-card").forEach((card, i) => {
  gsap.fromTo(card, { opacity: 0, x: i % 2 === 0 ? -40 : 40 }, {
    opacity: 1, x: 0, duration: 0.9, ease: "expo.out",
    scrollTrigger: { trigger: card, start: "top 88%", once: true }
  });
});
```

---

## Open Graph Meta (`app/layout.tsx`)

```tsx
export const metadata = {
  title: "Saurabh Kohli — Principal Full Stack Engineer",
  description: "SVP at BNY Mellon. 18 years shipping AI-powered fintech products at BNY, Morgan Stanley, and American Express.",
  openGraph: {
    title: "Saurabh Kohli",
    description: "Principal Full Stack Engineer · Fintech AI · New York",
    url: "https://saurabhkohli.dev",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saurabh Kohli",
    description: "SVP Engineering · BNY Mellon · Fintech AI",
  },
};
```

---

## Responsive Breakpoints

```
< 640px     single column, fonts -30%, no cursor, writing cards stack, testimonials stack
641–1023px  two-column hero, cases full-width, writing 2-col
≥ 1024px    full layout as specified
```

---

## Section Order Summary

```
Navbar (fixed)
├── 1.  Hero                [name + descriptor + profile link strip]
├── 2.  Marquee             [firms + awards + events]
├── 3.  Stats bar           [18+ · 5 · 4 · 3 · 15+]
├── 4.  Case studies        [01 · Selected Work]
├── 5.  Tech stack          [02 · Tech Stack]
├── 6.  Career timeline     [03 · Career]
├── 7.  Writing             [04 · Writing]          Medium
├── 8.  Speaking            [05 · Speaking]         WSO2Con Barcelona
├── 9.  Awards              [06 · Recognition]
├── 10. Research / Papers   [07 · Research]         ORCID
├── 11. Testimonials        [08 · Recommendations]  LinkedIn
└── 12. Contact + Footer    [all four profile links]
```

---

## Accessibility

- `prefers-reduced-motion`: all GSAP wrapped in `if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)`. If reduced: final state immediately.
- Focus: `outline: 2px solid var(--accent)`, `outline-offset: 4px` on all interactive elements.
- Semantics: `<nav>`, `<main>`, `<section aria-label="...">`, `<footer>`. One `<h1>`. Sections use `<h2>`.
- External links: `aria-label="Open [platform] in new tab"` where ambiguous.

---

## Performance

- `will-change: transform` only on actively animating elements. Removed in `onComplete`.
- All ScrollTrigger instances killed in `useEffect` cleanup.
- Google Fonts: `display=swap`, `<link rel="preconnect">` for `fonts.googleapis.com` + `fonts.gstatic.com`.
- No images. All weight from typography and animation.
- Target Lighthouse: Performance ≥ 90, Accessibility ≥ 95.

---

## Do Not

- Do not use Framer Motion.
- Do not use Tailwind component classes — utility classes only.
- Do not use any third-party icon library. Unicode only (`◆ ◇ ↗ ↓ ·`).
- Do not add a dark mode toggle — always dark.
- Do not add a preloader spinner. The page load sequence IS the preloader.
- Do not hardcode article content — use the `articles` array.
- Do not fabricate GitHub repository names — link only to `https://github.com/me-saurabhkohli`.
- Do not use placeholder avatar images.
- Do not use `!important` anywhere.