"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TypeWriterProps {
  text: string | string[];
  speed?: number;
  delay?: number;
  cursor?: boolean;
  onComplete?: () => void;
  className?: string;
}

/**
 * TypeWriter - Animates text with a typewriter effect
 * Supports single or multiple lines with configurable speed
 */
export function TypeWriter({
  text,
  speed = 50,
  delay = 0,
  cursor = true,
  onComplete,
  className = "",
}: TypeWriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // If reduced motion is preferred, show text immediately
    if (reducedMotion) {
      const fullText = Array.isArray(text) ? text.join("\n") : text;
      setDisplayText(fullText);
      setIsComplete(true);
      onComplete?.();
      return;
    }

    const fullText = Array.isArray(text) ? text.join("\n") : text;

    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < fullText.length) {
          setDisplayText(fullText.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay, onComplete, reducedMotion]);

  return (
    <span className={`font-mono ${className}`}>
      {displayText}
      {cursor && (
        <span
          className={`inline-block ${
            isComplete ? "animate-[blink_1s_step-end_infinite]" : ""
          }`}
        >
          _
        </span>
      )}
    </span>
  );
}
