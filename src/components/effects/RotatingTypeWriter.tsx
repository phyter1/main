"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface RotatingTypeWriterProps {
  words: string[];
  prefix?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

/**
 * RotatingTypeWriter - Cycles through words with typewriter effect
 * Types out each word, pauses, then deletes and moves to next
 */
export function RotatingTypeWriter({
  words,
  prefix = "",
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  className = "",
}: RotatingTypeWriterProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // If reduced motion, just show the first word
    if (reducedMotion) {
      setDisplayText(words[0]);
      return;
    }

    const currentWord = words[currentWordIndex];

    if (!isDeleting) {
      // Typing phase
      if (displayText.length < currentWord.length) {
        const timeout = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      }
      // Word complete, pause then start deleting
      const pauseTimeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimeout);
    }

    // Deleting phase
    if (displayText.length > 0) {
      const timeout = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1));
      }, deletingSpeed);
      return () => clearTimeout(timeout);
    }

    // Deletion complete, move to random next word (avoiding current)
    setIsDeleting(false);
    setCurrentWordIndex((prev) => {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * words.length);
      } while (nextIndex === prev && words.length > 1);
      return nextIndex;
    });
  }, [
    displayText,
    isDeleting,
    currentWordIndex,
    words,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    reducedMotion,
  ]);

  // Parse the display text to highlight the technology name
  const renderText = () => {
    const text = prefix + displayText;
    // Match pattern: "[Proficiency] in [Technology]"
    const match = text.match(/^(Expert|Proficient|Familiar)\s+in\s+(.+)$/);

    if (match) {
      const [, proficiency, technology] = match;
      return (
        <>
          <span className="text-muted-foreground">{proficiency} in </span>
          <span className="text-primary">{technology}</span>
        </>
      );
    }

    // Fallback: highlight everything after prefix
    return (
      <>
        {prefix}
        <span className="text-primary">{displayText}</span>
      </>
    );
  };

  return (
    <span className={`font-mono ${className}`}>
      {renderText()}
      <span className="inline-block animate-[blink_1s_step-end_infinite]">
        _
      </span>
    </span>
  );
}
