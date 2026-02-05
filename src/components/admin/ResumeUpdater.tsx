"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Principle } from "@/data/principles";
import type { Project } from "@/data/projects";
import type { ExperienceEntry, Resume, Skill } from "@/data/resume";

interface ProposedChanges {
  section: "experience" | "skills" | "projects" | "principles";
  operation: "add" | "update" | "delete";
  data: Record<string, unknown>;
}

interface UpdateResponse {
  proposedChanges: ProposedChanges;
  preview: string;
  affectedSections: string[];
}

interface ResumeUpdaterProps {
  initialResume: Resume;
}

export function ResumeUpdater({ initialResume }: ResumeUpdaterProps) {
  const [currentResume] = useState<Resume>(initialResume);
  const [input, setInput] = useState("");
  const [proposedChanges, setProposedChanges] = useState<UpdateResponse | null>(
    null,
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "experience" | "skills" | "projects" | "principles"
  >("experience");

  const handleRequestUpdate = async () => {
    if (!input.trim()) {
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/update-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updateRequest: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to request update");
      }

      const data = (await response.json()) as UpdateResponse;
      setProposedChanges(data);
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request update");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApply = async () => {
    // TODO: Implement apply changes functionality
    // This would require an API endpoint to persist changes
    console.log("Apply changes:", proposedChanges);
    setProposedChanges(null);
  };

  const handleCancel = () => {
    setProposedChanges(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Resume Update Assistant Input */}
      <Card>
        <CardHeader>
          <CardTitle>Resume Update Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="E.g., 'Add project X using technologies Y, Z' or 'Add React Native to skills'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-24"
            />
            <Button
              onClick={handleRequestUpdate}
              disabled={!input.trim() || isUpdating}
            >
              {isUpdating ? "Processing..." : "Request Update"}
            </Button>
            {error && (
              <div className="text-destructive text-sm mt-2">{error}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Proposed Changes Display */}
      {proposedChanges && (
        <Card>
          <CardHeader>
            <CardTitle>Proposed Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Section:{" "}
                  </span>
                  <Badge variant="outline">
                    {proposedChanges.proposedChanges.section}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Operation:{" "}
                  </span>
                  <Badge variant="outline">
                    {proposedChanges.proposedChanges.operation}
                  </Badge>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md">
                  {proposedChanges.preview}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleApply}>Apply Changes</Button>
                <Button onClick={handleCancel} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Resume Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Resume Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simple tabs implementation using buttons */}
            <div className="flex gap-2 border-b pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("experience")}
                className={`px-4 py-2 rounded-t-md transition-colors ${
                  activeTab === "experience"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                Experience
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("skills")}
                className={`px-4 py-2 rounded-t-md transition-colors ${
                  activeTab === "skills"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                Skills
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className={`px-4 py-2 rounded-t-md transition-colors ${
                  activeTab === "projects"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                Projects
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("principles")}
                className={`px-4 py-2 rounded-t-md transition-colors ${
                  activeTab === "principles"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                Principles
              </button>
            </div>

            {/* Tab Content */}
            <div className="pt-4">
              {activeTab === "experience" && (
                <div className="space-y-4">
                  {currentResume.experience.map((exp) => (
                    <ExperienceCard key={exp.title} experience={exp} />
                  ))}
                </div>
              )}

              {activeTab === "skills" && (
                <div className="space-y-4">
                  <SkillsDisplay skills={currentResume.skills} />
                </div>
              )}

              {activeTab === "projects" && (
                <div className="space-y-4">
                  {currentResume.projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}

              {activeTab === "principles" && (
                <div className="space-y-4">
                  {currentResume.principles.map((principle) => (
                    <PrincipleCard key={principle.id} principle={principle} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Experience Card Component
function ExperienceCard({ experience }: { experience: ExperienceEntry }) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="font-semibold text-lg">{experience.title}</div>
      <div className="text-muted-foreground">
        {experience.organization} | {experience.period}
      </div>
      <div className="text-sm">{experience.description}</div>
      {experience.highlights && experience.highlights.length > 0 && (
        <div className="space-y-1">
          <div className="text-sm font-medium">Highlights:</div>
          <ul className="list-disc list-inside space-y-1">
            {experience.highlights.map((highlight) => (
              <li key={highlight} className="text-sm">
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}
      {experience.technologies && experience.technologies.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {experience.technologies.map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Skills Display Component
function SkillsDisplay({ skills }: { skills: Resume["skills"] }) {
  return (
    <div className="space-y-4">
      {Object.entries(skills).map(([category, skillList]) => (
        <div key={category}>
          {skillList.length > 0 && (
            <div className="space-y-2">
              <div className="font-semibold capitalize">{category}</div>
              <div className="flex gap-2 flex-wrap">
                {skillList.map((skill: Skill) => (
                  <SkillBadge key={skill.name} skill={skill} />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Skill Badge Component
function SkillBadge({ skill }: { skill: Skill }) {
  return (
    <div className="border rounded-lg px-3 py-2 space-y-1">
      <div className="font-medium">{skill.name}</div>
      <div className="text-xs text-muted-foreground capitalize">
        {skill.proficiency}
      </div>
    </div>
  );
}

// Project Card Component
function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="font-semibold text-lg">{project.title}</div>
      <div className="text-sm">{project.description}</div>
      <div className="flex gap-2 flex-wrap">
        {project.technologies.map((tech) => (
          <Badge key={tech} variant="secondary">
            {tech}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Badge variant="outline">{project.status}</Badge>
        {project.featured && <Badge variant="default">Featured</Badge>}
      </div>
    </div>
  );
}

// Principle Card Component
function PrincipleCard({ principle }: { principle: Principle }) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="font-semibold text-lg">{principle.title}</div>
      <div className="text-sm">{principle.description}</div>
      <div className="text-sm text-muted-foreground">
        <span className="font-medium">Application: </span>
        {principle.application}
      </div>
    </div>
  );
}
