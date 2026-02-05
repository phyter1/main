"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

// Lazy initialize the client to avoid build-time errors
let convexClient: ConvexReactClient | undefined;

function getConvexClient(): ConvexReactClient {
  if (!convexClient) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error(
        "NEXT_PUBLIC_CONVEX_URL is not set. Please configure Convex environment variables.",
      );
    }
    convexClient = new ConvexReactClient(url);
  }
  return convexClient;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Only instantiate client when actually rendering (not during build)
  const client = typeof window !== "undefined" ? getConvexClient() : null;

  if (!client) {
    // During SSR/build, just render children without Convex provider
    return <>{children}</>;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
