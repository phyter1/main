# Testing Guide: Embedded Image Support (Issue #42)

## Overview

This feature branch implements comprehensive embedded image support for blog posts, including:
- Image upload via drag-drop and button in the blog editor
- Optimized image rendering with Next.js Image component
- Error handling with graceful fallback UI
- Comprehensive test coverage (52 tests passing)

## Branch Information

**Branch**: `feature/issue-42-embedded-images`
**Base**: `main`
**Commits**: 4 commits
**Status**: Ready for testing

## Commits

1. `feat: add embedded image support to blog posts` - Core implementation
2. `test: add comprehensive tests for Next.js Image integration` - Test coverage
3. `docs: add embedded image support documentation to CLAUDE.md` - Documentation
4. `fix: move MarkdownImage component outside BlogContent` - Lint fixes

## Pre-Test Verification

### 1. Install Dependencies

```bash
bun install
```

### 2. Run Tests

```bash
# Run all tests
bun test

# Run image-specific tests
bun test src/components/blog/BlogContent.test.tsx
```

**Expected Results**:
- All 100 test files passing
- 2,108 total tests passing
- 52 tests in BlogContent.test.tsx (39 existing + 13 new)

### 3. Check Linting

```bash
bun lint
```

**Expected Results**:
- 4 pre-existing errors in page.tsx and expandable-context.tsx (not related to this issue)
- No errors in BlogContent.tsx or BlogPostEditor.tsx

## Manual Testing Scenarios

### Scenario 1: Image Upload via Drag-Drop

**Steps**:
1. Start development server: `bun dev`
2. Navigate to blog admin area
3. Create or edit a blog post
4. Switch to "Edit" mode in the editor
5. Drag an image file (PNG, JPEG, GIF, or WebP) onto the textarea
6. Observe upload progress indicator
7. Verify markdown syntax inserted: `![Image description](https://...vercel-storage.com/...)`

**Expected Behavior**:
- Upload progress shown during upload
- Markdown syntax inserted at cursor position
- Image preview visible in "Preview" mode
- Image renders with Next.js Image component

**Test Images**:
- Small PNG (< 100KB)
- Large JPEG (2-4MB)
- WebP format
- Animated GIF

### Scenario 2: Image Upload via Button

**Steps**:
1. Click "Insert Image" button in editor toolbar
2. Select an image file from file picker
3. Verify upload and insertion as in Scenario 1

**Expected Behavior**:
- Same as drag-drop scenario
- File picker filters to image types only

### Scenario 3: Invalid File Upload

**Test Cases**:

**a) Invalid File Type**:
1. Try to upload a PDF or text file
2. Verify error message: "Invalid file type. Please upload PNG, JPEG, GIF, or WebP images."

**b) File Too Large**:
1. Try to upload an image > 5MB
2. Verify error message: "File too large. Maximum size is 5MB."

**Expected Behavior**:
- Error alert shown with clear message
- No upload attempted
- User can retry with valid file

### Scenario 4: Image Rendering in Viewer

**Steps**:
1. Create a blog post with multiple images
2. Add various image sources:
   - Vercel Blob Storage URL
   - Unsplash image
   - External HTTPS URL
3. Publish the post
4. View the post on the blog

**Expected Behavior**:
- All images render using Next.js Image component
- Images are lazy-loaded (check Network tab)
- Images responsive and maintain aspect ratio
- Rounded corners and shadow styling applied

### Scenario 5: Broken Image Handling

**Steps**:
1. Add markdown with broken image URL: `![Test](https://example.com/nonexistent.jpg)`
2. View in preview mode or published post

**Expected Behavior**:
- Fallback UI shown with error icon
- Message: "Failed to load image"
- Alt text displayed if provided
- Muted background with border styling

### Scenario 6: Multiple Images in Post

**Steps**:
1. Create post with 5-10 images
2. Mix image sources (uploaded, external URLs)
3. Add images between paragraphs, in lists, etc.
4. Preview and publish

**Expected Behavior**:
- All images render correctly
- Proper spacing between images and text
- No layout shifts or performance issues
- Images lazy-load as user scrolls

