"use client";

import { motion, type Variants } from "framer-motion";
import { MessageSquare, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AIFeatureCardsProps {
  /**
   * Optional motion variants for animation
   * Used to coordinate animations with parent containers
   */
  variants?: Variants;
}

/**
 * AIFeatureCards - Showcases AI-powered features (Chat Assistant and Job Fit Analyzer)
 *
 * Displays two feature cards in a responsive grid layout with:
 * - Icon and title
 * - Compelling description
 * - CTA button to each feature
 * - Hover effects and animations
 *
 * Designed to be integrated into the Hero section to prominently feature AI capabilities.
 */
export function AIFeatureCards({ variants }: AIFeatureCardsProps) {
  return (
    <motion.div
      variants={variants}
      className="mx-auto mt-12 grid max-w-3xl gap-4 md:grid-cols-2"
    >
      {/* Chat Assistant Card */}
      <Card className="group flex flex-col transition-all hover:border-accent-vibrant/60 hover:shadow-xl hover:shadow-accent-vibrant/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-accent-vibrant group-hover:scale-110 transition-transform duration-200" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <p className="mb-6 flex-1 text-sm text-muted-foreground">
            Chat with an AI trained on my experience, projects, and engineering
            philosophy. Ask about my background, technical expertise, or
            approach to problem-solving.
          </p>
          <Button variant="vibrant" size="sm" className="w-full" asChild>
            <a href="/chat">Start Conversation</a>
          </Button>
        </CardContent>
      </Card>

      {/* Job Fit Analyzer Card */}
      <Card className="group flex flex-col transition-all hover:border-accent-vibrant/60 hover:shadow-xl hover:shadow-accent-vibrant/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-accent-vibrant group-hover:scale-110 transition-transform duration-200" />
            Job Fit Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <p className="mb-6 flex-1 text-sm text-muted-foreground">
            Get an honest AI-powered assessment of how my skills and experience
            align with your role. Paste a job description and receive detailed
            fit analysis.
          </p>
          <Button variant="vibrant" size="sm" className="w-full" asChild>
            <a href="/fit-assessment">Analyze Fit</a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
