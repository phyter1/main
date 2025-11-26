"use client";

import { motion } from "framer-motion";
import { Cloud, Database, Globe, Lock, Server, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const infrastructureComponents = [
  {
    id: "compute",
    title: "Compute & Containers",
    icon: Server,
    description:
      "Scalable compute resources using Docker containers and AWS ECS/Lambda",
    technologies: ["Docker", "AWS ECS", "AWS Lambda", "EC2"],
    highlights: [
      "Auto-scaling container orchestration",
      "Serverless functions for event processing",
      "Blue-green deployments",
    ],
  },
  {
    id: "database",
    title: "Data Layer",
    icon: Database,
    description: "Multi-tier data architecture with caching and replication",
    technologies: ["PostgreSQL", "Redis", "S3", "RDS"],
    highlights: [
      "Read replicas for high availability",
      "Redis caching for sub-10ms response times",
      "Automated backups and point-in-time recovery",
    ],
  },
  {
    id: "networking",
    title: "Networking & CDN",
    icon: Globe,
    description: "Global content delivery and traffic routing",
    technologies: ["CloudFront", "Route 53", "VPC", "ALB"],
    highlights: [
      "Edge caching for static assets",
      "Geographic load balancing",
      "DDoS protection and WAF",
    ],
  },
  {
    id: "security",
    title: "Security & Compliance",
    icon: Lock,
    description: "Multi-layer security architecture and compliance controls",
    technologies: ["IAM", "KMS", "Secrets Manager", "CloudTrail"],
    highlights: [
      "Encryption at rest and in transit",
      "HIPAA-compliant infrastructure",
      "Comprehensive audit logging",
    ],
  },
  {
    id: "monitoring",
    title: "Observability",
    icon: Zap,
    description: "Real-time monitoring and alerting infrastructure",
    technologies: ["CloudWatch", "X-Ray", "AWS Config"],
    highlights: [
      "Custom metrics and dashboards",
      "Distributed tracing",
      "Automated incident response",
    ],
  },
  {
    id: "iac",
    title: "Infrastructure as Code",
    icon: Cloud,
    description: "Automated provisioning and configuration management",
    technologies: ["Terraform", "GitHub Actions", "AWS CDK"],
    highlights: [
      "Version-controlled infrastructure",
      "Automated deployments via CI/CD",
      "Multi-environment management",
    ],
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
              Cloud architecture and infrastructure automation for scalable,
              secure, and highly available systems.
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
                <h3 className="font-semibold text-foreground">Scalability</h3>
                <p className="text-sm text-muted-foreground">
                  Auto-scaling infrastructure that grows with demand while
                  optimizing costs.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Reliability</h3>
                <p className="text-sm text-muted-foreground">
                  Multi-AZ deployments with automated failover and 99.9%+ uptime
                  SLA.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Security</h3>
                <p className="text-sm text-muted-foreground">
                  Defense-in-depth security with encryption, IAM, and compliance
                  controls.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Infrastructure Components */}
          <motion.div
            variants={containerVariants}
            className="grid gap-6 md:grid-cols-2"
          >
            {infrastructureComponents.map((component) => {
              const Icon = component.icon;
              return (
                <motion.div key={component.id} variants={itemVariants}>
                  <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle>{component.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {component.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Technologies */}
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-foreground">
                          Technologies
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {component.technologies.map((tech) => (
                            <Badge key={tech} variant="secondary">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Highlights */}
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-foreground">
                          Key Features
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {component.highlights.map((highlight) => (
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
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid gap-6 md:grid-cols-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">
                  99.9%
                </CardTitle>
                <CardDescription>Uptime SLA</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">
                  &lt;10ms
                </CardTitle>
                <CardDescription>Cache Response Time</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">
                  1M+
                </CardTitle>
                <CardDescription>Daily Transactions</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">
                  100%
                </CardTitle>
                <CardDescription>IaC Coverage</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
