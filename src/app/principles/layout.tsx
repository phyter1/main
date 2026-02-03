import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Engineering Principles",
  description:
    "My engineering principles inspired by The Phoenix Project, The Unicorn Project, and The Goal. Learn about The Three Ways, The Five Ideals, and Theory of Constraints.",
  keywords: [
    "Engineering Principles",
    "The Phoenix Project",
    "The Unicorn Project",
    "The Goal",
    "Theory of Constraints",
    "The Three Ways",
    "The Five Ideals",
    "DevOps",
    "Systems Thinking",
  ],
  openGraph: {
    title: "Engineering Principles | Ryan Lowe",
    description:
      "Engineering principles inspired by The Phoenix Project, The Unicorn Project, and The Goal. The Three Ways, The Five Ideals, and Theory of Constraints.",
    url: "https://ryn.phytertek.com/principles",
  },
  twitter: {
    title: "Engineering Principles | Ryan Lowe",
    description:
      "Engineering principles inspired by The Phoenix Project, The Unicorn Project, and The Goal. The Three Ways, The Five Ideals, and Theory of Constraints.",
  },
};

export default function PrinciplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
