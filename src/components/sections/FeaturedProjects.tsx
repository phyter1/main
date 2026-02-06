"use client";

import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { ChevronDown, ExternalLink, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getFeaturedProjects } from "@/data/projects";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FeaturedProjectsProps {
  variants?: Variants;
}

/**
 * FeaturedProjects - Displays featured projects on homepage
 * Shows 3 featured projects with responsive grid layout
 */
export function FeaturedProjects({ variants }: FeaturedProjectsProps) {
  const reducedMotion = useReducedMotion();
  const featuredProjects = getFeaturedProjects().slice(0, 3);

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

  return (
    <motion.section
      variants={variants}
      className="mx-auto w-full max-w-7xl px-6 py-24"
    >
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Featured Projects
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          A selection of recent work showcasing full-stack development,
          infrastructure, and AI integration.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {featuredProjects.map((project) => (
          <motion.div key={project.id} variants={cardVariants}>
            <Card className="flex h-full flex-col">
              <CardHeader>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <Badge
                    variant={
                      project.status === "live"
                        ? "default"
                        : project.status === "in-progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {project.technologies.slice(0, 6).map((tech) => (
                    <Badge key={tech} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                  {project.technologies.length > 6 && (
                    <Badge variant="outline">
                      +{project.technologies.length - 6}
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                {project.links.demo && (
                  <Button variant="vibrant" size="sm" asChild>
                    <a
                      href={project.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Live Demo
                    </a>
                  </Button>
                )}
                {project.links.github && (
                  <Button variant="vibrant" size="sm" asChild>
                    <a
                      href={project.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      Code
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-12 text-center">
        <Button size="lg" variant="outline" asChild>
          <a href="/projects">View All Projects</a>
        </Button>
      </div>

      {/* Scroll indicator */}
      <div className="mt-16 flex justify-center">
        <button
          type="button"
          onClick={() => {
            const nextSection = document.getElementById("principles-preview");
            nextSection?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          aria-label="Scroll to principles preview"
          className="cursor-pointer transition-opacity hover:opacity-70"
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
        </button>
      </div>
    </motion.section>
  );
}
