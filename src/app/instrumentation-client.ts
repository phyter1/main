import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://16c51d85fa7b4363aa99d057ea394a48@bugsink.phytertek.com:8000/1",
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  release: "portfolio@1.0.0",
  enableLogs: true,
  integrations: [
    // Replay may only be enabled for the client-side
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({
      // Additional SDK configuration goes in here, for example:
      colorScheme: "system",
    }),
  ],
  tracesSampleRate: 0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
