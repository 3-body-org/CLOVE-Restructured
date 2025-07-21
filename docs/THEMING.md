# Theming Guide

This guide sets the standard for theming in the CLOVE frontend. It covers how to add and maintain themes, use CSS variables, ensure accessibility, and troubleshoot common issues. All contributors should follow these conventions.

---

## 1. Theme Architecture
- Each theme is defined in its own SCSS module (e.g., `spaceTheme.module.scss`)
- Theme variables use CSS custom properties (e.g., `--primary-color`)
- Theme content (headings, CTAs, etc.) is in `features/mydeck/content/themeContent.js`
- Theme switching is managed by the `useTheme` hook and `ThemeProvider`

---

## 2. Design Tokens
- All theme variables are design tokens (e.g., `--primary-color`, `--border-radius`)
- Tokens should be semantic, not color-specific (e.g., `--success-bg` not `--green-bg`)
- Document all tokens in this file and in each theme SCSS
- Reference [THEMING.md](./THEMING.md) for the full token list

**Common Design Tokens:**

| Token                | Purpose                        |
|----------------------|--------------------------------|
| `--primary-color`    | Main brand/action color        |
| `--background`       | Page background color          |
| `--text-primary`     | Main text color                |
| `--card-bg`          | Card background color          |
| `--border-radius`    | Standard border radius         |

---

## 3. Adding a New Theme
1. **Create a new SCSS module:**
   - Copy an existing theme file (e.g., `spaceTheme.module.scss`)
   - Update variable values for your new theme
   - Use semantic variable names (see above)
2. **Add theme content:**
   - Add a new object to `themeContent.js` with headings, CTAs, etc.
3. **Register the theme:**
   - Add your theme to the theme switcher logic in `ThemeProvider.jsx` and `useTheme.js`
   - Add a button or selector in the UI if needed
4. **Test:**
   - Check all UI states, accessibility, and responsiveness

---

## 4. CSS Variable Conventions
- Use semantic names: `--primary-color`, `--background`, `--text-primary`, etc.
- Group variables by purpose (colors, spacing, borders, etc.)
- Use fallback values for robustness

**Example:**
```scss
.spaceTheme {
  --primary-color: #4cc9f0;
  --background: #0f0c29;
  --text-primary: #fff;
  --card-bg: rgba(76, 201, 240, 0.1);
}
```

---

## 5. Dark Mode & High Contrast
- Support dark mode by default; use tokens for all colors
- For high contrast, create a separate theme or add a high-contrast variant
- Test all themes with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Never use color alone to convey meaning

---

## 6. Theme Switching
- Use the `useTheme` hook to get/set the current theme
- Apply the theme class to the root container (e.g., `<div className={themeClass}>`)
- Theme content is accessed via `getThemeContent(currentTheme)`

**Example:**
```jsx
const { currentTheme, setTheme, isSpaceTheme } = useTheme();
<div className={isSpaceTheme ? styles.spaceTheme : ''}>
  {/* ... */}
</div>
```

---

## 7. Theme Testing
- Test all themes for:
  - Visual consistency
  - Accessibility (color contrast, keyboard navigation, screen reader)
  - Responsiveness
- Use Storybook or Chromatic for visual regression testing
- Document known issues in this file

---

## 8. Accessibility in Theming
- Ensure all color combinations meet [WCAG AA](https://www.w3.org/WAI/standards-guidelines/wcag/) contrast standards
- Never use color alone to convey meaning (use icons, text, or patterns)
- Test all themes with screen readers and keyboard navigation
- Use ARIA attributes for theme switchers (e.g., `aria-label="Switch to space theme"`)

---

## 9. Versioning & Migration
- All theme changes should follow [Semantic Versioning](https://semver.org/)
- Document breaking changes in this file and in release notes
- For major changes, provide a migration guide

---

## 10. Troubleshooting
- **Theme not applying:**
  - Check that the theme class is set on the root container
  - Ensure the SCSS file is imported
- **Colors not updating:**
  - Verify variable names and specificity
- **Animated backgrounds not visible:**
  - Ensure the background component is rendered and the container is transparent
- **Contrast issues:**
  - Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 11. Best Practices
- Use CSS variables for all theme-specific values
- Keep layout styles separate from theme styles
- Use semantic class and variable names
- Test all themes for visual consistency and accessibility
- Document new themes in [THEMING.md](./THEMING.md) and [CONTENT_GUIDE.md](./CONTENT_GUIDE.md)

---

## References
- [Material UI Theming](https://mui.com/material-ui/customization/theming/)
- [Shopify Polaris Theming](https://polaris.shopify.com/design/colors)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

