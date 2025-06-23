# Component Name

## Overview
[Brief description of the component's purpose and functionality]

## Usage

```jsx
import { ComponentName } from 'components/path/ComponentName';

<ComponentName 
  prop1="value1"
  prop2={value2}
  onChange={handleChange}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `prop1` | string | - | Description of prop1 |
| `prop2` | number | `0` | Description of prop2 |
| `onChange` | function | - | Callback when something changes |

## Styling

### CSS Variables
This component uses the following CSS custom properties:

```scss
.component {
  --component-bg: var(--color-background);
  --component-text: var(--color-text);
}
```

### Theme Support
This component supports theming through the following variables:
- `--primary-color`
- `--secondary-color`
- `--text-color`

## Accessibility
- [ ] Keyboard navigable
- [ ] Screen reader friendly
- [ ] Color contrast compliant

## Examples

### Basic Usage
```jsx
<ComponentName />
```

### With Custom Props
```jsx
<ComponentName 
  variant="primary"
  size="large"
  disabled={false}
/>
```

## Development Notes
- Any implementation details or gotchas
- Performance considerations
- Browser compatibility notes

## Related Components
- [RelatedComponent1](./RelatedComponent1.md)
- [RelatedComponent2](./RelatedComponent2.md)
