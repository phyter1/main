"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useId, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type AgentType = "chat" | "fit-assessment";

export function DirectEditTab() {
  const agentTypeId = useId();
  const promptTextId = useId();
  const descriptionId = useId();

  const [agentType, setAgentType] = useState<AgentType>("fit-assessment");
  const [promptText, setPromptText] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleLoadCurrent = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/admin/prompt-history?agentType=${agentType}`,
      );

      if (!response.ok) {
        throw new Error("Failed to load prompt");
      }

      const data = await response.json();
      const activeVersion = data.versions.find(
        (v: { isActive: boolean; prompt: string; tokenCount: number }) =>
          v.isActive,
      );

      if (!activeVersion) {
        throw new Error("No active version found");
      }

      setPromptText(activeVersion.prompt);
      setMessage({
        type: "success",
        text: `Loaded active ${agentType} prompt (${activeVersion.tokenCount} tokens)`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to load prompt",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!promptText.trim()) {
      setMessage({ type: "error", text: "Prompt text cannot be empty" });
      return;
    }

    if (!description.trim()) {
      setMessage({
        type: "error",
        text: "Please provide a description of changes",
      });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/deploy-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType,
          prompt: promptText,
          description,
          author: "admin",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save prompt");
      }

      const result = await response.json();
      setMessage({
        type: "success",
        text: `Prompt saved successfully! Version: ${result.versionId}`,
      });
      setDescription(""); // Clear description after successful save
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save prompt",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const wordCount = promptText.trim().split(/\s+/).filter(Boolean).length;
  const estimatedTokens = Math.ceil(wordCount * 1.3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Direct Prompt Edit</h2>
        <p className="text-muted-foreground mt-1">
          Manually edit and save prompts without AI refinement
        </p>
      </div>

      {message && (
        <Alert
          variant={message.type === "error" ? "destructive" : "default"}
          className={
            message.type === "success" ? "border-success text-success" : ""
          }
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="agent-type">Agent Type</Label>
            <Select
              value={agentType}
              onValueChange={(value) => setAgentType(value as AgentType)}
            >
              <SelectTrigger id={agentTypeId}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chat">Chat Agent</SelectItem>
                <SelectItem value="fit-assessment">Job Fit Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={handleLoadCurrent} disabled={isLoading}>
              {isLoading ? "Loading..." : "Load Current Prompt"}
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor={promptTextId}>Prompt Text</Label>
          <Textarea
            id={promptTextId}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Paste or edit the full prompt text here..."
            className="font-mono text-sm min-h-[400px]"
          />
          <p className="text-sm text-muted-foreground mt-1">
            {wordCount} words, ~{estimatedTokens} tokens
          </p>
        </div>

        <div>
          <Label htmlFor={descriptionId}>Change Description</Label>
          <Input
            id={descriptionId}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of what changed..."
          />
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save as New Version"}
        </Button>
      </div>
    </div>
  );
}
