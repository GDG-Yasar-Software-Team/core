# Button Component

Material 3 styled button component with multiple variants, sizes, and colors.

## Usage

```tsx
import { Button } from '@/components/common';

// Filled button (default)
<Button variant="filled">Click me</Button>

// Outlined button
<Button variant="outlined">Click me</Button>

// Text button
<Button variant="text">Click me</Button>

// Different sizes
<Button variant="filled" size="small">Small</Button>
<Button variant="filled" size="medium">Medium</Button>
<Button variant="filled" size="large">Large</Button>

// Different colors
<Button variant="filled" color="primary">Primary</Button>
<Button variant="filled" color="secondary">Secondary</Button>

// Disabled state
<Button variant="filled" disabled>Disabled</Button>

// Full width
<Button variant="filled" fullWidth>Full Width</Button>

// With click handler
<Button variant="filled" onClick={() => console.log('Clicked!')}>
  Click me
</Button>

// With aria-label for accessibility
<Button variant="filled" ariaLabel="Submit form">
  Submit
</Button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'filled' \| 'outlined' \| 'text'` | Required | Button style variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `color` | `'primary' \| 'secondary'` | `'primary'` | Button color theme |
| `disabled` | `boolean` | `false` | Disable button interaction |
| `fullWidth` | `boolean` | `false` | Make button full width |
| `onClick` | `() => void` | `undefined` | Click event handler |
| `children` | `React.ReactNode` | Required | Button content |
| `ariaLabel` | `string` | `undefined` | Accessibility label |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |

## Material 3 Specifications

- **Border Radius**: 20px (full pill shape)
- **Elevation**: Level 1 for filled buttons
- **Hover States**: Elevation increase and color changes
- **Focus Indicators**: 2px blue outline with 2px offset
- **Typography**: Material 3 label typography scale

## Accessibility

- Uses semantic `<button>` element
- Supports keyboard navigation (Tab, Enter, Space)
- Provides visible focus indicators
- Supports `aria-label` for screen readers
- Disabled state prevents interaction

## Requirements Validated

- **7.1**: Material 3 design principles
- **7.5**: Visual feedback for interactive elements
- **10.2**: Reusable Button component with TypeScript interface
