# Content Management Guide

This guide explains how to manage and update content for different themes in the application.

## File Structure
```
content/
├── themeContent.js    # Theme-specific content
└── CONTENT_GUIDE.md   # This file
```

## Theme Content Structure

### 1. Theme Object
Each theme should have the following structure:

```javascript
{
  heading: "Page Title",
  subtitle: "Page Subtitle",
  story: {
    title: "Section Title",
    paragraphs: [
      "First paragraph with <em>HTML</em> support",
      "Second paragraph with <em>styled text</em>"
    ]
  },
  cta: {
    label: "Button Text",
    ariaLabel: "Accessible description"
  }
}
```

### 2. Available Themes

#### Space Theme
- **File**: `spaceTheme.module.scss`
- **Purpose**: Default space exploration theme
- **Content Location**: `themeContent.space`

#### Ruins Theme
- **File**: `ruinsTheme.module.scss`
- **Purpose**: Ancient ruins/archaeology theme
- **Content Location**: `themeContent.ruins`

#### Default Theme
- **File**: `defaultTheme.module.scss`
- **Purpose**: Fallback theme
- **Content Location**: `themeContent.default`

## Adding New Content

1. **Text Content**:
   - Add or modify text in the appropriate theme object
   - Use HTML tags for basic formatting (`<em>`, `<strong>`, etc.)
   - Keep paragraphs concise and scannable

2. **Icons**:
   - Add new icons to the `iconMap` in `themeContent.js`
   - Use the exact FontAwesome icon name as the value

3. **Styling**:
   - Add new theme variables in the corresponding `.module.scss` file
   - Follow the naming convention: `--component-property-state`

## Best Practices

1. **Consistency**:
   - Maintain similar content structure across themes
   - Keep text lengths comparable between themes

2. **Accessibility**:
   - Ensure all interactive elements have proper ARIA labels
   - Maintain sufficient color contrast
   - Test with screen readers

3. **Performance**:
   - Keep images optimized
   - Use CSS for visual effects when possible
   - Lazy load non-critical assets

4. **Localization**:
   - Keep text strings separate from code
   - Avoid hardcoded text in components
   - Consider RTL languages in your layout

## Testing
After making content changes:
1. Test all themes to ensure content displays correctly
2. Verify responsive behavior
3. Check for any text overflow or layout issues
4. Test interactive elements

## Example Update

To update the space theme's heading:

```javascript
// In themeContent.js
export const themeContent = {
  space: {
    heading: "New Cosmic Title",
    // ... rest of the content
  }
};
```
