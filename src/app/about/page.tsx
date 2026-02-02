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
              AI Engineering Leader • Managing Agent Teams • 10x Development
              Velocity
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
                    Over a decade of building software systems taught me
                    everything about full-stack engineering. From systems
                    administration and Salesforce development through enterprise
                    healthcare applications, payment processing systems, and
                    complex distributed architectures, I learned to own the
                    complete stack: infrastructure, CI/CD, databases, and user
                    interfaces. But in 2024, everything changed.
                  </p>
                  <p>
                    I discovered that AI agents aren't just tools. They're team
                    members. Today, I lead a team of AI agents that deliver what
                    used to require entire engineering departments. These agents
                    write code, run tests, review pull requests, debug
                    production issues, and iterate on features with a speed and
                    consistency that redefines what's possible. My role has
                    evolved from writing code to orchestrating agent teams,
                    designing workflows, and ensuring quality at 10x velocity.
                  </p>
                  <p>
                    This isn't augmentation. It's transformation. Where
                    traditional teams measure velocity in story points per
                    sprint, agent teams measure it in features per day. Where
                    human teams struggle with consistency across codebases,
                    agents maintain perfect adherence to patterns. Where hiring
                    and scaling used to take months, spinning up new agent
                    capabilities takes hours. The economics, the velocity, the
                    quality... everything is different. And I'm pioneering how to
                    make this the new standard.
                  </p>
                </div>
              </div>

              <div>
                <Button size="lg" className="gap-2" asChild>
                  <a href="/resume" target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                    View Resume
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* Philosophy Section */}
          <motion.div variants={itemVariants}>
            <h2 className="mb-8 text-3xl font-bold text-foreground">
              AI-Native Development Principles
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Team Leadership</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    AI agents are team members, not tools. Like managing human
                    developers, leading agent teams requires clear delegation,
                    quality standards, and workflow orchestration. The
                    difference? Agents scale instantly, work 24/7, and maintain
                    perfect consistency across every task.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Velocity Meets Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    The old trade-off between speed and quality is obsolete.
                    Agent teams deliver 10x faster while maintaining superior
                    test coverage, consistent patterns, and comprehensive
                    documentation. They don't get tired, skip tests, or take
                    shortcuts under pressure.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Economic Transformation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    What used to require a team of 10 engineers over 6 months
                    now takes one engineering leader and agent teams over weeks.
                    The cost structure, hiring timeline, and scaling dynamics
                    all change. This isn't incremental improvement; it's a
                    paradigm shift.
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
