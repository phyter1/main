/**
 * PromptEditor Component
 * Conversational interface for AI-powered prompt refinement
 */

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PromptDiff } from "./PromptDiff";

interface PromptEditorProps {
  agentType: "chat" | "fit-assessment";
  initialPrompt: string;
}

interface RefinementMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface RefinementResponse {
  proposedPrompt: string;
  diffSummary: string;
  tokenCountOriginal: number;
  tokenCountProposed: number;
  changes: string[];
}

export function PromptEditor({ agentType, initialPrompt }: PromptEditorProps) {
  const [currentPrompt, setCurrentPrompt] = useState(initialPrompt);
  const [proposedPrompt, setProposedPrompt] = useState<string | null>(null);
  const [proposedTokenCount, setProposedTokenCount] = useState<number | null>(
    null,
  );
  const [currentTokenCount, setCurrentTokenCount] = useState<number | null>(
    null,
  );
  const [refinementHistory, setRefinementHistory] = useState<
    RefinementMessage[]
  >([]);
  const [input, setInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefine = async () => {
    if (!input.trim()) return;

    setIsRefining(true);
    setError(null);

    // Add user message to history
    const userMessage: RefinementMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setRefinementHistory((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/admin/refine-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentType,
          currentPrompt,
          refinementRequest: input,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to refine prompt");
      }

      const data: RefinementResponse = await response.json();

      // Add assistant response to history
      const assistantMessage: RefinementMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.diffSummary,
        timestamp: new Date(),
      };

      setRefinementHistory((prev) => [...prev, assistantMessage]);

      // Set proposed prompt and token counts
      setProposedPrompt(data.proposedPrompt);
      setCurrentTokenCount(data.tokenCountOriginal);
      setProposedTokenCount(data.tokenCountProposed);

      // Clear input
      setInput("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);

      // Add error message to history
      const errorMsg: RefinementMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };

      setRefinementHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsRefining(false);
    }
  };

  const handleApply = () => {
    if (proposedPrompt) {
      setCurrentPrompt(proposedPrompt);
      setProposedPrompt(null);
      setCurrentTokenCount(null);
      setProposedTokenCount(null);

      // Add confirmation message to history
      const confirmMessage: RefinementMessage = {
        id: `confirm-${Date.now()}`,
        role: "assistant",
        content: "Changes applied successfully!",
        timestamp: new Date(),
      };

      setRefinementHistory((prev) => [...prev, confirmMessage]);
    }
  };

  const handleRevert = () => {
    setProposedPrompt(null);
    setCurrentTokenCount(null);
    setProposedTokenCount(null);

    // Add revert message to history
    const revertMessage: RefinementMessage = {
      id: `revert-${Date.now()}`,
      role: "assistant",
      content: "Changes reverted.",
      timestamp: new Date(),
    };

    setRefinementHistory((prev) => [...prev, revertMessage]);
  };

  const handleTest = () => {
    // TODO: Navigate to test suite with proposed prompt
    // This would typically use Next.js router to navigate to a test page
    console.log("Testing proposed prompt:", proposedPrompt);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Current Prompt and Refinement Chat */}
      <div className="space-y-4">
        {/* Agent Type Badge */}
        <div>
          <Badge variant="outline">Agent: {agentType}</Badge>
        </div>

        {/* Current Prompt */}
        <Card>
          <CardHeader>
            <CardTitle>Current Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-muted/50 rounded-md p-3 max-h-64 overflow-y-auto font-mono">
              {currentPrompt || "No prompt configured"}
            </pre>
          </CardContent>
        </Card>

        {/* Refinement Chat */}
        <Card>
          <CardHeader>
            <CardTitle>Refinement Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Chat History */}
              {refinementHistory.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {refinementHistory.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-md text-sm ${
                        message.role === "user"
                          ? "bg-primary/10 ml-4"
                          : "bg-muted/50 mr-4"
                      }`}
                    >
                      <div className="font-semibold text-xs mb-1">
                        {message.role === "user" ? "You" : "Assistant"}
                      </div>
                      <div>{message.content}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  Error: {error}
                </div>
              )}

              {/* Input Area */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Describe how to refine the prompt..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isRefining}
                  className="min-h-24"
                />
                <Button
                  onClick={handleRefine}
                  disabled={isRefining || !input.trim()}
                  className="w-full"
                >
                  {isRefining ? "Refining..." : "Refine Prompt"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Diff View and Actions */}
      <div className="space-y-4">
        {proposedPrompt ? (
          <>
            {/* Diff View */}
            <PromptDiff
              original={currentPrompt}
              proposed={proposedPrompt}
              originalTokenCount={currentTokenCount ?? undefined}
              proposedTokenCount={proposedTokenCount ?? undefined}
            />

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Button
                    onClick={handleTest}
                    variant="outline"
                    className="flex-1"
                  >
                    Test Changes
                  </Button>
                  <Button
                    onClick={handleApply}
                    variant="default"
                    className="flex-1"
                  >
                    Apply Changes
                  </Button>
                  <Button
                    onClick={handleRevert}
                    variant="outline"
                    className="flex-1"
                  >
                    Revert
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground text-sm">
                <p>No proposed changes yet.</p>
                <p className="mt-2">
                  Use the refinement chat to request prompt improvements.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
