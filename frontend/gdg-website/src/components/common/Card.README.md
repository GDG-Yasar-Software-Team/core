# Card Component

A Material 3 styled card component for displaying content in elevated, filled, or outlined containers.

## Usage

```tsx
import { Card } from './components/common';

// Basic elevated card
<Card variant="elevated">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Filled card
<Card variant="filled">
  Content
</Card>

// Outlined card
<Card variant="outlined">
  Content
</Card>

// Clickable card with onClick handler
<Card variant="elevated" clickable onClick={() => console.log('Clicked!')}>
  Click me!
</Card>

// Card with custom className
<Card variant="elevated" className="custom-card">
  Content
</Card>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `'elevated' \| 'filled' \| 'outlined'` | Yes | - | Visual style of the card |
| `clickable` | `boolean` | No | `false` | Whether the card is interactive |
| `onClick` | `() => void` | No | - | Click handler (only works when `clickable` is true) |
| `children` | `React.ReactNode` | Yes | - | Content to display inside the card |
| `className` | `string` | No | `''` | Additional CSS classes |

## Variants

### Elevated
- White background with shadow elevation
- Shadow increases on hover when clickable
- Best for cards that need to stand out from the background

### Filled
- Light gray background with no shadow
- Background darkens on hover when clickable
- Best for cards that need subtle differentiation

### Outlined
- White background with border
- Background tint on hover when clickable
- Best for cards that need clear boundaries

## Accessibility

- Clickable cards have `role="button"` for semantic meaning
- Clickable cards are keyboard accessible (Tab to focus, Enter/Space to activate)
- Focus indicators are visible for keyboard navigation
- Non-clickable cards are regular divs without interactive attributes

## Material 3 Specifications

- Border radius: 12px (`var(--radius-lg)`)
- Elevated shadow: `var(--elevation-1)` (increases to `var(--elevation-2)` on hover)
- Transition duration: 0.2s ease
- Hover states only apply when `clickable` is true

## Examples

### Event Card
```tsx
<Card variant="elevated" clickable onClick={() => navigate(`/events/${event.id}`)}>
  <img src={event.imageUrl} alt={event.title} />
  <h3>{event.title}</h3>
  <p>{event.date}</p>
</Card>
```

### Team Member Card
```tsx
<Card variant="filled">
  <img src={member.photoUrl} alt={member.name} />
  <h3>{member.name}</h3>
  <p>{member.title}</p>
</Card>
```

### Value Card
```tsx
<Card variant="outlined">
  <Icon name="learning" />
  <h3>Learning</h3>
  <p>Continuous growth through workshops and talks</p>
</Card>
```
