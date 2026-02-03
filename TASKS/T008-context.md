# T008: Update navigation and sitemap - Implementation Context

## Task Overview
Add the principles page to site navigation and sitemap for discoverability and SEO.

## Technical Requirements

### Navigation Update
**File**: `/Users/ryanlowe/code/assistant/workspace/phyter1-main/src/components/layout/Navigation.tsx`
- Add principles entry to `navItems` array
- Maintain consistent ordering with other pages
- Follow existing pattern: `{ label: "Principles", href: "/principles" }`

**Current Navigation Order**:
1. Home
2. About
3. Stack
4. Projects
5. Infrastructure

**Recommended Position**: Insert "Principles" between "About" and "Stack" as it relates to personal philosophy similar to About page.

### Sitemap Update
**File**: `/Users/ryanlowe/code/assistant/workspace/phyter1-main/src/app/sitemap.ts`
- Add principles entry to sitemap array
- Use consistent metadata pattern
- Set appropriate priority and change frequency

**Existing Sitemap Entries**:
- `/` - priority: 1.0, changeFrequency: monthly
- `/about` - priority: 0.9, changeFrequency: monthly
- `/projects` - priority: 0.8, changeFrequency: weekly
- `/stack` - priority: 0.7, changeFrequency: monthly
- `/infrastructure` - priority: 0.7, changeFrequency: monthly

**Recommended Configuration**:
- URL: `${baseUrl}/principles`
- Priority: 0.8 (similar importance to projects, core content page)
- Change Frequency: monthly (content updates infrequently)
- lastModified: currentDate

## Implementation Pattern

### Navigation Component Structure
```typescript
const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Principles", href: "/principles" }, // Add here
  { label: "Stack", href: "/stack" },
  { label: "Projects", href: "/projects" },
  { label: "Infrastructure", href: "/infrastructure" },
];
```

### Sitemap Entry Structure
```typescript
{
  url: `${baseUrl}/principles`,
  lastModified: currentDate,
  changeFrequency: "monthly",
  priority: 0.8,
}
```

## Integration Points

### Existing Components
- Navigation component already handles dynamic active states
- Mobile menu automatically includes new nav items
- No additional styling needed

### Sitemap Generation
- Next.js automatically generates sitemap.xml from this file
- No additional configuration needed
- Dynamic export ensures current date on each build

## Validation Steps

1. **Build Verification**
   ```bash
   cd /Users/ryanlowe/code/assistant/workspace/phyter1-main
   bun run build
   ```

2. **Dev Server Testing**
   ```bash
   cd /Users/ryanlowe/code/assistant/workspace/phyter1-main
   bun dev
   ```
   - Navigate to http://localhost:3000
   - Verify "Principles" appears in navigation
   - Click link and verify navigation works
   - Check active state on principles page

3. **Sitemap Verification**
   - Access http://localhost:3000/sitemap.xml
   - Verify principles entry appears
   - Check metadata is correct

## Quality Standards

### Code Quality
- Follow existing code patterns exactly
- Maintain consistent formatting (2-space indentation)
- No linting errors
- TypeScript type safety maintained

### User Experience
- Navigation order feels natural
- Link text is clear and concise
- Active state works correctly
- Mobile experience consistent

### SEO Considerations
- Sitemap priority reflects page importance
- Change frequency matches update pattern
- Metadata supports crawler indexing
- URL structure is clean and readable

## Dependencies
- Depends on T007 (principles page implementation)
- Principles page must exist at `/principles` route
- Navigation and sitemap components must be functional

## Potential Issues

### Common Mistakes to Avoid
- Don't add duplicate entries
- Maintain array ordering consistency
- Use correct href format (leading slash)
- Match existing priority scale
- Don't forget mobile menu gets updated automatically

### Testing Considerations
- Test on both desktop and mobile viewports
- Verify active state styling
- Check browser console for errors
- Validate sitemap.xml generation

## Documentation Updates
No additional documentation needed beyond TASKS files.

## Related Files
- `/Users/ryanlowe/code/assistant/workspace/phyter1-main/src/components/layout/Navigation.tsx`
- `/Users/ryanlowe/code/assistant/workspace/phyter1-main/src/app/sitemap.ts`
- `/Users/ryanlowe/code/assistant/workspace/phyter1-main/src/app/principles/page.tsx` (dependency)
- `/Users/ryanlowe/code/assistant/workspace/phyter1-main/src/app/principles/layout.tsx` (dependency)
