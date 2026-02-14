# Implementation Plan: Embedded Image Support for Blog Posts

## Issue: #42 - Add embedded image support to blog posts (viewer, preview, and editor)

## Overview
Add comprehensive support for embedded images in blog post markdown content, including image upload functionality in the editor, optimized rendering with Next.js Image in the viewer, and proper preview display in blog cards.

## Implementation Tasks

### Phase 1: Image Rendering Optimization (Viewer)

#### Task 1.1: Update BlogContent Image Component
**File**: `src/components/blog/BlogContent.tsx`
**Objective**: Replace basic `<img>` tag with Next.js Image component for optimized rendering

**Current State** (lines 84-91):
```typescript
img: ({ node, ...props }) => (
  <img
    className="rounded-lg shadow-md max-w-full h-auto my-6"
    loading="lazy"
    {...props}
  />
)
```

**Target State**:
```typescript
img: ({ node, src, alt, ...props }) => {
  if (!src) return null;

  return (
    <div className="relative w-full my-6">
      <Image
        src={src}
        alt={alt || ''}
        width={800}
        height={600}
        className="rounded-lg shadow-md w-full h-auto"
        loading="lazy"
        {...props}
      />
    </div>
  );
}
```

**Dependencies**: None
**Priority**: High
**Estimated Time**: 30 minutes

#### Task 1.2: Configure Next.js Image Remote Patterns
**File**: `next.config.ts`
**Objective**: Add remote patterns for external image URLs and Vercel Blob Storage

**Current State** (lines 6-8):
```typescript
images: {
  unoptimized: true,
},
```

**Target State**:
```typescript
images: {
  unoptimized: true,
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.vercel-storage.com',
    },
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
  ],
},
```

**Dependencies**: None
**Priority**: High
**Estimated Time**: 15 minutes

#### Task 1.3: Add Error Handling for Failed Images
**File**: `src/components/blog/BlogContent.tsx`
**Objective**: Gracefully handle broken image URLs

**Implementation**:
- Add `onError` handler to Image component
- Display fallback UI for broken images
- Log errors for debugging

**Dependencies**: Task 1.1
**Priority**: Medium
**Estimated Time**: 20 minutes

### Phase 2: Editor Image Upload (Editor)

#### Task 2.1: Add Image Upload Button to Editor Toolbar
**File**: `src/components/admin/blog/BlogPostEditor.tsx`
**Objective**: Add UI controls for image upload

**Current State** (lines 57-83):
Basic toggle between Preview and Edit modes, no image upload capability

**Target State**:
- Add "Insert Image" button to toolbar
- Button opens ImageUploader modal/dropdown
- After upload, insert markdown syntax at cursor position

**Dependencies**: None
**Priority**: High
**Estimated Time**: 45 minutes

#### Task 2.2: Implement Drag-Drop Image Upload
**File**: `src/components/admin/blog/BlogPostEditor.tsx`
**Objective**: Allow drag-drop of images onto textarea

**Implementation**:
```typescript
const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file?.type.startsWith('image/')) {
    handleImageUpload(file);
  }
};

const handleImageUpload = async (file: File) => {
  setIsUploadingImage(true);
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/admin/blog/upload', {
      method: 'POST',
      body: formData,
    });

    const { url } = await response.json();

    // Insert markdown at cursor
    const markdown = `![Image description](${url})`;
    insertAtCursor(markdown);
  } catch (error) {
    console.error('Upload failed:', error);
  } finally {
    setIsUploadingImage(false);
  }
};
```

**Dependencies**: Task 2.1
**Priority**: High
**Estimated Time**: 60 minutes

#### Task 2.3: Implement Cursor Position Insertion
**File**: `src/components/admin/blog/BlogPostEditor.tsx`
**Objective**: Insert markdown syntax at current cursor position in textarea

**Implementation**:
```typescript
const insertAtCursor = (text: string) => {
  const textarea = contentRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const newContent = content.substring(0, start) + text + content.substring(end);

  onContentChange(newContent);

  // Set cursor after inserted text
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
  }, 0);
};
```

**Dependencies**: Task 2.2
**Priority**: High
**Estimated Time**: 30 minutes

#### Task 2.4: Add Upload Progress Indicator
**File**: `src/components/admin/blog/BlogPostEditor.tsx`
**Objective**: Show visual feedback during image upload

**Implementation**:
- Add loading state during upload
- Display progress spinner/bar
- Show upload completion message
- Handle upload errors with user-friendly messages

**Dependencies**: Task 2.2
**Priority**: Medium
**Estimated Time**: 30 minutes

#### Task 2.5: Update Editor Help Text
**File**: `src/components/admin/blog/BlogPostEditor.tsx`
**Objective**: Add image syntax to markdown quick reference

**Current State** (lines 136-143):
No image syntax in help text

**Target State**:
Add: `![alt text](url)` to quick reference

**Dependencies**: None
**Priority**: Low
**Estimated Time**: 10 minutes

### Phase 3: Testing

