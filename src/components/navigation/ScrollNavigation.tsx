"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ScrollNavigationProps {
  sections: string[];
}

/**
 * ScrollNavigation - Floating action button for section navigation
 * Provides smooth scroll-to-next-section functionality
 */
export function ScrollNavigation({ sections }: ScrollNavigationProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      // Find which section is currently in view
      const sectionElements = sections.map((id) =>
        document.getElementById(id),
      );

      let foundSection = 0;
      sectionElements.forEach((element, index) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          // Section is considered "current" if its top is within viewport
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            foundSection = index;
          }
        }
      });

      setCurrentSection(foundSection);

      // Hide FAB when at last section
      setIsVisible(foundSection < sections.length - 1);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToNextSection = () => {
    if (currentSection < sections.length - 1) {
      const nextSection = document.getElementById(sections[currentSection + 1]);
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
        >
          <Button
            size="lg"
            variant="default"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={scrollToNextSection}
            aria-label="Scroll to next section"
          >
            <motion.div
              animate={{
                y: reducedMotion ? 0 : [0, 4, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <ChevronDown className="h-6 w-6" />
            </motion.div>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
