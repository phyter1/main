import type { Metadata } from "next";

const siteUrl = "https://ryn.phytertek.com";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on AI-first development, agentic workflows, autonomous systems, and modern engineering practices. Technical deep-dives and practical guides for building the future.",
  keywords: [
    "Blog",
    "AI Development",
    "Agentic AI",
    "Autonomous Workflows",
    "Engineering Leadership",
    "TypeScript",
    "React",
    "Next.js",
    "Technical Writing",
    "Software Architecture",
    "Developer Experience",
  ],
  openGraph: {
    title: "Blog | Ryan Lowe",
    description:
      "Technical insights on AI-first development, autonomous systems, and modern engineering practices.",
    url: `${siteUrl}/blog`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Ryan Lowe",
    description:
      "Technical insights on AI-first development, autonomous systems, and modern engineering practices.",
  },
  alternates: {
    types: {
      "application/rss+xml": `${siteUrl}/blog/rss.xml`,
    },
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
