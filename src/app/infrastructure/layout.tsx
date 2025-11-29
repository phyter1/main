import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Infrastructure",
  description:
    "Self-hosted infrastructure for personal projects. Bare metal Hetzner hosting with Coolify, PostgreSQL, Redis, MinIO, and automated deployments.",
  keywords: [
    "Infrastructure",
    "Self-Hosted",
    "Hetzner",
    "Coolify",
    "PostgreSQL",
    "Redis",
    "MinIO",
    "Docker",
    "DevOps",
    "Bare Metal",
  ],
  openGraph: {
    title: "Infrastructure | Ryan Lowe",
    description:
      "Self-hosted infrastructure with bare metal hosting, Coolify orchestration, and production-grade services.",
    url: "https://ryn.phytertek.com/infrastructure",
  },
  twitter: {
    title: "Infrastructure | Ryan Lowe",
    description:
      "Self-hosted infrastructure with bare metal hosting, Coolify orchestration, and production-grade services.",
  },
};

export default function InfrastructureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
