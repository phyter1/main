"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  // Filter to only h2 and h3 headings
  const filteredHeadings = headings.filter(
    (heading) => heading.level === 2 || heading.level === 3,
  );

  // Set up intersection observer for active section tracking
  useEffect(() => {
    // Don't set up observer if not enough headings
    if (filteredHeadings.length < 2) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        rootMargin: "-100px 0px -66%",
        threshold: 0,
      },
    );

    // Observe all heading elements
    for (const heading of filteredHeadings) {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [filteredHeadings]);

  // Handle smooth scroll to section
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      // Update URL hash
      window.history.pushState(null, "", `#${id}`);
    }
  };

  // Don't render if fewer than 2 headings (short post)
  if (filteredHeadings.length < 2) {
    return null;
  }

  return (
    <nav
      aria-label="Table of contents"
      className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto"
    >
      <div className="rounded-lg border bg-card p-4">
        <h2 className="text-sm font-semibold mb-3 text-foreground">
          On this page
        </h2>
        <ul className="space-y-2 text-sm">
          {filteredHeadings.map((heading) => (
            <li
              key={heading.id}
              className={cn(heading.level === 3 && "ml-4", "transition-colors")}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={cn(
                  "block py-1 hover:text-primary transition-colors",
                  activeId === heading.id
                    ? "text-primary font-medium"
                    : "text-muted-foreground",
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