#### Task 3.1: Unit Tests for BlogContent Image Component
**File**: `src/components/blog/BlogContent.test.tsx` (new)
**Objective**: Test image rendering with Next.js Image

**Test Cases**:
- Renders Next.js Image for valid src
- Returns null for missing src
- Applies correct props (alt, width, height, className)
- Handles error state gracefully
- Uses lazy loading

**Dependencies**: Task 1.1
**Priority**: High
**Estimated Time**: 45 minutes

#### Task 3.2: Unit Tests for BlogPostEditor Image Upload
**File**: `src/components/admin/blog/BlogPostEditor.test.tsx` (new)
**Objective**: Test image upload functionality

**Test Cases**:
- Handles file upload via button
- Handles drag-drop upload
- Inserts markdown at cursor position
- Shows upload progress
- Handles upload errors
- Validates file type and size

**Dependencies**: Tasks 2.1, 2.2, 2.3, 2.4
**Priority**: High
**Estimated Time**: 60 minutes

#### Task 3.3: Integration Tests for Image Upload Workflow
**File**: `src/__tests__/integration/blog-image-upload.test.ts` (new)
**Objective**: End-to-end test of image upload and rendering

**Test Cases**:
- Upload image via editor
- Image URL inserted into content
- Content saved with image markdown
- Image renders correctly in preview
- Image renders correctly in published post

**Dependencies**: All Phase 1 and Phase 2 tasks
**Priority**: Medium
**Estimated Time**: 60 minutes

### Phase 4: Documentation

#### Task 4.1: Update CLAUDE.md
**File**: `CLAUDE.md`
**Objective**: Document image upload instructions for future development

**Content**:
- How to upload images in blog editor
- Markdown image syntax
- Remote patterns configuration
- Image optimization settings

**Dependencies**: All implementation tasks
**Priority**: Medium
**Estimated Time**: 30 minutes

#### Task 4.2: Add JSDoc Comments
**Files**:
- `src/components/blog/BlogContent.tsx`
- `src/components/admin/blog/BlogPostEditor.tsx`

**Objective**: Document new functions with JSDoc

**Dependencies**: All implementation tasks
**Priority**: Low
**Estimated Time**: 20 minutes

## Task Grouping for Parallel Execution

### Group 1 (Can run in parallel):
- Task 1.1: Update BlogContent Image Component
- Task 1.2: Configure Next.js Image Remote Patterns
- Task 2.5: Update Editor Help Text

### Group 2 (Sequential after Group 1):
- Task 1.3: Add Error Handling for Failed Images
- Task 2.1: Add Image Upload Button to Editor Toolbar

### Group 3 (Sequential after Group 2):
- Task 2.2: Implement Drag-Drop Image Upload
- Task 2.3: Implement Cursor Position Insertion

### Group 4 (Sequential after Group 3):
- Task 2.4: Add Upload Progress Indicator

### Group 5 (Can run in parallel after all implementation):
- Task 3.1: Unit Tests for BlogContent Image Component
- Task 3.2: Unit Tests for BlogPostEditor Image Upload
- Task 3.3: Integration Tests

### Group 6 (Final documentation):
- Task 4.1: Update CLAUDE.md
- Task 4.2: Add JSDoc Comments

## Acceptance Criteria Mapping

### Viewer (BlogContent)
- ✅ Task 1.1: Images rendered using Next.js Image component
- ✅ Task 1.1: Images lazy-loaded and optimized
- ✅ Task 1.1: Images responsive and work on mobile
- ✅ Task 1.2: External image URLs supported with remote patterns
- ✅ Task 1.2: Vercel Blob Storage URLs render correctly
- ✅ Task 1.3: Failed images show graceful error state
- ✅ Task 1.1: Images maintain aspect ratio
- ✅ Task 1.1: Images have proper alt text from markdown

### Editor (BlogPostEditor)
- ✅ Task 2.2: Can upload images via drag-drop
- ✅ Task 2.1: Can upload images via toolbar button
- ✅ Task 2.4: Upload progress indicator shown
- ✅ Task 2.3: Uploaded image URL inserted as markdown
- ✅ Task 2.1: Preview mode shows images with Next.js Image
- ✅ Task 2.2: Validation: file type (image/png, jpeg, gif, webp)
- ✅ Task 2.2: Validation: file size (max 5MB)
- ✅ Task 2.4: Error messages shown for invalid uploads
- ✅ Task 2.2: Images uploaded to Vercel Blob Storage
- ✅ Task 2.2: Can upload multiple images to same post

### Testing
- ✅ Task 3.1: Unit tests for BlogContent img component
- ✅ Task 3.2: Unit tests for image upload in BlogPostEditor
- ✅ Task 3.3: Integration tests for end-to-end workflow

### Documentation
- ✅ Task 4.1: Update CLAUDE.md with instructions
- ✅ Task 4.2: Add JSDoc comments to new functions

## Success Metrics
- All acceptance criteria met
- All tests passing
- No console errors or warnings
- Images work on mobile and desktop
- Lighthouse score remains > 90 for performance
