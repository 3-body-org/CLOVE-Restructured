# Theming System Documentation

## Overview
The theming system allows for dynamic content and styling across different themes while maintaining a consistent layout structure. This document outlines how to use and extend the theming system.

## Table of Contents
1. [Theme Structure](#theme-structure)
2. [Adding a New Theme](#adding-a-new-theme)
3. [Using Themes in Components](#using-themes-in-components)
4. [Content Management](#content-management)
5. [Styling](#styling)
6. [Icons](#icons)

## Theme Structure

### Content Structure (`themeContent.js`)
```javascript
{
  themeName: {
    heading: "Page Title",
    subtitle: "Page Subtitle",
    story: {
      title: "Section Title",
      paragraphs: [
        "Paragraph 1 with <em>HTML</em> support",
        "Paragraph 2 with <em>HTML</em> support"
      ]
    },
    cta: {
      label: "Button Text",
      ariaLabel: "Accessible button description"
    }
  }
}
```

### Theme Files
- `spaceTheme.module.scss` - Space-themed styles
- `ruinsTheme.module.scss` - Ancient ruins theme styles
- `defaultTheme.module.scss` - Fallback theme styles

## Adding a New Theme

1. Add theme content to `themeContent.js`:
   ```javascript
   export const themeContent = {
     // ... existing themes
     newTheme: {
       heading: "New Theme",
       // ... other content
     }
   };
   ```

2. Create a new theme style file (e.g., `newTheme.module.scss`):
   ```scss
   .newTheme {
     --primary-color: #your-color;
     --bg-color: #your-bg;
     // ... other theme variables
   }
   ```

3. Update the theme context/provider to include the new theme class.

## Using Themes in Components

1. Use the `useTheme` hook to get the current theme:
   ```javascript
   const { currentTheme, isTheme } = useTheme("default");
   ```

2. Apply theme classes:
   ```jsx
   <div className={`${styles.container} ${isTheme('space') ? styles.spaceTheme : ''}`}>
     {/* Content */}
   </div>
   ```

3. Access theme content:
   ```javascript
   const themeContent = getThemeContent(currentTheme);
   // Use themeContent.heading, themeContent.story, etc.
   ```

## Content Management

All text content is managed in `themeContent.js`. Each theme can have its own version of:
- Page headings and subtitles
- Story sections with HTML support
- Call-to-action button text
- Any other theme-specific text

## Styling

### CSS Variables
Theme-specific styles use CSS custom properties for colors, fonts, and other theming:

```scss
.spaceTheme {
  --primary-color: #4cc9f0;
  --bg-color: #0f0c29;
  --text-primary: #ffffff;
  --text-secondary: #b8c2cc;
}
```

### Best Practices
1. Use CSS variables for all theme-specific values
2. Keep layout styles separate from theme styles
3. Use semantic class names that describe purpose, not appearance

## Icons

Icons are managed through the `iconMap` in `themeContent.js`:

```javascript
export const iconMap = {
  rocket: "faRocket",
  code: "faCode",
  // ... other icons
};
```

Usage in components:
```jsx
<FontAwesomeIcon icon={getIcon('rocket')} />
```

## Theme Switching

To switch themes, call the `setTheme` function from the `useTheme` hook:

```javascript
const { setTheme } = useTheme();

// Later in your component:
<button onClick={() => setTheme('space')}>Space Theme</button>
```

## Best Practices

1. **Separation of Concerns**: Keep content, styling, and logic separate
2. **Performance**: Use `useMemo` for expensive theme calculations
3. **Accessibility**: Ensure proper color contrast and ARIA labels
4. **Fallbacks**: Always provide default values for theme properties
5. **Testing**: Test all themes for visual consistency and functionality
