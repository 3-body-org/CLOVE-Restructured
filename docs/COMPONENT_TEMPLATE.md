# Component Documentation Template

> **How to use this template:**
> - Copy this file to your component’s directory as `README.md`.
> - Fill in each section with details specific to your component.
> - Keep documentation up to date as the component evolves.

---

## 1. Overview

**Component Name:** `ComponentName`

**Purpose:**
Briefly describe what this component does, its primary use case, and where it fits in the UI.

---

## 2. When to Use
- List scenarios where this component is the best choice.
- E.g., “Use `Button` for all primary and secondary actions.”

## 3. When Not to Use
- List scenarios where another component or pattern is preferred.
- E.g., “Don’t use `Button` for navigation—use `Link` instead.”

---

## 4. Usage

```jsx
import ComponentName from 'components/ComponentName';

<ComponentName 
  prop1="value1"
  prop2={value2}
  onChange={handleChange}
/>
```

### Example
```jsx
<Button variant="primary" onClick={handleClick} disabled={isLoading}>
  Submit
</Button>
```

---

## 5. Props

| Name         | Type      | Default   | Required | Description                          |
|--------------|-----------|-----------|----------|--------------------------------------|
| `prop1`      | string    | —         | Yes      | Description of prop1                 |
| `prop2`      | number    | `0`       | No       | Description of prop2                 |
| `onChange`   | function  | —         | No       | Callback when value changes          |

> **Tip:** Use JSDoc in your code for prop documentation:
```jsx
/**
 * @param {string} prop1 - Description
 * @param {number} [prop2=0] - Description
 * @param {function} [onChange] - Description
 */
```

---

## 6. Design Tokens (Theming)
- List all CSS variables and design tokens used by this component.
- E.g., `--button-bg`, `--button-text`, `--border-radius`.
- Reference [THEMING.md](./THEMING.md) for global tokens.

---

## 7. Accessibility
- [ ] Keyboard accessible (tab, enter, space, etc.)
- [ ] Screen reader support (ARIA roles/labels)
- [ ] Sufficient color contrast
- [ ] Focus indicators visible
- [ ] Descriptive alt text for images/icons

**Example:**
> The `Button` uses `role="button"` and supports `aria-disabled` for accessibility.

---

## 8. Testing
- Unit tests in `ComponentName.test.jsx` using React Testing Library
- Minimum coverage: 80%
- Test all states (default, disabled, loading, etc.)

**Example:**
```jsx
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('renders with correct label', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

---

## 9. Example Stories (Storybook)
- Stories in `ComponentName.stories.jsx`
- Cover all variants, edge cases, and accessibility scenarios

**Example:**
```jsx
export const Primary = () => <Button variant="primary">Primary</Button>;
export const Disabled = () => <Button disabled>Disabled</Button>;
```

---

## 10. Best Practices & Gotchas
- Keep components pure and stateless where possible
- Use prop-types or TypeScript for type safety
- Avoid side effects in render
- Document any known limitations or browser quirks

---

## 11. Migration/Deprecation
- Note any breaking changes, migration steps, or deprecation plans.
- E.g., “`propX` will be removed in v2.0. Use `propY` instead.”

---

## 12. Related Patterns & Components
- List related components, design patterns, or guidelines.
- E.g., [ButtonGroup](../ButtonGroup/README.md), [IconButton](../IconButton/README.md), [ARIA Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

---

## 13. Contributor Checklist
- [ ] All props documented
- [ ] Accessibility reviewed
- [ ] Theming tested
- [ ] Tests written and passing
- [ ] Stories cover all use cases
- [ ] README is up to date
