import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask Me Anything",
  description:
    "Chat with Ryan via an AI assistant trained on his experience, projects, and engineering philosophy. Ask about his technical skills, AI-assisted development practices, and approach to software leadership.",
  openGraph: {
    title: "Ask Me Anything - Ryan Lowe",
    description:
      "Interactive AI assistant trained on Ryan's experience in full-stack development, AI-first engineering, and technical leadership. Ask me anything about his background.",
    url: "https://ryn.phytertek.com/chat",
  },
  twitter: {
    title: "Ask Me Anything - Ryan Lowe",
    description:
      "Interactive AI assistant trained on Ryan's experience in full-stack development, AI-first engineering, and technical leadership. Ask me anything about his background.",
  },
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
