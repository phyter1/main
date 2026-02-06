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
 * Adapts colors based on dark mode via MutationObserver
 */
export function CursorGlow({ color, size = 600, blur = 40 }: CursorGlowProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Theme detection using MutationObserver
  useEffect(() => {
    // Check initial state
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    // Watch for dark class changes on <html> element
    const observer = new MutationObserver(() => {
      checkDarkMode();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

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

  // Use design system accent color with theme-appropriate opacity
  // Light mode: 0.06 opacity for subtle effect
  // Dark mode: 0.08 opacity for slightly brighter glow
  const effectiveColor =
    color || `oklch(from var(--accent) l c h / ${isDark ? "0.08" : "0.06"})`;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9998] transition-opacity duration-300"
      style={{
        background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, ${effectiveColor}, transparent ${blur}%)`,
      }}
      aria-hidden="true"
    />
  );
}
