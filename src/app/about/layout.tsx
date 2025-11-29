import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Ryan Lowe's background, engineering philosophy, and career journey in full-stack development and AI-assisted development.",
  openGraph: {
    title: "About Ryan Lowe",
    description:
      "Full-Stack Engineer, AI-Assisted Development Advocate, and builder of scalable systems with modern technology.",
    url: "https://ryn.phytertek.com/about",
  },
  twitter: {
    title: "About Ryan Lowe",
    description:
      "Full-Stack Engineer, AI-Assisted Development Advocate, and builder of scalable systems with modern technology.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
