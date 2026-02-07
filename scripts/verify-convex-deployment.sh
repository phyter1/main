#!/usr/bin/env bash

# Convex Deployment Verification Script
# Verifies that Convex schema and functions are properly deployed
# Usage: ./scripts/verify-convex-deployment.sh

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
TOTAL_CHECKS=0

# Helper functions
print_header() {
  echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

check_pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((CHECKS_PASSED++))
  ((TOTAL_CHECKS++))
}

check_fail() {
  echo -e "${RED}✗${NC} $1"
  ((CHECKS_FAILED++))
  ((TOTAL_CHECKS++))
}

check_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Start verification
echo -e "${BLUE}"
cat << "EOF"
   ____
  / ___|___  _ ____   _______  __
 | |   / _ \| '_ \ \ / / _ \ \/ /
 | |__| (_) | | | \ V /  __/>  <
  \____\___/|_| |_|\_/ \___/_/\_\

  Deployment Verification Script
EOF
echo -e "${NC}"

print_header "1. Environment Configuration"

# Check for .env.local file
if [ -f ".env.local" ]; then
  check_pass ".env.local file exists"

  # Check for NEXT_PUBLIC_CONVEX_URL
  if grep -q "NEXT_PUBLIC_CONVEX_URL=.*convex.cloud" .env.local 2>/dev/null; then
    check_pass "NEXT_PUBLIC_CONVEX_URL is configured"
    CONVEX_URL=$(grep "NEXT_PUBLIC_CONVEX_URL=" .env.local | cut -d'=' -f2 | tr -d '"' | tr -d "'" | xargs)
    echo "   URL: $CONVEX_URL"
  else
    check_fail "NEXT_PUBLIC_CONVEX_URL not configured in .env.local"
    check_warning "Set NEXT_PUBLIC_CONVEX_URL in .env.local with your deployment URL"
  fi
else
  check_fail ".env.local file not found"
  check_warning "Copy .env.local.example to .env.local and configure NEXT_PUBLIC_CONVEX_URL"
fi

print_header "2. Convex CLI and Dependencies"

# Check Convex CLI installation
if command -v bunx &> /dev/null; then
  check_pass "Bun package runner available"

  # Check Convex version
  CONVEX_VERSION=$(bunx convex --version 2>&1 | head -n1 || echo "unknown")
  if [ "$CONVEX_VERSION" != "unknown" ]; then
    check_pass "Convex CLI installed (version: $CONVEX_VERSION)"
  else
    check_fail "Convex CLI not available"
    check_warning "Install with: bun add convex"
  fi
else
  check_fail "Bun package runner not found"
  check_warning "Install Bun from https://bun.sh"
fi

print_header "3. Convex Project Files"

# Check schema file
if [ -f "convex/schema.ts" ]; then
  check_pass "convex/schema.ts exists"

  # Verify blog tables in schema
  if grep -q "blogPosts:" convex/schema.ts && \
     grep -q "blogCategories:" convex/schema.ts && \
     grep -q "blogTags:" convex/schema.ts; then
    check_pass "Blog tables defined in schema"
  else
    check_fail "Blog tables missing from schema"
  fi

  # Verify indexes
  if grep -q "searchIndex.*search_posts" convex/schema.ts; then
    check_pass "Search index defined in schema"
  else
    check_warning "Search index not found in schema"
  fi
else
  check_fail "convex/schema.ts not found"
fi

