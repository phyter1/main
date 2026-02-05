import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Footer } from "@/components/layout/Footer";
import { Navigation } from "@/components/layout/Navigation";
import { firaMono, firaSans } from "@/lib/fonts";
import { Analytics } from "@vercel/analytics/react";

const siteUrl = "https://ryn.phytertek.com";
const siteTitle = "Ryan Lowe | Tech Lead • AI-First Development";
const siteDescription =
  "Tech lead building teams of humans and AI agents. Championing agentic development, autonomous workflows, and AI-first engineering culture. Expert in TypeScript, React, Next.js, and modern development tooling.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Ryan Lowe",
  },
  description: siteDescription,
  keywords: [
    "Ryan Lowe",
    "Tech Lead",
    "AI-First Development",
    "Agentic AI",
    "Autonomous Agents",
    "AI Development Teams",
    "TypeScript",
    "React",
    "Next.js",
    "Full-Stack Engineer",
    "Developer Experience",
    "Engineering Leadership",
    "Phytertek",
  ],
  authors: [{ name: "Ryan Lowe" }],
  creator: "Ryan Lowe",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteTitle,
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: undefined,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Ryan Lowe",
    url: siteUrl,
    jobTitle: "Tech Lead - AI-First Development",
    description: siteDescription,
    knowsAbout: [
      "AI-First Development",
      "Agentic AI",
      "Autonomous Agents",
      "Engineering Leadership",
      "TypeScript",
      "React",
      "Next.js",
      "Full-Stack Development",
      "Developer Experience",
      "AI Development Teams",
    ],
    sameAs: [
      "https://github.com/phytertek",
      "https://linkedin.com/in/ryanlowe",
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          defer
          src="https://umami.phytertek.com/script.js"
          data-website-id="81d82483-e533-456e-beaa-85e1c2858092"
        ></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${firaSans.variable} ${firaMono.variable} font-sans antialiased`}
      >
        <ConvexClientProvider>
          <Navigation />
          <main>{children}</main>
          <Footer />
          <Analytics />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
