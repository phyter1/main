import { resolve } from "node:path";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { config } from "dotenv";

// Load test environment variables from .env.test
config({ path: resolve(process.cwd(), ".env.test") });

// Explicitly register Happy DOM globals (required for Vitest v4+)
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

// Mock Convex client to prevent real database connections in tests
// In-memory session storage for tests
const _sessionStorage = new Map<string, { expiresAt: number }>();

// Note: vi.mock() calls moved to individual test files
// Vitest setup files run in a different context where vi.mock is not available

// Note: Individual test files should mock AI SDK functions (streamText, generateObject)
// as needed since they have different behaviors per test

// Setup window mocks if window is available (in happy-dom environment)
if (typeof window !== "undefined") {
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
}
