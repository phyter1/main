# T008: Update navigation and sitemap - Test Criteria

## Task ID
T008

## Test Strategy
Integration testing for navigation and sitemap to ensure principles page is accessible and properly indexed.

## Test Categories

### 1. Navigation Integration Tests
**Test File**: Manual verification + Navigation component inspection
- [ ] Navigation component includes "Principles" link
- [ ] Principles link points to correct route `/principles`
- [ ] Navigation maintains consistent ordering with other links
- [ ] Mobile navigation includes principles link
- [ ] Active state works correctly on principles page

### 2. Sitemap Configuration Tests
**Test File**: Sitemap generation validation
- [ ] Sitemap includes `/principles` route
- [ ] Proper metadata: url, lastModified, changeFrequency, priority
- [ ] Priority set appropriately relative to other pages
- [ ] Change frequency configured correctly
- [ ] Sitemap generates without errors

### 3. SEO Metadata Tests
**Test File**: Metadata configuration validation
- [ ] Principles page layout has proper metadata
- [ ] Title follows site template pattern
- [ ] Description is SEO-optimized
- [ ] OpenGraph metadata configured
- [ ] Robots configuration allows indexing

### 4. Link Functionality Tests
**Manual Testing**
- [ ] Clicking principles link navigates to correct page
- [ ] Browser back/forward works correctly
- [ ] Direct URL access `/principles` works
- [ ] Link renders correctly on all screen sizes
- [ ] No console errors when navigating

## Acceptance Criteria Validation

### Navigation Accessibility
- Navigation component array includes principles entry
- Link renders in both desktop and mobile views
- Active state styling works correctly

### Sitemap Entry
- Sitemap function returns principles URL
- Metadata matches project standards
- Entry positioned appropriately in array

### Metadata for Crawlers
- Proper changeFrequency value
- Priority reflects page importance
- lastModified uses current date

### Link Testing
- Manual verification of navigation
- No broken links
- Proper routing behavior

## Performance Considerations
- No impact on navigation performance
- Sitemap generation remains fast
- No additional bundle size concerns

## Test Execution Plan
1. Add navigation entry and verify component renders
2. Add sitemap entry and verify generation
3. Build application and check for errors
4. Manually test navigation in dev environment
5. Verify sitemap.xml generation
6. Test on multiple screen sizes

## Expected Outcomes
- Principles page accessible from main navigation
- Sitemap includes principles with proper metadata
- No build or runtime errors
- Seamless user experience navigating to principles
