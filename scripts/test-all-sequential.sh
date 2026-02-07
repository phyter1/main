#!/bin/bash

# Sequential Test Runner
# Runs all tests individually to avoid concurrency issues
# Continues on failures and reports summary at the end

echo "🧪 Running all tests sequentially..."
echo ""

# Track totals
total_tests=0
total_pass=0
total_fail=0
failed_files=()

# Function to run a test file and extract results
run_test() {
  local file=$1
  local label=$2

  echo "  Testing: $label"

  # Run test and capture output
  output=$(bun test "$file" 2>&1 || true)

  # Extract pass/fail counts
  pass=$(echo "$output" | grep -oE '[0-9]+ pass' | grep -oE '[0-9]+' | head -1 || echo "0")
  fail=$(echo "$output" | grep -oE '[0-9]+ fail' | grep -oE '[0-9]+' | head -1 || echo "0")

  total_pass=$((total_pass + pass))
  total_fail=$((total_fail + fail))
  total_tests=$((total_tests + pass + fail))

  if [ "$fail" -gt 0 ]; then
    echo "    ⚠️  $pass pass, $fail fail"
    echo ""
    echo "    📋 Full test output:"
    echo "$output" | sed 's/^/    /'
    echo ""
    failed_files+=("$label ($fail failed)")
  elif [ "$pass" -gt 0 ]; then
    echo "    ✅ $pass pass"
  else
    echo "    ❌ No tests found or error"
    echo ""
    echo "    📋 Full output:"
    echo "$output" | sed 's/^/    /'
    echo ""
    failed_files+=("$label (error)")
  fi
}

# Library Tests
echo "📚 Library Tests"
run_test "src/lib/ai-config.test.ts" "ai-config"
run_test "src/lib/analytics.test.ts" "analytics"
run_test "src/lib/auth.test.ts" "auth"
run_test "src/lib/blog-utils.test.ts" "blog-utils"
run_test "src/lib/blog-metadata.test.ts" "blog-metadata"
run_test "src/lib/blog-sitemap.test.ts" "blog-sitemap"
run_test "src/lib/input-sanitization.test.ts" "input-sanitization"
run_test "src/lib/prompt-versioning.test.ts" "prompt-versioning"
run_test "src/lib/test-runner.test.ts" "test-runner"
echo ""

# MDX Configuration Tests
echo "📝 MDX Configuration Tests"
run_test "src/__tests__/mdx-test/mdx-config.test.tsx" "mdx-config"
echo ""

# Provider Tests
echo "🔌 Provider Tests"
run_test "src/providers/ThemeProvider.test.tsx" "ThemeProvider"
echo ""

# Hook Tests
echo "🪝 Hook Tests"
run_test "src/hooks/__tests__/useTheme.test.tsx" "useTheme"
run_test "src/hooks/__tests__/useTheme.integration.test.tsx" "useTheme integration"
echo ""

# UI Component Tests
echo "🎨 UI Component Tests"
run_test "src/components/ui/button.test.tsx" "button"
run_test "src/components/ui/chat-message.test.tsx" "chat-message"
run_test "src/components/ui/dropdown-menu.test.tsx" "dropdown-menu"
run_test "src/components/ui/expandable-context.test.tsx" "expandable-context"
run_test "src/components/ui/guardrail-feedback.test.tsx" "guardrail-feedback"
run_test "src/components/ui/typing-indicator.test.tsx" "typing-indicator"
echo ""

# Theme Component Tests
echo "🎨 Theme Component Tests"
run_test "src/components/theme/ThemeToggle.test.tsx" "ThemeToggle"
echo ""

# Effects Component Tests
echo "✨ Effects Component Tests"
run_test "src/components/effects/CursorGlow.test.tsx" "CursorGlow"
echo ""

# Section Component Tests
echo "📦 Section Component Tests"
run_test "src/components/sections/AIFeatureCards.test.tsx" "AIFeatureCards"
run_test "src/components/sections/ChatInterface.test.tsx" "ChatInterface"
run_test "src/components/sections/Hero.test.tsx" "Hero"
run_test "src/components/sections/JobFitAnalyzer.test.tsx" "JobFitAnalyzer"
run_test "src/components/sections/SkillsMatrix.test.tsx" "SkillsMatrix"
echo ""

# Admin Component Tests
echo "🔧 Admin Component Tests"
run_test "src/components/admin/PromptDiff.test.tsx" "PromptDiff"
run_test "src/components/admin/PromptEditor.test.tsx" "PromptEditor"
run_test "src/components/admin/ResumeUpdater.test.tsx" "ResumeUpdater"
run_test "src/components/admin/TestRunner.test.tsx" "TestRunner"
echo ""

# Admin Blog Component Tests
echo "📝 Admin Blog Component Tests"
run_test "src/components/admin/blog/BlogPostEditor.test.tsx" "BlogPostEditor"
run_test "src/components/admin/blog/BlogPostMetadata.test.tsx" "BlogPostMetadata"
run_test "src/components/admin/blog/BlogPostList.test.tsx" "BlogPostList"
run_test "src/components/admin/blog/CategoryManager.test.tsx" "CategoryManager"
run_test "src/components/admin/blog/ImageUploader.test.tsx" "ImageUploader"
run_test "src/components/admin/blog/MarkdownPreview.test.tsx" "MarkdownPreview"
echo ""

