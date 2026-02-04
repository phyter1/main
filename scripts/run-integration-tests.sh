#!/bin/bash

# Integration Test Runner
# Runs real API tests against the local dev server

set -e

echo "🚀 Starting integration test run..."
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "❌ Error: Development server is not running"
  echo ""
  echo "Please start the server first:"
  echo "  bun dev"
  echo ""
  exit 1
fi

echo "✅ Server is running"
echo ""

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ Error: OPENAI_API_KEY environment variable is not set"
  echo ""
  echo "Please set your OpenAI API key:"
  echo "  export OPENAI_API_KEY='your-key-here'"
  echo ""
  echo "Or add it to .env.local"
  exit 1
fi

echo "✅ API key is configured"
echo ""
echo "🧪 Running chat integration tests..."
echo ""

INTEGRATION_TEST=true bun test src/app/api/chat/route.integration.test.ts

echo ""
echo "🧪 Running fit assessment integration tests..."
echo ""

INTEGRATION_TEST=true bun test src/app/api/fit-assessment/route.integration.test.ts

echo ""
echo "✅ Integration tests complete!"
echo ""
echo "📊 Review the test output above to assess:"
echo "   - Response quality and relevance"
echo "   - Adherence to scope and guardrails"
echo "   - Assessment accuracy and honesty"
echo "   - Recommendation usefulness"
echo ""
echo "💡 Use findings to iterate on system prompts in:"
echo "   - src/app/api/chat/route.ts"
echo "   - src/app/api/fit-assessment/route.ts"
echo ""
