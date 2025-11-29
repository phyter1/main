import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tech Stack",
  description:
    "Technologies and tools Ryan Lowe uses to build modern, scalable applications. TypeScript, React, Next.js, AWS, PostgreSQL, and more.",
  keywords: [
    "TypeScript",
    "React",
    "Next.js",
    "Bun",
    "PostgreSQL",
    "AWS",
    "Drizzle ORM",
    "TanStack",
    "Biome",
    "Tech Stack",
  ],
  openGraph: {
    title: "Tech Stack | Ryan Lowe",
    description:
      "Technologies and tools used to build modern, scalable applications including TypeScript, React, Next.js, and AWS.",
    url: "https://ryn.phytertek.com/stack",
  },
  twitter: {
    title: "Tech Stack | Ryan Lowe",
    description:
      "Technologies and tools used to build modern, scalable applications including TypeScript, React, Next.js, and AWS.",
  },
};

export default function StackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
