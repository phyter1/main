/**
 * Prompt History Page
 * Timeline view of all prompt changes with version metadata and actions
 */

"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PromptDiff } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PromptVersion } from "@/lib/prompt-versioning";

type AgentFilter = "all" | "chat" | "fit-assessment";

interface DiffModalState {
  isOpen: boolean;
  version: PromptVersion | null;
  previousVersion: PromptVersion | null;
}

export default function PromptHistoryPage() {
  const router = useRouter();

  // State management
  const [filterAgent, setFilterAgent] = useState<AgentFilter>("all");
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diffModal, setDiffModal] = useState<DiffModalState>({
    isOpen: false,
    version: null,
    previousVersion: null,
  });

  const fetchVersions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query string based on filter
      const queryParams = new URLSearchParams();
      if (filterAgent !== "all") {
        queryParams.set("agentType", filterAgent);
      }

      const url = `/api/admin/prompt-history${
        filterAgent !== "all" ? `?${queryParams.toString()}` : ""
      }`;

      // For "all" filter, we need to fetch both agent types separately
      if (filterAgent === "all") {
        const [chatResponse, fitResponse] = await Promise.all([
          fetch("/api/admin/prompt-history?agentType=chat"),
          fetch("/api/admin/prompt-history?agentType=fit-assessment"),
        ]);

        if (!chatResponse.ok || !fitResponse.ok) {
          throw new Error("Failed to fetch prompt history");
        }

        const chatData = await chatResponse.json();
        const fitData = await fitResponse.json();

        const allVersions = [
          ...(chatData.versions || []),
          ...(fitData.versions || []),
        ];

        // Sort by createdAt timestamp (newest first)
        allVersions.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setVersions(allVersions);
      } else {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch prompt history");
        }

        const data = await response.json();
        setVersions(data.versions || []);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load prompt history",
      );
      console.error("Error fetching versions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filterAgent]);

  // Fetch versions when filter changes
  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const viewDiff = (version: PromptVersion) => {
    // Find the previous version for the same agent type
    const sameAgentVersions = versions.filter(
      (v) => v.agentType === version.agentType,
    );
    const currentIndex = sameAgentVersions.findIndex(
      (v) => v.id === version.id,
    );
    const previousVersion =
      currentIndex < sameAgentVersions.length - 1
        ? sameAgentVersions[currentIndex + 1]
        : null;

    setDiffModal({
      isOpen: true,
      version,
      previousVersion,
    });
  };

  const testVersion = (version: PromptVersion) => {
    // Navigate to test suite with this version's data
    router.push(
      `/admin/agent-workbench/test?agentType=${version.agentType}&versionId=${version.id}`,
    );
  };

  const rollback = async (version: PromptVersion) => {
    try {
      const response = await fetch("/api/admin/deploy-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentType: version.agentType,
          versionId: version.id,
          message: `Rollback to version: ${version.description}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Rollback failed");
      }

      // Refresh version list after successful rollback
      await fetchVersions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rollback failed");
      console.error("Error rolling back version:", err);
    }
  };

  const closeDiffModal = () => {
    setDiffModal({
      isOpen: false,
      version: null,
      previousVersion: null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with filter */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Prompt History</h1>
        <Select
          value={filterAgent}
          onValueChange={(value) => setFilterAgent(value as AgentFilter)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            <SelectItem value="chat">Chat Agent</SelectItem>
            <SelectItem value="fit-assessment">Job Fit Agent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-lg border bg-destructive/10 p-4 text-destructive">
          Error: {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center text-muted-foreground py-12">
          Loading prompt history...
        </div>
      )}

      {/* Versions list */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {versions.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No prompt versions found.
            </div>
          ) : (
            versions.map((version) => (
              <Card key={version.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle>
                        {version.agentType === "chat"
                          ? "Chat Agent"
                          : "Job Fit Agent"}{" "}
                        - {version.description}
                      </CardTitle>
                      <CardDescription>
                        {new Date(version.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    {version.isActive && <Badge>Active</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>Author: {version.author}</span>
                    <span>Tokens: {version.tokenCount}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => viewDiff(version)} variant="default">
                      View Diff
                    </Button>
                    <Button
                      onClick={() => testVersion(version)}
                      variant="outline"
                    >
                      Test Version
                    </Button>
                    {!version.isActive && (
                      <Button
                        onClick={() => rollback(version)}
                        variant="secondary"
                      >
                        Rollback
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Diff modal */}
      <Dialog open={diffModal.isOpen} onOpenChange={closeDiffModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {diffModal.version?.agentType === "chat"
                ? "Chat Agent"
                : "Job Fit Agent"}{" "}
              - {diffModal.version?.description}
            </DialogTitle>
            <DialogDescription>
              Comparing with{" "}
              {diffModal.previousVersion
                ? `previous version: ${diffModal.previousVersion.description}`
                : "initial version (no changes)"}
            </DialogDescription>
          </DialogHeader>
          {diffModal.version && (
            <PromptDiff
              original={diffModal.previousVersion?.prompt || ""}
              proposed={diffModal.version.prompt}
              originalTokenCount={diffModal.previousVersion?.tokenCount}
              proposedTokenCount={diffModal.version.tokenCount}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
