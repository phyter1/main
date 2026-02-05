"use client";

import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/ui/chat-message";
import { GuardrailFeedback } from "@/components/ui/guardrail-feedback";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { trackChatMessage } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { GuardrailViolation } from "@/types/guardrails";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<GuardrailViolation | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        '[data-slot="scroll-area-viewport"]',
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  });

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Track chat message interaction (privacy-respecting - no content tracked)
    trackChatMessage();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData: GuardrailViolation = await response
          .json()
          .catch(() => ({ error: `HTTP error! status: ${response.status}` }));

        // Store the full GuardrailViolation object
        setError(errorData);

        // Don't throw - let the error state handle display
        setIsLoading(false);
        return;
      }

      // Handle streaming response (plain text, not SSE format)
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let assistantMessage = "";
      const assistantMessageId = `assistant-${Date.now()}`;

      // Add initial empty assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      // Read plain text stream chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode chunk as plain text
        const chunk = decoder.decode(value, { stream: true });

        // Hide loading indicator as soon as first chunk arrives
        if (assistantMessage === "") {
          setIsLoading(false);
        }

        assistantMessage += chunk;

        // Update the assistant message with accumulated content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: assistantMessage }
              : msg,
          ),
        );
      }
    } catch (err) {
      console.error("Chat error:", err);

      // Create a simple error violation for network/unexpected errors
      const errorViolation: GuardrailViolation = {
        error:
          err instanceof Error
            ? err.message
            : "An error occurred. Please try again.",
      };

      setError(errorViolation);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section
      className={cn(
        "flex flex-col h-[600px] max-w-4xl mx-auto border rounded-lg bg-background shadow-lg",
        className,
      )}
    >
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-center">
                  Start a conversation by typing a message below.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-muted max-w-[80%]">
                <TypingIndicator size="sm" showLabel={false} />
                <span className="text-sm text-muted-foreground">
                  Ryan is typing...
                </span>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        {error && (
          <div className="mb-3">
            <GuardrailFeedback
              violation={error}
              repositoryUrl="https://github.com/phyter1/main"
            />
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            disabled={isLoading}
            className="min-h-[60px] max-h-[200px] resize-none"
            aria-label="Chat message input"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon-lg"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