# Check blog functions file
if [ -f "convex/blog.ts" ]; then
  check_pass "convex/blog.ts exists"

  # Verify query functions
  REQUIRED_QUERIES=("listPosts" "getPostBySlug" "getFeaturedPosts" "searchPosts" "getPostsByTag" "getCategories" "getTags")
  MISSING_QUERIES=()

  for query in "${REQUIRED_QUERIES[@]}"; do
    if grep -q "export const $query = query" convex/blog.ts; then
      : # Query found, no action needed
    else
      MISSING_QUERIES+=("$query")
    fi
  done

  if [ ${#MISSING_QUERIES[@]} -eq 0 ]; then
    check_pass "All required query functions defined (${#REQUIRED_QUERIES[@]} total)"
  else
    check_fail "Missing query functions: ${MISSING_QUERIES[*]}"
  fi

  # Verify mutation functions
  REQUIRED_MUTATIONS=("createPost" "updatePost" "publishPost" "unpublishPost" "deletePost" "incrementViewCount" "createCategory" "updateCategory" "deleteCategory" "createTag" "deleteTag" "updatePostCounts")
  MISSING_MUTATIONS=()

  for mutation in "${REQUIRED_MUTATIONS[@]}"; do
    if grep -q "export const $mutation = mutation" convex/blog.ts; then
      : # Mutation found, no action needed
    else
      MISSING_MUTATIONS+=("$mutation")
    fi
  done

  if [ ${#MISSING_MUTATIONS[@]} -eq 0 ]; then
    check_pass "All required mutation functions defined (${#REQUIRED_MUTATIONS[@]} total)"
  else
    check_fail "Missing mutation functions: ${MISSING_MUTATIONS[*]}"
  fi
else
  check_fail "convex/blog.ts not found"
fi

# Check validators file
if [ -f "convex/validators.ts" ]; then
  check_pass "convex/validators.ts exists"
else
  check_warning "convex/validators.ts not found (optional)"
fi

print_header "4. Generated Files"

# Check for _generated directory
if [ -d "convex/_generated" ]; then
  check_pass "convex/_generated directory exists"

  # Check for critical generated files
  if [ -f "convex/_generated/api.d.ts" ]; then
    check_pass "TypeScript API types generated"
  else
    check_warning "API types not generated yet (run 'bunx convex dev')"
  fi

  if [ -f "convex/_generated/server.d.ts" ]; then
    check_pass "Server types generated"
  else
    check_warning "Server types not generated yet (run 'bunx convex dev')"
  fi
else
  check_fail "convex/_generated directory not found"
  check_warning "Run 'bunx convex dev' to generate TypeScript types"
fi

print_header "5. Deployment Configuration"

# Check for convex.json (created after first deployment)
if [ -f "convex.json" ]; then
  check_pass "convex.json exists (project configured)"

  # Show team and project info
  if command -v jq &> /dev/null; then
    TEAM=$(jq -r '.team // "unknown"' convex.json)
    PROJECT=$(jq -r '.project // "unknown"' convex.json)
    echo "   Team: $TEAM"
    echo "   Project: $PROJECT"
  fi
else
  check_fail "convex.json not found"
  check_warning "Run 'bunx convex dev' to initialize Convex project"
  check_warning "This will create convex.json with your project configuration"
fi

print_header "6. Deployment Status"

# Try to get deployment status
if bunx convex env list &> /dev/null; then
  check_pass "Successfully connected to Convex deployment"

  echo ""
  echo "Environment variables configured in Convex:"
  bunx convex env list 2>/dev/null || echo "   Unable to list environment variables"
else
  check_fail "Not connected to Convex deployment"
  check_warning "Run 'bunx convex dev' to start local development deployment"
  check_warning "Or run 'bun run convex:deploy' to deploy to production"
fi

print_header "7. Package.json Scripts"

# Verify deployment scripts exist
if grep -q '"convex:dev"' package.json; then
  check_pass "convex:dev script configured"
else
  check_fail "convex:dev script missing from package.json"
fi

if grep -q '"convex:deploy"' package.json; then
  check_pass "convex:deploy script configured"
else
  check_fail "convex:deploy script missing from package.json"
fi

if grep -q '"convex:codegen"' package.json; then
  check_pass "convex:codegen script configured"
else
  check_warning "convex:codegen script missing from package.json (optional)"
fi

print_header "Summary"

echo ""
echo "Checks passed: ${GREEN}${CHECKS_PASSED}${NC}"
echo "Checks failed: ${RED}${CHECKS_FAILED}${NC}"
echo "Total checks: ${TOTAL_CHECKS}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All critical checks passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Ensure 'bunx convex dev' is running for local development"
  echo "2. Run 'bun run convex:deploy' to deploy to production"
  echo "3. Configure NEXT_PUBLIC_CONVEX_URL in Vercel environment variables"
  echo "4. Proceed to T040: Vercel deployment and final verification"
  exit 0
else
  echo -e "${YELLOW}⚠ Some checks failed${NC}"
  echo ""
  echo "Common fixes:"
  echo "1. Run 'bunx convex dev' to initialize and deploy locally"
  echo "2. Copy .env.local.example to .env.local and configure URLs"
  echo "3. Ensure all dependencies installed: bun install"
  echo "4. Check convex/schema.ts and convex/blog.ts for syntax errors"
  echo ""
  echo "See TASKS/T039-deployment-guide.md for detailed instructions"
  exit 1
fi
