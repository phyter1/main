"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { principleGroups } from "@/data/principles";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function PrinciplesPage() {
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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
              Engineering Principles
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              The Three Ways, The Five Ideals, and Theory of Constraints guide
              how I approach software engineering, system design, and team
              productivity.
            </p>
          </motion.div>

          {/* Principle Groups */}
          {principleGroups.map((group, groupIndex) => (
            <div key={group.id}>
              {groupIndex > 0 && <Separator />}

              <motion.div variants={itemVariants} className="space-y-8">
                {/* Group Header */}
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-foreground">
                    {group.title}
                  </h2>
                  <p className="text-xl text-primary">{group.subtitle}</p>
                  <p className="max-w-4xl text-muted-foreground">
                    {group.description}
                  </p>
                  <p className="text-sm italic text-muted-foreground">
                    Source: {group.source}
                  </p>
                </div>

                {/* Principles Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {group.principles.map((principle) => (
                    <motion.div key={principle.id} variants={itemVariants}>
                      <Card className="h-full">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {principle.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {principle.description}
                            </p>
                          </div>
                          <div className="border-t border-border pt-4">
                            <h4 className="mb-2 text-sm font-semibold text-foreground">
                              Personal Application
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {principle.application}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
