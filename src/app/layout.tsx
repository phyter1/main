import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Navigation } from "@/components/layout/Navigation";
import { firaMono, firaSans } from "@/lib/fonts";

const siteUrl = "https://ryn.phytertek.com";
const siteTitle = "Ryan Lowe | Full-Stack Engineer & Infrastructure Architect";
const siteDescription =
  "Senior software engineer specializing in TypeScript, React, Next.js, and AWS. Building scalable healthcare technology and developer tools.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Ryan Lowe",
  },
  description: siteDescription,
  keywords: [
    "Ryan Lowe",
    "Full-Stack Engineer",
    "TypeScript",
    "React",
    "Next.js",
    "AWS",
    "Infrastructure",
    "Software Engineer",
    "Developer",
    "AI-Assisted Development",
    "Healthcare Technology",
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
    jobTitle: "Full-Stack Engineer & Infrastructure Architect",
    description: siteDescription,
    knowsAbout: [
      "TypeScript",
      "React",
      "Next.js",
      "AWS",
      "PostgreSQL",
      "Full-Stack Development",
      "Infrastructure",
      "AI-Assisted Development",
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
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
