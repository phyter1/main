"use client";

import { useEffect, useState } from "react";

interface CursorGlowProps {
  color?: string;
  size?: number;
  blur?: number;
}

/**
 * CursorGlow - Adds a subtle glow effect that follows the cursor
 * Automatically disabled on touch devices and respects reduced motion
 */
export function CursorGlow({
  color = "rgba(0, 245, 212, 0.06)",
  size = 600,
  blur = 40,
}: CursorGlowProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Skip on touch devices
    if ("ontouchstart" in window) {
      return;
    }

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9998] transition-opacity duration-300"
      style={{
        background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, ${color}, transparent ${blur}%)`,
      }}
      aria-hidden="true"
    />
  );
}
