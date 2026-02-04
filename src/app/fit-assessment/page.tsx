"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { JobFitAnalyzer } from "@/components/sections/JobFitAnalyzer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function FitAssessmentPage() {
  const reducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0 : 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
              Job Fit Assessment
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Get an honest assessment of how well a job matches your experience
              and skills based on your background, expertise, and career
              journey.
            </p>
          </motion.div>

          {/* How to Use Section */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  How to Use This Tool
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  This AI-powered tool analyzes job descriptions against my
                  professional background to provide an honest assessment of
                  role fit. Simply paste a complete job description below and
                  click "Analyze Fit" to receive detailed insights.
                </p>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    What You'll Get:
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span>
                        <strong>Fit Level:</strong> A clear strong/moderate/weak
                        assessment
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span>
                        <strong>Reasoning:</strong> Detailed analysis of why the
                        role matches (or doesn't)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span>
                        <strong>Recommendations:</strong> Honest next steps and
                        considerations
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
                  <p className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>
                      <strong className="text-foreground">
                        Honest Assessment Philosophy:
                      </strong>{" "}
                      This tool provides transparent feedback. A "weak fit"
                      doesn't mean you can't do the job—it means there may be
                      better opportunities that align more closely with your
                      strengths and experience.
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tips Section */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Tips for Best Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      <strong className="text-foreground">
                        Paste the complete job description:
                      </strong>{" "}
                      Include requirements, responsibilities, and qualifications
                      for the most accurate analysis
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      <strong className="text-foreground">
                        Be patient during analysis:
                      </strong>{" "}
                      The AI carefully evaluates multiple factors to provide
                      thorough insights
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      <strong className="text-foreground">
                        Review recommendations carefully:
                      </strong>{" "}
                      The suggestions are tailored to help you make informed
                      decisions about your next career move
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      <strong className="text-foreground">
                        Consider multiple roles:
                      </strong>{" "}
                      Compare assessments across different opportunities to find
                      the best match for your skills
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Job Fit Analyzer Component */}
          <motion.div variants={itemVariants}>
            <JobFitAnalyzer />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
