"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSortedTimeline } from "@/data/timeline";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function AboutPage() {
  const timeline = getSortedTimeline();
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
              About Me
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Full-Stack Engineer • AI-Assisted Development Advocate • Building
              Scalable Systems with Modern Technology
            </p>
          </motion.div>

          {/* Profile Section */}
          <motion.div
            variants={itemVariants}
            className="grid gap-12 md:grid-cols-2"
          >
            {/* Portrait */}
            <div className="flex items-center justify-center">
              <div className="relative h-[400px] w-[320px] overflow-hidden rounded-lg border border-border">
                <Image
                  src="/assets/comfortable-headshot.jpg"
                  alt="Ryan Lowe"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col justify-center space-y-6">
              <div>
                <h2 className="mb-4 text-3xl font-bold text-foreground">
                  Background
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    I've spent over a decade building software systems, evolving
                    from systems administration and Salesforce development into
                    full-stack engineering and technical leadership. My journey
                    has taken me through enterprise healthcare applications,
                    payment processing systems, and complex distributed
                    architectures. Along the way, I've developed a deep
                    appreciation for owning the complete stack—from
                    infrastructure and CI/CD to databases and user interfaces.
                  </p>
                  <p>
                    I'm passionate about developer experience and modern tooling
                    that enables teams to move fast without sacrificing quality.
                    My approach emphasizes type-first development with tools
                    like Next.js, Drizzle ORM, Zod, and the TanStack ecosystem.
                    I gravitate toward technologies that provide strong
                    guarantees and excellent ergonomics: Bun for speed, Biome
                    for instant feedback, PostgreSQL for reliability, and
                    TypeScript everywhere for safety. This stack represents my
                    vision for sustainable, high-velocity development.
                  </p>
                  <p>
                    AI-assisted development has fundamentally changed how I
                    approach building software. I believe AI tools like Claude
                    Code and GitHub Copilot aren't just productivity
                    multipliers—they're enablers of a new development paradigm
                    where developers can focus on architecture and
                    problem-solving while AI handles the mechanical work. I'm
                    excited about exploring how teams can leverage these tools
                    to ship faster, write better tests, and maintain higher code
                    quality across the board.
                  </p>
                </div>
              </div>

              <div>
                <Button size="lg" className="gap-2" asChild>
                  <a href="/assets/ryan_lowe_resume_2025v2.pdf" download>
                    <Download className="h-4 w-4" />
                    Download Resume
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* Philosophy Section */}
          <motion.div variants={itemVariants}>
            <h2 className="mb-8 text-3xl font-bold text-foreground">
              Engineering Philosophy
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Augmented Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    AI tools fundamentally change how we build software. By
                    handling mechanical work, they free developers to focus on
                    architecture, problem-solving, and creating better user
                    experiences without compromising code quality.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Full-Stack Ownership</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Understanding the complete stack—from infrastructure and
                    databases to APIs and user interfaces—enables better
                    architectural decisions, faster iteration, and more elegant
                    solutions to complex problems.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Developer Experience First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Great developer tools and ergonomic APIs aren't
                    luxuries—they're force multipliers. Type safety, instant
                    feedback, and strong guarantees enable teams to move fast
                    while maintaining high quality and confidence.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <Separator />

          {/* Timeline Section */}
          <motion.div variants={itemVariants}>
            <h2 className="mb-8 text-3xl font-bold text-foreground">
              Career Timeline
            </h2>
            <div className="space-y-8">
              {timeline.map((event, _index) => (
                <motion.div
                  key={event.id}
                  variants={itemVariants}
                  className="relative pl-8 before:absolute before:left-0 before:top-2 before:h-full before:w-px before:bg-border"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-[-4px] top-2 h-2 w-2 rounded-full bg-primary" />

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{event.type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {typeof event.date === "string"
                          ? event.date
                          : event.date.end
                            ? `${event.date.start} - ${event.date.end}`
                            : `${event.date.start} - Present`}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-foreground">
                      {event.title}
                    </h3>

                    {event.organization && (
                      <p className="text-primary">{event.organization}</p>
                    )}

                    <p className="text-muted-foreground">{event.description}</p>

                    {event.highlights && event.highlights.length > 0 && (
                      <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
                        {event.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                    )}

                    {event.technologies && event.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {event.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
