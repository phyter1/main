<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Phytertek portfolio site. PostHog is initialized client-side via `instrumentation-client.ts` (alongside the existing Sentry setup), using a reverse proxy through `/ingest` to avoid ad blockers. A server-side PostHog client (`src/lib/posthog-server.ts`) handles tracking from API routes. Ten events are instrumented across eight files, covering AI feature engagement, blog content consumption, and admin publishing activity.

| Event | Description | File |
|---|---|---|
| `ai_chat_message_sent` | User sends a message to the AI chat assistant | `src/components/sections/ChatInterface.tsx` |
| `fit_assessment_started` | User submits a job description to start a fit assessment | `src/components/sections/JobFitAnalyzer.tsx` |
| `fit_assessment_completed` | User receives a fit assessment result with fit level | `src/components/sections/JobFitAnalyzer.tsx` |
| `blog_post_shared` | User shares a blog post via social media, link, or email | `src/components/blog/ShareButtons.tsx` |
| `blog_post_viewed` | User views a specific blog post | `src/app/blog/[slug]/BlogPostClient.tsx` |
| `blog_category_filtered` | User filters blog posts by category | `src/app/blog/BlogListingClient.tsx` |
| `admin_login` | Admin successfully authenticates (server-side) | `src/app/api/admin/login/route.ts` |
| `blog_post_published` | Admin publishes a blog post (server-side) | `src/app/api/admin/blog/publish/route.ts` |
| `ai_chat_request_processed` | Server processes a chat completion request (server-side) | `src/app/api/chat/route.ts` |
| `fit_assessment_request_processed` | Server processes a fit assessment request (server-side) | `src/app/api/fit-assessment/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/467308/dashboard/1704226)
- [AI Feature Usage (wizard)](https://us.posthog.com/project/467308/insights/Gaxq3c00)
- [Fit Assessment Conversion Funnel (wizard)](https://us.posthog.com/project/467308/insights/giWbff4q)
- [Blog Post Shares by Platform (wizard)](https://us.posthog.com/project/467308/insights/5zQLXbI5)
- [Blog Post Views (wizard)](https://us.posthog.com/project/467308/insights/gdAG5pxO)
- [Fit Assessment Result Distribution (wizard)](https://us.posthog.com/project/467308/insights/pAjOUbk1)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
