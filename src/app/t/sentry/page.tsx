"use client";

import { Button } from "@/components/ui/button";

export default function SentryTestPage() {
  return (
    <div className="p-4">
      <h1>Sentry Test Page</h1>
      <p>This page is used to test Sentry integration.</p>
      <Button
        onClick={() => {
          // This will cause a test error to be sent to Sentry
          throw new Error("Test Sentry Error from Sentry Test Page");
        }}
      >
        Trigger Test Error
      </Button>
      <Button
        onClick={() => {
          console.log("This is a test log for Sentry.");
        }}
      >
        Trigger Test Log
      </Button>
    </div>
  );
}
