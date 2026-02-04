import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Fit Assessment",
  description:
    "See if I'm a good fit for your open role. AI-powered assessment of how my experience and skills match your job requirements.",
  keywords: [
    "Job Fit Assessment",
    "Career Assessment",
    "Job Matching",
    "AI Career Tool",
    "Job Analysis",
    "Skills Assessment",
    "Career Fit",
    "Job Compatibility",
    "Resume Analysis",
    "Career Planning",
  ],
  openGraph: {
    title: "Job Fit Assessment | Ryan Lowe",
    description:
      "See if I'm a good fit for your open role. AI-powered assessment of how my experience and skills match your job requirements.",
    url: "https://ryn.phytertek.com/fit-assessment",
  },
  twitter: {
    title: "Job Fit Assessment | Ryan Lowe",
    description:
      "See if I'm a good fit for your open role. AI-powered assessment of how my experience and skills match your job requirements.",
  },
};

export default function FitAssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
