import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat",
  description:
    "Chat with an AI assistant trained on Ryan Lowe's experience, projects, and engineering philosophy. Ask about technical skills, work approach, and software development.",
  openGraph: {
    title: "Chat with Ryan Lowe's AI",
    description:
      "Interactive AI chat trained on Ryan Lowe's experience in full-stack development, AI-first engineering, and technical leadership.",
    url: "https://ryn.phytertek.com/chat",
  },
  twitter: {
    title: "Chat with Ryan Lowe's AI",
    description:
      "Interactive AI chat trained on Ryan Lowe's experience in full-stack development, AI-first engineering, and technical leadership.",
  },
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
