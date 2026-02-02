import type { Metadata } from "next";
import "./globals.css";
import { LayoutContent } from "@/components/layout/LayoutContent";
import { firaMono, firaSans } from "@/lib/fonts";

const siteUrl = "https://ryn.phytertek.com";
const siteTitle = "Ryan Lowe | AI Engineering Leader";
const siteDescription =
  "AI Engineering Leader managing teams of AI agents to deliver 10x development velocity. Pioneering AI-native workflows that combine unprecedented speed, quality, and cost efficiency.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Ryan Lowe",
  },
  description: siteDescription,
  keywords: [
    "Ryan Lowe",
    "AI Engineering Leader",
    "AI Agent Teams",
    "AI-Native Development",
    "Claude Code",
    "GitHub Copilot",
    "10x Development Velocity",
    "TypeScript",
    "React",
    "Next.js",
    "AI-First Developer",
    "Agent Orchestration",
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
    jobTitle: "AI Engineering Leader",
    description: siteDescription,
    knowsAbout: [
      "AI Agent Teams",
      "AI-Native Development",
      "Claude Code",
      "GitHub Copilot",
      "TypeScript",
      "React",
      "Next.js",
      "AWS",
      "Agent Orchestration",
      "10x Development Velocity",
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
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
