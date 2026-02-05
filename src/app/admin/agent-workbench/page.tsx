/**
 * Admin Agent Workbench - Main Page
 * Tab-based interface for managing AI agents, prompts, and resume data
 */

import Link from "next/link";
import { PromptEditor } from "@/components/admin/PromptEditor";
import { ResumeUpdater } from "@/components/admin/ResumeUpdater";
import TestRunner from "@/components/admin/TestRunner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resume } from "@/data/resume";
import { getActiveVersion } from "@/lib/prompt-versioning";

/**
 * Agent Workbench page component
 * Server component that loads active prompts and renders tab interface
 */
export default async function AgentWorkbenchPage() {
  // Load active prompts for both agent types
  const chatPrompt = await getActiveVersion("chat");
  const fitAssessmentPrompt = await getActiveVersion("fit-assessment");

  // Extract prompt text or use empty string as fallback
  const chatPromptText = chatPrompt?.prompt || "";
  const fitAssessmentPromptText = fitAssessmentPrompt?.prompt || "";

  return (
    <div className="space-y-6">
      {/* Header with title and admin badge */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI Agent Workbench</h1>
        <Badge variant="outline">Admin Mode</Badge>
      </div>

      {/* Tab-based navigation */}
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="chat">Chat Agent</TabsTrigger>
          <TabsTrigger value="fit-assessment">Job Fit Agent</TabsTrigger>
          <TabsTrigger value="resume">Resume Data</TabsTrigger>
          <TabsTrigger value="tests">Test Suite</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Chat Agent Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-2">Chat Agent</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Manage the conversational AI agent that interacts with portfolio
              visitors
            </p>
            <PromptEditor agentType="chat" initialPrompt={chatPromptText} />
          </div>
        </TabsContent>

        {/* Job Fit Agent Tab */}
        <TabsContent value="fit-assessment" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-2">Job Fit Agent</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Manage the AI agent that assesses job fit based on resume data
            </p>
            <PromptEditor
              agentType="fit-assessment"
              initialPrompt={fitAssessmentPromptText}
            />
          </div>
        </TabsContent>

        {/* Resume Data Tab */}
        <TabsContent value="resume" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-2">Resume Data</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Update resume information, experience, skills, and projects
            </p>
            <ResumeUpdater initialResume={resume} />
          </div>
        </TabsContent>

        {/* Test Suite Tab */}
        <TabsContent value="tests" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-2">Test Suite</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Run test cases against AI prompts to validate responses
            </p>
            <TestRunner agentType="chat" promptText={chatPromptText} />
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="rounded-lg border bg-card p-6 text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Version History</h2>
            <p className="text-muted-foreground mb-6">
              View and manage prompt version history across all agent types
            </p>
            <Link
              href="/admin/agent-workbench/history"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              View Full History →
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
