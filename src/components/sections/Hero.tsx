"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { RotatingTypeWriter } from "@/components/effects/RotatingTypeWriter";
import { TypeWriter } from "@/components/effects/TypeWriter";
import { Button } from "@/components/ui/button";
import { stackItems } from "@/data/stack";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Hero - Landing page hero section
 * Features typewriter effect, animated headline, and CTAs
 */
export function Hero() {
  const [_typewriterComplete, setTypewriterComplete] = useState(false);
  const reducedMotion = useReducedMotion();

  // Get expert and proficient technologies for rotating display
  const expertTechnologies = stackItems
    .filter((item) => item.proficiency === "expert")
    .map((item) => `Expert in ${item.label}`);

  const proficientTechnologies = stackItems
    .filter((item) => item.proficiency === "proficient")
    .map((item) => `Proficient in ${item.label}`);

  // Combine and take a curated selection
  const techShowcase = [
    ...expertTechnologies.slice(0, 8), // Top 8 expert skills
    ...proficientTechnologies.slice(0, 4), // Top 4 proficient skills
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
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-6 py-32 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Terminal greeting */}
        <motion.div variants={itemVariants} className="mb-8">
          <TypeWriter
            text="> Hello, I'm Ryan"
            speed={50}
            className="text-lg text-primary md:text-xl"
            onComplete={() => setTypewriterComplete(true)}
          />
        </motion.div>

        {/* Main headline */}
        <motion.h1
          variants={itemVariants}
          className="mb-6 font-sans text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl"
        >
          Tech Lead
          <br />
          <span className="text-primary">AI-First Development</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          Leading teams of humans and AI agents to build scalable applications.
          <br />
          Championing agentic development and autonomous workflows.
        </motion.p>

        {/* Rotating tech showcase */}
        <motion.div
          variants={itemVariants}
          className="mx-auto mb-12 max-w-2xl text-xl md:text-2xl"
        >
          <RotatingTypeWriter
            words={techShowcase}
            typingSpeed={80}
            deletingSpeed={40}
            pauseDuration={1500}
          />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button size="lg" className="min-w-[200px]" asChild>
            <a href="/projects">View My Work</a>
          </Button>
          <Button size="lg" variant="outline" className="min-w-[200px]" asChild>
            <a href="/about">Let's Connect</a>
          </Button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          variants={itemVariants}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{
              y: reducedMotion ? 0 : [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <ChevronDown className="h-8 w-8 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
