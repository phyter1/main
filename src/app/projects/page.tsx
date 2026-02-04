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
import { ExpandableContext } from "@/components/ui/expandable-context";
import { type Project, projects } from "@/data/projects";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function ProjectsPage() {
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | Project["category"]
  >("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Project["status"]>(
    "all",
  );
  const reducedMotion = useReducedMotion();

  const filteredProjects = projects.filter((p) => {
    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

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
          <motion.div variants={itemVariants} className="space-y-4">
            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={categoryFilter === "all" ? "default" : "outline"}
                onClick={() => setCategoryFilter("all")}
              >
                All Projects
              </Button>
              <Button
                variant={
                  categoryFilter === "professional" ? "default" : "outline"
                }
                onClick={() => setCategoryFilter("professional")}
              >
                Professional
              </Button>
              <Button
                variant={categoryFilter === "personal" ? "default" : "outline"}
                onClick={() => setCategoryFilter("personal")}
              >
                Personal
              </Button>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
              >
                All Status
              </Button>
              <Button
                variant={statusFilter === "live" ? "default" : "outline"}
                onClick={() => setStatusFilter("live")}
                size="sm"
              >
                Live
              </Button>
              <Button
                variant={statusFilter === "in-progress" ? "default" : "outline"}
                onClick={() => setStatusFilter("in-progress")}
                size="sm"
              >
                In Progress
              </Button>
              <Button
                variant={statusFilter === "archived" ? "default" : "outline"}
                onClick={() => setStatusFilter("archived")}
                size="sm"
              >
                Archived
              </Button>
            </div>
          </motion.div>

          {/* Projects Grid */}
          <motion.div
            key={`${categoryFilter}-${statusFilter}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
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
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={
                              project.category === "personal"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {project.category}
                          </Badge>
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

                  <CardFooter className="flex flex-col gap-4">
                    <div className="flex gap-2">
                      {project.links.demo && (
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-2"
                          asChild
                        >
                          <a
                            href={project.links.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Live Demo
                          </a>
                        </Button>
                      )}
                      {project.links.github && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          asChild
                        >
                          <a
                            href={project.links.github}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="h-4 w-4" />
                            Code
                          </a>
                        </Button>
                      )}
                      {!project.links.demo && !project.links.github && (
                        <Button variant="outline" size="sm" disabled>
                          Private Project
                        </Button>
                      )}
                    </div>

                    {project.context && (
                      <ExpandableContext
                        context={project.context}
                        projectId={project.id}
                        className="w-full"
                      />
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
