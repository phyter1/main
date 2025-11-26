"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github, Star } from "lucide-react";
import { useState } from "react";
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
import { type Project, projects } from "@/data/projects";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function ProjectsPage() {
  const [filter, setFilter] = useState<"all" | Project["status"]>("all");
  const reducedMotion = useReducedMotion();

  const filteredProjects =
    filter === "all" ? projects : projects.filter((p) => p.status === filter);

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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
              Projects
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              A collection of projects showcasing my work in full-stack
              development, infrastructure, and developer tools.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-2"
          >
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All Projects
            </Button>
            <Button
              variant={filter === "live" ? "default" : "outline"}
              onClick={() => setFilter("live")}
            >
              Live
            </Button>
            <Button
              variant={filter === "in-progress" ? "default" : "outline"}
              onClick={() => setFilter("in-progress")}
            >
              In Progress
            </Button>
            <Button
              variant={filter === "archived" ? "default" : "outline"}
              onClick={() => setFilter("archived")}
            >
              Archived
            </Button>
          </motion.div>

          {/* Projects Grid */}
          <motion.div
            variants={containerVariants}
            className="grid gap-6 md:grid-cols-2"
          >
            {filteredProjects.map((project) => (
              <motion.div key={project.id} variants={itemVariants}>
                <Card
                  className={`group h-full transition-all hover:shadow-lg ${
                    project.featured ? "border-primary/50" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">
                          {project.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
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
                          {project.featured && (
                            <Badge variant="outline" className="gap-1">
                              <Star className="h-3 w-3" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardDescription className="mt-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Metrics */}
                    {project.metrics && (
                      <div className="flex flex-wrap gap-4 text-sm">
                        {project.metrics.users && (
                          <div>
                            <span className="text-muted-foreground">
                              Users:{" "}
                            </span>
                            <span className="font-semibold text-foreground">
                              {project.metrics.users.toLocaleString()}+
                            </span>
                          </div>
                        )}
                        {project.metrics.performance && (
                          <div>
                            <span className="text-muted-foreground">
                              Performance:{" "}
                            </span>
                            <span className="font-semibold text-foreground">
                              {project.metrics.performance}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Highlights */}
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {project.highlights.slice(0, 3).map((highlight) => (
                        <li key={highlight} className="flex items-start">
                          <span className="mr-2 text-primary">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    {project.links.demo && (
                      <Button variant="default" size="sm" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Live Demo
                      </Button>
                    )}
                    {project.links.github && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Github className="h-4 w-4" />
                        Code
                      </Button>
                    )}
                    {!project.links.demo && !project.links.github && (
                      <Button variant="outline" size="sm" disabled>
                        Private Project
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <motion.div
              variants={itemVariants}
              className="py-12 text-center text-muted-foreground"
            >
              <p>No projects found for this filter.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
