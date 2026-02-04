"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { stackItems, type StackItem } from "@/data/stack";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * SkillsMatrix - Display skills in three categories: Strong, Moderate, and Gaps
 * Provides an honest self-assessment of technical skills
 */
export function SkillsMatrix() {
  const reducedMotion = useReducedMotion();

  // Categorize skills based on proficiency levels
  const strongSkills = stackItems.filter(
    (item: StackItem) => item.proficiency === "expert",
  );

  const moderateSkills = stackItems.filter(
    (item: StackItem) => item.proficiency === "proficient",
  );

  // For gaps, we'll use "familiar" proficiency or create a placeholder
  // Since the current stack doesn't have "familiar", we'll define gaps explicitly
  const gapsSkills: Array<{ id: string; label: string; category: string }> = [
    { id: "rust", label: "Rust", category: "language" },
    { id: "go", label: "Go", category: "language" },
    { id: "python", label: "Python", category: "language" },
    { id: "machine-learning", label: "Machine Learning", category: "skill" },
    {
      id: "mobile-native",
      label: "Native Mobile (iOS/Android)",
      category: "skill",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.1,
        delayChildren: reducedMotion ? 0 : 0.2,
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
        ease: [0.65, 0, 0.35, 1] as const,
      },
    },
  };

  return (
    <section className="relative bg-background py-24 px-6">
      {/* Background gradient similar to Hero */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <motion.div
        className="relative z-10 mx-auto max-w-6xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Section heading */}
        <motion.h2
          variants={itemVariants}
          className="mb-4 text-center font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl"
        >
          Skills Matrix
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="mx-auto mb-12 max-w-2xl text-center text-lg text-muted-foreground"
        >
          An honest assessment of my technical skills and areas for growth
        </motion.p>

        {/* Three-column grid layout */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {/* Strong Skills Column */}
          <div className="flex flex-col">
            <h3 className="mb-4 text-xl font-semibold text-foreground">
              Strong
            </h3>
            <div className="flex flex-wrap gap-2">
              {strongSkills.map((skill) => (
                <Badge key={skill.id} variant="default">
                  {skill.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Moderate Skills Column */}
          <div className="flex flex-col">
            <h3 className="mb-4 text-xl font-semibold text-foreground">
              Moderate
            </h3>
            <div className="flex flex-wrap gap-2">
              {moderateSkills.map((skill) => (
                <Badge key={skill.id} variant="secondary">
                  {skill.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Gaps Column */}
          <div className="flex flex-col">
            <h3 className="mb-4 text-xl font-semibold text-foreground">Gaps</h3>
            <div className="flex flex-wrap gap-2">
              {gapsSkills.map((skill) => (
                <Badge key={skill.id} variant="outline">
                  {skill.label}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
