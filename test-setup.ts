import { mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { createElement } from "react";

// Register Happy DOM for browser APIs
GlobalRegistrator.register();

// Add matchMedia mock for responsive design tests
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  });
}

// Global mock for framer-motion to avoid animation issues in tests
mock.module("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => createElement("div", props, children),
    h1: ({ children, ...props }: any) => createElement("h1", props, children),
    h2: ({ children, ...props }: any) => createElement("h2", props, children),
    p: ({ children, ...props }: any) => createElement("p", props, children),
    span: ({ children, ...props }: any) =>
      createElement("span", props, children),
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

// Mock window.matchMedia (needed for components that use media queries)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Mock window.addEventListener and removeEventListener for scroll events
const eventListeners: Record<string, Function[]> = {};

Object.defineProperty(window, "addEventListener", {
  writable: true,
  value: (event: string, handler: Function) => {
    if (!eventListeners[event]) {
      eventListeners[event] = [];
    }
    eventListeners[event].push(handler);
  },
});

Object.defineProperty(window, "removeEventListener", {
  writable: true,
  value: (event: string, handler: Function) => {
    if (eventListeners[event]) {
      eventListeners[event] = eventListeners[event].filter(
        (h) => h !== handler,
      );
    }
  },
});

// Mock window.scrollY
Object.defineProperty(window, "scrollY", {
  writable: true,
  value: 0,
});