# Blog Component Tests
echo "📝 Blog Component Tests"
run_test "src/components/blog/BlogCard.test.tsx" "BlogCard"
run_test "src/components/blog/BlogContent.test.tsx" "BlogContent"
run_test "src/components/blog/BlogHeader.test.tsx" "BlogHeader"
run_test "src/components/blog/BlogSearch.test.tsx" "BlogSearch"
run_test "src/components/blog/BlogSidebar.test.tsx" "BlogSidebar"
run_test "src/components/blog/ShareButtons.test.tsx" "ShareButtons"
run_test "src/components/blog/TableOfContents.test.tsx" "TableOfContents"
echo ""

# Layout Component Tests
echo "🏗️ Layout Component Tests"
run_test "src/components/layout/Navigation.test.tsx" "Navigation"
echo ""

# Page Tests
echo "📄 Page Tests"
run_test "src/app/globals.test.ts" "globals.css"
run_test "src/app/page.test.tsx" "homepage"
run_test "src/app/about/page.test.tsx" "about"
run_test "src/app/chat/page.test.tsx" "chat"
run_test "src/app/fit-assessment/page.test.tsx" "fit-assessment"
run_test "src/app/principles/page.test.tsx" "principles"
run_test "src/app/projects/page.test.tsx" "projects"
run_test "src/app/sitemap.test.ts" "sitemap"
run_test "src/app/stack/page.test.tsx" "stack"
run_test "src/app/layout.test.tsx" "layout"
echo ""

# Admin Page Tests
echo "🔐 Admin Page Tests"
run_test "src/app/admin/agent-workbench/page.test.tsx" "agent-workbench/page"
run_test "src/app/admin/agent-workbench/layout.test.tsx" "agent-workbench/layout"
run_test "src/app/admin/agent-workbench/history/page.test.tsx" "agent-workbench/history"
echo ""

# Admin Blog Page Tests
echo "📝 Admin Blog Page Tests"
run_test "src/app/admin/blog/page.test.tsx" "blog dashboard"
run_test "src/app/admin/blog/layout.test.tsx" "blog layout"
run_test "src/app/admin/blog/new/page.test.tsx" "blog new post"
run_test "src/app/admin/blog/edit/[id]/page.test.tsx" "blog edit post"
run_test "src/app/admin/blog/categories/page.test.tsx" "blog categories"
echo ""

# Blog Page Tests
echo "📝 Blog Page Tests"
run_test "src/app/blog/page.test.tsx" "blog listing"
run_test "src/app/blog/[slug]/page.test.tsx" "blog post"
run_test "src/app/blog/category/[slug]/page.test.tsx" "blog category"
run_test "src/app/blog/tag/[slug]/page.test.tsx" "blog tag"
run_test "src/app/blog/__tests__/cache-config.test.ts" "blog cache config"
run_test "src/app/blog/__tests__/cache-integration.test.ts" "blog cache integration"
echo ""

# Next.js Configuration Tests
echo "⚙️  Next.js Configuration Tests"
run_test "next.config.test.ts" "next.config cache headers"
echo ""

# API Route Tests
echo "🌐 API Route Tests"
run_test "src/app/api/chat/route.test.ts" "chat API"
run_test "src/app/api/fit-assessment/route.test.ts" "fit-assessment API"
echo ""

# Blog API Route Tests
echo "📝 Blog API Route Tests"
run_test "src/app/blog/rss.xml/route.test.ts" "RSS feed API"
echo ""

# Admin API Route Tests
echo "🔐 Admin API Route Tests"
run_test "src/app/api/admin/deploy-prompt/route.test.ts" "deploy-prompt API"
run_test "src/app/api/admin/login/route.test.ts" "login API"
run_test "src/app/api/admin/prompt-history/route.test.ts" "prompt-history API"
run_test "src/app/api/admin/refine-prompt/route.test.ts" "refine-prompt API"
run_test "src/app/api/admin/test-prompt/route.test.ts" "test-prompt API"
run_test "src/app/api/admin/update-resume/route.test.ts" "update-resume API"
echo ""

# Admin Blog API Route Tests
echo "📝 Admin Blog API Route Tests"
run_test "src/app/api/admin/blog/create/route.test.ts" "blog create API"
run_test "src/app/api/admin/blog/[id]/route.test.ts" "blog update/delete API"
run_test "src/app/api/admin/blog/publish/route.test.ts" "blog publish API"
run_test "src/app/api/admin/blog/upload/route.test.ts" "blog upload API"
run_test "src/app/api/admin/blog/categories/route.test.ts" "blog categories API"
run_test "src/app/api/admin/blog/categories/[id]/route.test.ts" "blog category update/delete API"
echo ""

# Data Tests
echo "💾 Data Tests"
run_test "src/data/blog-mock.test.ts" "blog-mock"
run_test "src/data/resume.test.ts" "resume"
echo ""

# Type Tests
echo "📐 Type Tests"
run_test "src/types/blog.test.ts" "blog types"
echo ""

# Integration Tests
echo "🔗 Integration Tests"
run_test "src/app/admin/__tests__/workflows.integration.test.tsx" "workflows integration"
run_test "src/app/__tests__/guardrail-feedback.integration.test.tsx" "guardrail-feedback integration"
run_test "src/app/__tests__/ai-features-integration.test.tsx" "ai-features integration"
run_test "src/__tests__/git-hooks.integration.test.ts" "git-hooks integration"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total tests:  $total_tests"
echo "Passed:       $total_pass ✅"
echo "Failed:       $total_fail ❌"
echo ""

if [ ${#failed_files[@]} -gt 0 ]; then
  echo "Failed test files:"
  for file in "${failed_files[@]}"; do
    echo "  - $file"
  done
  echo ""
  exit 1
else
  echo "🎉 All tests passed!"
  echo ""
  exit 0
fi
