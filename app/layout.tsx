import type { Metadata } from "next";
import "./globals.css";
import "./morphing.scss";
import { Cursor } from "@/components/Cursor";
import { LenisProvider } from "@/components/LenisProvider";
import { Intro } from "@/components/Intro";

export const metadata: Metadata = {
  metadataBase: new URL("https://saurabhkohli.dev"),
  title: "Saurabh Kohli — Principal Full Stack Engineer",
  description:
    "SVP at BNY. 18 years shipping AI-powered fintech products at BNY, Morgan Stanley, and American Express.",
  openGraph: {
    title: "Saurabh Kohli",
    description: "Principal Full Stack Engineer · Fintech AI · New York",
    url: "https://saurabhkohli.dev",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saurabh Kohli",
    description: "SVP Engineering · BNY · Fintech AI",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Capriola&family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@1,400;1,600&family=Raleway:wght@800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Intro />
        <LenisProvider />
        <Cursor />
        {children}
      </body>
    </html>
  );
}
