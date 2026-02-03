"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Boxes,
  Bug,
  Database,
  GitBranch,
  HardDrive,
  Package,
  Radio,
  Server,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Infrastructure layers
const infrastructureLayers = [
  {
    id: "hosting",
    title: "Bare Metal Hosting",
    layer: "Foundation",
    icon: Server,
    description: "Hetzner dedicated server with hardware firewall",
    technologies: ["Hetzner", "Hardware Firewall", "Ubuntu Server"],
    highlights: [
      "Dedicated bare metal resources",
      "Network-level firewall protection",
      "Full control over hardware and OS",
    ],
  },
  {
    id: "orchestration",
    title: "Application Platform",
    layer: "Orchestration",
    icon: Workflow,
    description:
      "Self-hosted Coolify for container orchestration and deployment",
    technologies: ["Coolify", "Docker", "Nixpacks", "Git Integration"],
    highlights: [
      "Automated deployments from Git repositories",
      "Zero-downtime deployments with health checks",
      "Built-in reverse proxy and SSL management",
    ],
  },
];

// Core services running on the platform
const coreServices = [
  {
    id: "postgres",
    title: "PostgreSQL",
    icon: Database,
    description: "Primary relational database for application data",
    technologies: ["PostgreSQL 16", "Connection Pooling"],
    highlights: ["ACID compliance", "Full-text search", "JSON/JSONB support"],
  },
  {
    id: "redis",
    title: "Redis",
    icon: Boxes,
    description: "In-memory data store for caching and queues",
    technologies: ["Redis 7", "Pub/Sub", "Streams"],
    highlights: [
      "Sub-millisecond response times",
      "Session storage",
      "Queue management",
    ],
  },
  {
    id: "minio",
    title: "MinIO",
    icon: HardDrive,
    description: "S3-compatible object storage for files and assets",
    technologies: ["MinIO", "S3 API", "Versioning"],
    highlights: [
      "S3-compatible API",
      "Versioned object storage",
      "Self-hosted file storage",
    ],
  },
  {
    id: "soketi",
    title: "Soketi",
    icon: Radio,
    description: "WebSocket server for real-time communications",
    technologies: ["Soketi", "WebSockets", "Pusher Protocol"],
    highlights: [
      "Pusher-compatible protocol",
      "Real-time event broadcasting",
      "Lightweight and fast",
    ],
  },
  {
    id: "gitea",
    title: "Gitea",
    icon: GitBranch,
    description:
      "Self-hosted Git service for code repositories with AI-assisted development workflows",
    technologies: ["Gitea", "Git", "CI/CD Webhooks"],
    highlights: [
      "Private Git repositories",
      "Webhook integration with Coolify",
      "Issue tracking and PRs",
    ],
  },
  {
    id: "umami",
    title: "Umami",
    icon: BarChart3,
    description: "Privacy-focused web analytics and traffic tracking",
    technologies: ["Umami", "Analytics", "PostgreSQL"],
    highlights: [
      "GDPR compliant analytics",
      "Real-time visitor tracking",
      "Custom event tracking",
    ],
  },
  {
    id: "bugsink",
    title: "Bugsink",
    icon: Bug,
    description: "Self-hosted error tracking and monitoring",
    technologies: ["Bugsink", "Error Tracking", "Logging"],
    highlights: [
      "Real-time error monitoring",
      "Stack trace analysis",
      "Self-hosted error aggregation",
    ],
  },
];

// Applications deployed on the platform
const deployedApps = [
  {
    id: "portfolio",
    title: "Portfolio Site",
    description: "This Next.js portfolio application",
    technologies: ["Next.js 16", "React 19", "Tailwind CSS"],
    deployment: "Auto-deployed via Coolify with Nixpacks",
  },
  {
    id: "blackjack",
    title: "Blackjack Game",
    description: "Interactive blackjack game application",
    technologies: ["React", "TypeScript"],
    deployment: "Auto-deployed via Coolify with Nixpacks",
  },
];

export default function InfrastructurePage() {
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
              Infrastructure
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              AI-assisted infrastructure management for personal projects. Bare
              metal hosting with intelligent automated deployments via Coolify.
            </p>
          </motion.div>

          {/* Architecture Overview */}
          <motion.div
            variants={itemVariants}
            className="rounded-lg border border-border bg-card p-8"
          >
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Architecture Principles
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Self-Hosted</h3>
                <p className="text-sm text-muted-foreground">
                  Full control over infrastructure with dedicated bare metal
                  hosting and self-hosted services.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  Automated Deployments
                </h3>
                <p className="text-sm text-muted-foreground">
                  AI-first deployment automation with Git-integrated Coolify and
                  Nixpacks for intelligent zero-downtime updates.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Modern Stack</h3>
                <p className="text-sm text-muted-foreground">
                  Production-grade services with PostgreSQL, Redis, MinIO,
                  WebSockets, and more.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Infrastructure Stack Visualization */}
          <motion.div variants={itemVariants} className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground">
              Infrastructure Stack
            </h2>

            {/* Hosting & Orchestration Layers */}
            <div className="space-y-6">
              {infrastructureLayers.map((layer) => {
                const Icon = layer.icon;
                return (
                  <motion.div key={layer.id} variants={itemVariants}>
                    <Card className="border-l-4 border-l-primary transition-all hover:shadow-md">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="rounded-lg bg-primary/10 p-3">
                            <Icon className="h-8 w-8 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <Badge variant="outline">{layer.layer}</Badge>
                            </div>
                            <CardTitle className="text-xl">
                              {layer.title}
                            </CardTitle>
                            <CardDescription className="mt-2">
                              {layer.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-foreground">
                            Technologies
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {layer.technologies.map((tech) => (
                              <Badge key={tech} variant="secondary">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-foreground">
                            Features
                          </h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {layer.highlights.map((highlight) => (
                              <li key={highlight} className="flex items-start">
                                <span className="mr-2 text-primary">•</span>
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Core Services */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              Core Services
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {coreServices.map((service) => {
                const Icon = service.icon;
                return (
                  <motion.div key={service.id} variants={itemVariants}>
                    <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle>{service.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {service.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-foreground">
                            Stack
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {service.technologies.map((tech) => (
                              <Badge key={tech} variant="secondary">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {service.highlights.map((highlight) => (
                              <li key={highlight} className="flex items-start">
                                <span className="mr-2 text-primary">•</span>
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Deployed Applications */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              Deployed Applications
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {deployedApps.map((app) => (
                <motion.div key={app.id} variants={itemVariants}>
                  <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle>{app.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {app.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-foreground">
                          Technologies
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {app.technologies.map((tech) => (
                            <Badge key={tech} variant="secondary">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-foreground">
                          Deployment
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {app.deployment}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid gap-6 md:grid-cols-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">
                  100%
                </CardTitle>
                <CardDescription>Self-Hosted</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">
                  7
                </CardTitle>
                <CardDescription>Core Services</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">
                  Git
                </CardTitle>
                <CardDescription>Auto-Deploy on Push</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">
                  24/7
                </CardTitle>
                <CardDescription>Uptime Monitoring</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
