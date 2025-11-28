"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPersonalStack, type StackItem, stackItems } from "@/data/stack";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const categoryLabels: Record<StackItem["category"], string> = {
  language: "Languages",
  framework: "Frameworks",
  library: "Libraries",
  database: "Databases",
  devtool: "Dev Tools",
  infrastructure: "Infrastructure",
};

const categoryColors: Record<StackItem["category"], string> = {
  language: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  framework: "bg-green-500/10 text-green-500 border-green-500/20",
  library: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  database: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  devtool: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  infrastructure: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
};

const proficiencyLevels: Record<
  StackItem["proficiency"],
  { label: string; color: string }
> = {
  expert: { label: "Expert", color: "text-green-500" },
  proficient: { label: "Proficient", color: "text-blue-500" },
  familiar: { label: "Familiar", color: "text-yellow-500" },
};

export default function StackPage() {
  const [viewMode, setViewMode] = useState<"personal" | "all">("personal");
  const [selectedCategory, setSelectedCategory] = useState<
    StackItem["category"] | "all"
  >("all");
  const reducedMotion = useReducedMotion();

  const personalStack = getPersonalStack();
  const categories: Array<StackItem["category"]> = [
    "language",
    "framework",
    "library",
    "database",
    "devtool",
    "infrastructure",
  ];

  const displayStack =
    viewMode === "personal"
      ? personalStack
      : selectedCategory === "all"
        ? stackItems
        : stackItems.filter((item) => item.category === selectedCategory);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: reducedMotion ? 0 : 0.3,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
              Tech Stack
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Technologies and tools I use to build modern, scalable
              applications. Highlighting my personal stack preferences for side
              projects.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center gap-2">
            <Button
              variant={viewMode === "personal" ? "default" : "outline"}
              onClick={() => setViewMode("personal")}
              className="gap-2"
            >
              <Heart className="h-4 w-4" />
              Personal Stack
            </Button>
            <Button
              variant={viewMode === "all" ? "default" : "outline"}
              onClick={() => setViewMode("all")}
            >
              All Technologies
            </Button>
          </div>

          {/* Category Filters (only show when viewing all) */}
          {viewMode === "all" && (
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                size="sm"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {categoryLabels[category]}
                </Button>
              ))}
            </div>
          )}

          {/* Personal Stack Callout */}
          {viewMode === "personal" && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="rounded-lg border border-primary/20 bg-primary/5 p-6"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="mb-2 text-xl font-bold text-foreground">
                    My Personal Stack
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    This is the technology stack I prefer for personal projects
                    and side work. It represents my ideal balance of developer
                    experience, type safety, performance, and modern best
                    practices.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stack Grid */}
          <motion.div
            key={`${viewMode}-${selectedCategory}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {displayStack.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <Card
                  className={`group h-full transition-all hover:shadow-md ${
                    item.personalStack
                      ? "border-primary/50 hover:border-primary"
                      : "hover:border-primary/50"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{item.label}</CardTitle>
                        {item.personalStack && (
                          <Heart className="h-4 w-4 fill-primary text-primary" />
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={categoryColors[item.category]}
                      >
                        {categoryLabels[item.category]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span
                        className={`font-medium ${
                          proficiencyLevels[item.proficiency].color
                        }`}
                      >
                        {proficiencyLevels[item.proficiency].label}
                      </span>
                      {item.yearsUsed && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            {item.yearsUsed}{" "}
                            {item.yearsUsed === 1 ? "year" : "years"}
                          </span>
                        </>
                      )}
                      <span className="text-muted-foreground">•</span>
                      <Badge variant="secondary" className="text-xs">
                        {item.context === "both"
                          ? "Professional & Personal"
                          : item.context === "professional"
                            ? "Professional"
                            : "Personal"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <Separator />

          {/* Stats Section */}
          <div className="grid gap-6 rounded-lg border border-border bg-card p-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {stackItems.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Technologies
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {personalStack.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Personal Stack
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {stackItems.filter((i) => i.proficiency === "expert").length}
              </div>
              <div className="text-sm text-muted-foreground">Expert Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {categories.length}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
          </div>

          {/* Tech Stack Breakdown by Category */}
          {viewMode === "all" && (
            <div className="space-y-6">
              <h2 className="text-center text-2xl font-bold text-foreground">
                Stack Breakdown
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => {
                  const count = stackItems.filter(
                    (item) => item.category === category,
                  ).length;
                  const personalCount = personalStack.filter(
                    (item) => item.category === category,
                  ).length;
                  return (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {categoryLabels[category]}
                          <Badge
                            variant="outline"
                            className={categoryColors[category]}
                          >
                            {count}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {personalCount > 0 && (
                            <span className="flex items-center gap-1 text-xs">
                              <Heart className="h-3 w-3 fill-primary text-primary" />
                              {personalCount} in personal stack
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
