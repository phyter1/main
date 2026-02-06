"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { principleGroups } from "@/data/principles";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PrinciplesPreviewProps {
  variants?: any;
}

/**
 * PrinciplesPreview - Displays preview of engineering principles on homepage
 * Shows first 3 principles from The Three Ways (Phoenix Project)
 */
export function PrinciplesPreview({ variants }: PrinciplesPreviewProps) {
  const reducedMotion = useReducedMotion();

  // Get The Three Ways from Phoenix Project
  const phoenixGroup = principleGroups.find((group) => group.id === "phoenix");
  const principles = phoenixGroup?.principles.slice(0, 3) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0 : 0.5,
      },
    },
  };

  // Shorten description to max 150 characters
  const shortenDescription = (text: string, maxLength = 150): string => {
    if (text.length <= maxLength) return text;
    const shortened = text.slice(0, maxLength);
    const lastSpace = shortened.lastIndexOf(" ");
    return `${shortened.slice(0, lastSpace)}...`;
  };

  return (
    <motion.section
      variants={variants}
      className="mx-auto w-full max-w-7xl px-6 py-24"
    >
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Engineering Principles
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Core principles from The Phoenix Project that guide my approach to
          software engineering.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {principles.map((principle) => (
          <motion.div key={principle.id} variants={cardVariants}>
            <Card className="flex h-full flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{principle.title}</CardTitle>
                <CardDescription>
                  {shortenDescription(principle.description)}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {shortenDescription(principle.application)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-12 text-center">
        <Button size="lg" variant="outline" asChild>
          <a href="/principles">Learn More</a>
        </Button>
      </div>
    </motion.section>
  );
}