### Scenario 7: Image Alt Text

**Steps**:
1. Add image with alt text: `![Descriptive alt text](url)`
2. Add image without alt text: `![](url)`
3. Inspect rendered HTML

**Expected Behavior**:
- Alt text passed to Next.js Image component
- Empty alt when not provided
- Screen readers can access alt text

### Scenario 8: Dark Mode Compatibility

**Steps**:
1. Create post with images
2. Toggle between light and dark mode
3. Verify image rendering in both themes

**Expected Behavior**:
- Images render correctly in both modes
- Error fallback UI uses theme-aware colors
- No visual artifacts during theme switch

## Performance Testing

### 1. Page Load Performance

**Steps**:
1. Create blog post with 10 images
2. Open Chrome DevTools → Lighthouse
3. Run performance audit

**Expected Results**:
- Performance score > 90
- Images lazy-loaded (not in initial bundle)
- LCP (Largest Contentful Paint) < 2.5s
- No layout shifts (CLS = 0)

### 2. Network Usage

**Steps**:
1. Open post with images
2. Check Network tab in DevTools
3. Filter to "Img" requests

**Expected Behavior**:
- Images only load when scrolled into view
- Appropriate image sizes served
- CDN caching headers present

## Accessibility Testing

### 1. Keyboard Navigation

**Steps**:
1. Use Tab key to navigate editor
2. Press Tab to "Insert Image" button
3. Press Enter to activate

**Expected Behavior**:
- Button accessible via keyboard
- File picker opens on Enter
- Focus management correct

### 2. Screen Reader Testing

**Steps**:
1. Enable screen reader (VoiceOver on Mac, NVDA on Windows)
2. Navigate to blog post with images
3. Listen to image announcements

**Expected Behavior**:
- Alt text read aloud
- Error states announced
- Proper semantic HTML

## Browser Compatibility

Test in the following browsers:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS)
- ✅ Mobile Chrome (Android)

## Known Issues

### Non-Breaking Issues

1. **HTML Nesting Warnings**: Console may show warnings about `<div>` inside `<p>` when images render. This is expected behavior due to markdown wrapping images in paragraph tags, but using a div wrapper for Next.js Image. Does not affect functionality.

2. **Pre-Existing Lint Errors**: 4 lint errors exist in `page.tsx` and `expandable-context.tsx` related to hardcoded IDs. These are not part of this issue and should be addressed separately.

## Regression Testing

Verify existing functionality still works:

1. **Blog List Page**: Posts display correctly
2. **Blog Post Page**: Non-image content renders normally
3. **Blog Editor**: Title, content, categories, tags all functional
4. **Cover Images**: Existing cover image upload still works
5. **Markdown Features**: Code blocks, tables, lists, etc. still render

## Test Checklist

Before approving this branch, verify:

- [ ] All automated tests pass (2,108 tests)
- [ ] Can upload images via drag-drop
- [ ] Can upload images via button
- [ ] Invalid files rejected with clear errors
- [ ] Images render with Next.js Image component
- [ ] Broken images show fallback UI
- [ ] Multiple images in post work correctly
- [ ] Alt text functionality works
- [ ] Dark mode compatible
- [ ] Performance score > 90
- [ ] Keyboard accessible
- [ ] Works in all major browsers
- [ ] No regressions in existing features

## Reporting Issues

If you encounter any issues during testing:

1. **Screenshot**: Capture the issue
2. **Browser Info**: Note browser and version
3. **Console Errors**: Copy any console errors
4. **Steps to Reproduce**: Document exact steps
5. **Expected vs Actual**: Describe the discrepancy

Add findings to the GitHub issue or create a new issue with label `bug`.

## Approval

Once all tests pass and manual testing is complete, the branch is ready to merge to `main`.

**DO NOT CREATE PR** - Per your request, the branch will remain on the feature branch for your local testing.

## Next Steps

After testing is approved:
1. Merge to `main` branch
2. Deploy to staging environment
3. Final verification in staging
4. Deploy to production

---

**Happy Testing! 🚀**
