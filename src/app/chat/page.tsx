"use client";

import { motion } from "framer-motion";
import { ChatInterface } from "@/components/sections/ChatInterface";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function ChatPage() {
  const reducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0 : 0.5,
      },
    },
  };

  return (
    <div data-testid="chat-page" className="min-h-screen bg-background py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
              Ask Me Anything
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Chat with an AI assistant trained on my experience, projects, and
              engineering philosophy. Ask about my work, technical skills, or
              approach to software development.
            </p>
          </motion.div>

          {/* Chat Interface */}
          <motion.div variants={itemVariants}>
            <ChatInterface />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
