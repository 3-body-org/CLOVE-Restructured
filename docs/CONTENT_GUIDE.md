# Content & UX Writing Guide

> **Purpose:**
> This guide sets the standard for all user-facing content in the frontend. It covers tone, structure, accessibility, localization, review workflow, and terminology. Follow these conventions for all new and updated content.

---

## 1. Glossary
- **CTA:** Call to Action (e.g., button text)
- **Tooltip:** Short, contextual help text
- **Error Message:** Text shown when something goes wrong
- **Placeholder:** Example or hint text in an input
- **ARIA:** Accessible Rich Internet Applications (WAI-ARIA)

---

## 2. Content Types
- **Headings:** Short, descriptive, and scannable
- **CTAs:** Clear, action-oriented (e.g., “Save changes”)
- **Tooltips:** Brief, helpful, never essential for task completion
- **Error Messages:** Human, actionable, never blame the user
- **Empty States:** Encouraging, explain what to do next

---

## 3. Voice & Tone
- **Voice:** Friendly, clear, and professional
- **Tone:** Encouraging, direct, and inclusive

| Situation         | Do (✅)                        | Don’t (❌)                  |
|------------------|-------------------------------|----------------------------|
| Success          | “You’re all set!”             | “Operation completed.”     |
| Error            | “Something went wrong. Try again.” | “Error occurred.”         |
| CTA              | “Continue Learning”           | “OK”                       |
| Tooltip          | “Learn more about topics”      | “?”                        |

---

## 4. File Organization
- All user-facing text must be in content files, not hardcoded in components
- Theme content: `features/mydeck/content/themeContent.js`
- Subtopic content: `features/mydeck/content/subtopicContent.js`
- Use keys for all text to enable future localization

---

## 5. Accessibility (a11y)
- All interactive elements must have descriptive `aria-label`s
- Use semantic HTML (e.g., `<button>`, `<nav>`, `<main>`, `<h1>`)
- Ensure color contrast meets [WCAG AA](https://www.w3.org/WAI/standards-guidelines/wcag/) standards
- Avoid using color alone to convey meaning
- Test with screen readers (e.g., NVDA, VoiceOver)

---

## 6. Localization (i18n)
- Never hardcode user-facing text in JSX
- Use content keys for all strings
- Avoid concatenating strings (use full sentences)
- Plan for pluralization and gender where relevant
- Support right-to-left (RTL) languages in layout

---

## 7. Content Review Workflow
1. Make content changes in a feature branch
2. Request review from a team member (preferably with UX or writing experience)
3. Test all themes and responsive breakpoints
4. Verify accessibility (screen reader, keyboard nav, color contrast)
5. Merge only after review and testing

---

## 8. Content Linting/Review Tools
- [Alex.js](https://alexjs.com/) for inclusive language
- [Grammarly](https://grammarly.com/) for grammar and clarity
- [axe DevTools](https://www.deque.com/axe/devtools/) for accessibility
- [Polaris Content Linter](https://github.com/Shopify/polaris-linter) (if using Shopify Polaris)

---

## 9. Best Practices & Do/Don’t

**Do:**
- Use short, scannable paragraphs
- Use lists for steps or options
- Use positive, action-oriented language
- Provide context for actions (e.g., “Save changes” instead of “Save”)
- Use consistent terminology across the app

**Don’t:**
- Use technical jargon unless necessary
- Use ambiguous labels (e.g., “OK”, “Submit”)
- Overload the UI with too much text
- Use humor or idioms that may not translate well

---

## 10. Example: Adding a New CTA

**Step 1:** Add to `themeContent.js`:
```js
cta: { label: "Continue Learning", ariaLabel: "Continue to the next lesson" }
```

**Step 2:** Use in component:
```jsx
<button aria-label={cta.ariaLabel}>{cta.label}</button>
```

---

## 11. References
- [Shopify Polaris Content Guidelines](https://polaris.shopify.com/content/grammar-and-mechanics)
- [Google Material Writing](https://m3.material.io/foundations/communication/guidelines)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Microsoft Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/welcome/)
