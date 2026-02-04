import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Fit Assessment",
  description:
    "AI-powered job fit assessment tool. Get honest insights on how well a job description matches your experience, skills, and career background.",
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
      "AI-powered tool to assess how well job descriptions match your professional background. Get honest, detailed insights on role compatibility.",
    url: "https://ryn.phytertek.com/fit-assessment",
  },
  twitter: {
    title: "Job Fit Assessment | Ryan Lowe",
    description:
      "AI-powered tool to assess how well job descriptions match your professional background. Get honest, detailed insights on role compatibility.",
  },
};

export default function FitAssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
