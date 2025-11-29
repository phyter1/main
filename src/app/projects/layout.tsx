import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore Ryan Lowe's portfolio of professional and personal projects in full-stack development, infrastructure, and developer tools.",
  openGraph: {
    title: "Projects | Ryan Lowe",
    description:
      "A collection of projects showcasing work in full-stack development, infrastructure, and developer tools.",
    url: "https://ryn.phytertek.com/projects",
  },
  twitter: {
    title: "Projects | Ryan Lowe",
    description:
      "A collection of projects showcasing work in full-stack development, infrastructure, and developer tools.",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
