import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Footer } from "@/components/layout/Footer";
import { Navigation } from "@/components/layout/Navigation";
import { firaMono, firaSans } from "@/lib/fonts";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ConvexClientProvider } from "./ConvexClientProvider";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: FOUC prevention script must run before React hydration
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'system';
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const resolvedTheme = theme === 'system' ? systemTheme : theme;
                if (resolvedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${firaSans.variable} ${firaMono.variable} font-sans antialiased flex flex-col min-h-screen`}
      >
        <ThemeProvider>
          <ConvexClientProvider>
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />
            <Analytics />
            <SpeedInsights />
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
