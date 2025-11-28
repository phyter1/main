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
              Tech Lead at Hugo Health • AI-Assisted Development Champion •
              Building Healthcare Technology for 30,000+ Users
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
                  src="/assets/portrait-main.jpg"
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
                    I'm a Tech Lead at Hugo Health with 7+ years of experience
                    building production healthcare systems that serve 30,000+
                    users. I architect and own the full stack for Hugo
                    Connect—from Kubernetes clusters and Terraform
                    infrastructure to Node.js services and React
                    applications—managing AWS deployments, MongoDB and MySQL
                    databases, and CI/CD pipelines in a regulated healthcare
                    environment.
                  </p>
                  <p>
                    My personal approach emphasizes type-first development with
                    modern tooling: Next.js with React Server Components, Hono
                    for edge-native APIs, Drizzle ORM and Zod for end-to-end
                    type safety, and the TanStack ecosystem for data management.
                    I've adopted Bun and Biome to maximize developer velocity,
                    and prefer PostgreSQL with Redis for production data layers.
                    This stack represents my vision for sustainable,
                    high-velocity development.
                  </p>
                  <p>
                    AI-assisted development is core to how I work and lead. I've
                    integrated Claude Code, GitHub Copilot, and specialized AI
                    tools into our engineering workflows, dramatically
                    accelerating feature delivery, test coverage, and
                    documentation quality. I'm pioneering how teams can leverage
                    AI to ship faster while maintaining the code standards
                    healthcare demands.
                  </p>
                </div>
              </div>

              <div>
                <Button size="lg" className="gap-2" asChild>
                  <a href="/assets/ryan_lowe-resume-2025.pdf" download>
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
                  <CardTitle>AI-Augmented Excellence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Strategic use of AI tools accelerates delivery without
                    compromising quality. I select the right AI tool for each
                    task while maintaining rigorous code standards.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Full-Stack Ownership</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    From infrastructure as code to user interfaces, I believe in
                    owning the complete stack. This enables better architectural
                    decisions and faster iteration.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Healthcare-First Mindset</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Building for healthcare means prioritizing security,
                    reliability, and user trust. Every line of code impacts
                    patient care and data privacy.
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
