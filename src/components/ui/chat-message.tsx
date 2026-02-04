import { cn } from "@/lib/utils";

export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  enableMarkdown?: boolean;
  className?: string;
}

function ChatMessage({
  role,
  content,
  timestamp,
  enableMarkdown = false,
  className,
}: ChatMessageProps) {
  const isUser = role === "user";

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <article
      data-slot="chat-message"
      data-role={role}
      className={cn(
        "flex flex-col gap-2 px-4 py-3 rounded-lg transition-colors",
        isUser
          ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
          : "bg-muted text-foreground mr-auto max-w-[80%]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs font-medium opacity-70">
          {isUser ? "You" : "Ryan"}
        </span>
        {timestamp && (
          <time
            className="text-xs opacity-60"
            dateTime={timestamp.toISOString()}
          >
            {formatTimestamp(timestamp)}
          </time>
        )}
      </div>
      <div
        className={cn(
          "text-sm whitespace-pre-wrap break-words",
          enableMarkdown && "prose prose-sm dark:prose-invert max-w-none",
        )}
      >
        {content}
      </div>
    </article>
  );
}

export { ChatMessage };
