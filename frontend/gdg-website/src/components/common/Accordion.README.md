# Accordion Component

A Material 3 styled accordion component for expandable FAQ sections with smooth animations and full keyboard accessibility.

## Features

- ✅ Material 3 design system styling
- ✅ Smooth expand/collapse animations using Motion
- ✅ Chevron icon rotation animation
- ✅ Keyboard accessible (Enter/Space to toggle)
- ✅ Single or multiple expansion modes
- ✅ ARIA compliant with proper attributes
- ✅ Fully typed with TypeScript

## Usage

### Basic Example

```tsx
import { Accordion } from './components/common/Accordion';

const faqItems = [
  {
    id: '1',
    question: 'What is GDG?',
    answer: 'Google Developer Groups are community groups for developers.',
  },
  {
    id: '2',
    question: 'How do I join?',
    answer: 'You can join by attending our events.',
  },
];

function FAQSection() {
  return <Accordion items={faqItems} />;
}
```

### Multiple Expansion Mode

```tsx
<Accordion items={faqItems} allowMultiple={true} />
```

## Props

### AccordionProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `AccordionItem[]` | required | Array of accordion items to display |
| `allowMultiple` | `boolean` | `false` | Allow multiple items to be expanded simultaneously |

### AccordionItem

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier for the item |
| `question` | `string` | The question/title text |
| `answer` | `string` | The answer/content text |

## Behavior

### Single Expansion Mode (default)

When `allowMultiple={false}` (default):
- Only one item can be expanded at a time
- Expanding a new item automatically collapses the previously expanded item
- Clicking an expanded item collapses it

### Multiple Expansion Mode

When `allowMultiple={true}`:
- Multiple items can be expanded simultaneously
- Each item toggles independently
- Clicking an expanded item collapses only that item

## Keyboard Navigation

- **Tab**: Navigate between accordion buttons
- **Enter** or **Space**: Toggle the focused accordion item
- **Shift + Tab**: Navigate backwards

## Accessibility

The component implements WCAG 2.1 AA accessibility standards:

- Semantic HTML with `<button>` elements
- ARIA attributes:
  - `aria-expanded`: Indicates expansion state
  - `aria-controls`: Links button to content panel
  - `role="region"`: Identifies content panel
  - `aria-labelledby`: Links panel to button
- Keyboard navigation support
- Focus indicators on interactive elements

## Animation

The component uses Motion (Framer Motion successor) for smooth animations:

- **Height animation**: Content smoothly expands/collapses
- **Opacity animation**: Content fades in/out
- **Chevron rotation**: Icon rotates 180° when expanded
- **Duration**: 300ms with easeInOut easing

## Styling

The component uses CSS custom properties from the design tokens:

- Colors: `--color-surface`, `--color-on-surface`, `--color-blue`
- Spacing: `--spacing-sm`, `--spacing-md`, `--spacing-lg`
- Typography: `--font-body-large`, `--font-body-medium`
- Border radius: `--radius-md`

## Requirements Validation

This component validates the following requirements:

- **2.4**: FAQ section with accordion component
- **2.5**: Smooth expand/collapse animations
- **9.3**: Keyboard accessibility (Enter/Space to toggle)
- **10.3**: Reusable accordion component

## Testing

The component includes comprehensive test coverage:

- **Unit tests**: Specific behavior and edge cases
- **Property-based tests**: Universal behaviors across all inputs

Run tests:
```bash
npm test Accordion
```
