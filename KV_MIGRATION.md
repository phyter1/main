# Vercel KV Migration Guide

This guide walks you through migrating admin data storage from file-based to Vercel KV (Redis).

## Why Vercel KV?

- **Production-ready**: Works seamlessly with Vercel serverless deployments
- **No file system**: Edge runtime compatible (no `fs` module needed)
- **Redis-based**: Fast, reliable key-value storage
- **Persistent**: Data survives deployments and server restarts

## Prerequisites

1. A Vercel account (free tier works)
2. Your project deployed on Vercel (or local development)

## Step 1: Create Vercel KV Database

1. Go to https://vercel.com/dashboard/stores
2. Click "Create Database"
3. Select "KV" (Redis-compatible key-value store)
4. Choose a name (e.g., `phyter-admin-kv`)
5. Select your region
6. Click "Create"

## Step 2: Get Environment Variables

After creating the KV database:

1. Go to the "Settings" tab of your KV database
2. Click "Copy Snippet" or ".env.local" tab
3. You'll see three environment variables:
   ```bash
   KV_REST_API_URL="https://..."
   KV_REST_API_TOKEN="..."
   KV_REST_API_READ_ONLY_TOKEN="..."
   ```

## Step 3: Add to .env.local

Add the three KV environment variables to your `.env.local` file:

```bash
# Vercel KV (Redis) - For admin data storage
KV_REST_API_URL=https://your-kv-url.upstash.io
KV_REST_API_TOKEN=your_token_here
KV_REST_API_READ_ONLY_TOKEN=your_read_only_token_here
```

## Step 4: Migrate Existing Data

If you have existing prompt data in `.admin/prompts/`, migrate it to KV:

```bash
bun run scripts/migrate-to-kv.ts
```

This will:
- Read all existing prompt versions from `.admin/prompts/`
- Upload them to Vercel KV
- Preserve all metadata (active status, timestamps, etc.)

## Step 5: Verify Migration

1. Restart your development server: `bun dev`
2. Log in to the admin panel
3. Go to the History tab
4. Verify your prompt versions are visible

## Step 6: Clean Up (Optional)

After verifying the migration worked, you can safely delete the old file-based storage:

```bash
rm -rf .admin/prompts/
```

The `.admin` directory and `KV_MIGRATION.md` can remain for reference.

## Troubleshooting

### "Failed to connect to KV"

- Verify all three KV environment variables are set correctly in `.env.local`
- Ensure there are no extra spaces or quotes around the values
- Restart your development server after adding env vars

### "No prompts found after migration"

- Check that the migration script ran successfully (no errors)
- Verify KV credentials are correct
- Try initializing default prompts: `bun run scripts/init-prompts.ts`

### "Rate limit exceeded"

- Vercel KV free tier has rate limits
- Wait a moment and try again
- Consider upgrading your KV plan for higher limits

## What Gets Stored in KV?

- **Prompt Versions**: All prompt versions with metadata
- **Test Cases**: Test cases you create in the Test Suite
- **Test Results**: Results from test runs
- **Active Prompts**: Which prompt version is currently active for each agent

## Local Development

KV works in local development! The REST API approach means you can:
- Develop locally with production data
- Share KV instance across team members
- Test prod-like behavior without deploying

## Production Deployment

When you deploy to Vercel:

1. Link your KV database to your project
2. Vercel automatically injects the KV environment variables
3. No additional configuration needed!

Alternatively, manually add the KV environment variables in your Vercel project settings:
- Go to Project Settings > Environment Variables
- Add the three KV variables
- Redeploy

## Further Reading

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [@vercel/kv Package Docs](https://vercel.com/docs/storage/vercel-kv/using-kv)
