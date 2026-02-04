import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { mock } from "bun:test";
import { createElement } from "react";

// Register Happy DOM for browser APIs
GlobalRegistrator.register();

// Global mock for framer-motion to avoid animation issues in tests
mock.module("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => createElement("div", props, children),
    h1: ({ children, ...props }: any) => createElement("h1", props, children),
    h2: ({ children, ...props }: any) => createElement("h2", props, children),
    p: ({ children, ...props }: any) => createElement("p", props, children),
    section: ({ children, ...props }: any) =>
      createElement("section", props, children),
    article: ({ children, ...props }: any) =>
      createElement("article", props, children),
    button: ({ children, ...props }: any) =>
      createElement("button", { ...props, type: "button" }, children),
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({
    start: () => Promise.resolve(),
    stop: () => {},
  }),
}));

// Global mock for useReducedMotion hook
mock.module("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

// Note: Individual test files should mock AI SDK functions (streamText, generateObject)
// as needed since they have different behaviors per test
