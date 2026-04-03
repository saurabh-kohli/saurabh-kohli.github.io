import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Stats } from "@/components/Stats";
import { Cases } from "@/components/Cases";
import { ManifestoStrip } from "@/components/ManifestoStrip";
import { Stack } from "@/components/Stack";
import { Timeline } from "@/components/Timeline";
import { Writing } from "@/components/Writing";
import { Awards } from "@/components/Awards";
import { Papers } from "@/components/Papers";
import { Testimonials } from "@/components/Testimonials";
import { AboutContact } from "@/components/AboutContact";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Stats />
        <Cases />
        <ManifestoStrip />
        <Stack />
        <Timeline />
        <Papers />
        <Awards />
        <Writing />
        <Testimonials />
        <AboutContact />
      </main>
    </>
  );
}
