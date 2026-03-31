# Design Document: GDG on Campus Yaşar University Website

## Overview

The GDG on Campus Yaşar University website is a frontend-only React application that serves as the primary digital presence for the GDG chapter. The application will showcase the community's mission, team members, events, and values through a modern, accessible, and responsive interface following Material 3 design principles.

### Technology Stack

- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 7.x
- **Package Manager**: Bun
- **Routing**: React Router DOM 7.x
- **Styling**: CSS Modules with Material 3 design tokens
- **Linting/Formatting**: Biome
- **Animation**: Motion (Framer Motion successor)

### Design Principles

1. **Material 3 First**: All UI components follow Material 3 design system specifications
2. **Mobile-First**: Responsive design starting from mobile breakpoints
3. **Component Reusability**: Shared components with TypeScript interfaces
4. **Accessibility**: WCAG 2.1 AA compliance with semantic HTML and ARIA labels
5. **Performance**: Code splitting, lazy loading, and optimized assets
6. **Type Safety**: Strict TypeScript with no `any` types

## Architecture

### High-Level Structure

```
frontend/gdg-website/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Generic components (Button, Card, etc.)
│   │   ├── layout/          # Layout components (Navigation, Footer)
│   │   └── features/        # Feature-specific components
│   ├── pages/               # Page components (route handlers)
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Helper functions
│   ├── styles/              # Global styles and design tokens
│   ├── data/                # Static data (mock events, team members)
│   ├── App.tsx              # Root component with routing
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── package.json
├── vite.config.ts
├── tsconfig.json
└── biome.json
```

### Routing Architecture

The application uses React Router DOM with the following route structure:

```
/ (Home)
├── /about
├── /team
├── /events
└── /events/:eventId
```

**Route Configuration**:
```typescript
const routes = [
  { path: '/', element: <HomePage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/team', element: <TeamPage /> },
  { path: '/events', element: <EventsPage /> },
  { path: '/events/:eventId', element: <EventDetailPage /> }
];
```

### State Management

Given the static nature of the website, state management will be minimal:

- **Local Component State**: React `useState` for UI interactions (accordion expand/collapse, mobile menu toggle)
- **URL State**: React Router for navigation and event detail routing
- **No Global State**: No Redux/Zustand needed as data is static

### Responsive Breakpoints

Following mobile-first approach with Material 3 breakpoints:

```css
/* Mobile: < 768px (default) */
/* Tablet: 768px - 1024px */
@media (min-width: 768px) { ... }

/* Desktop: > 1024px */
@media (min-width: 1024px) { ... }
```

## Components and Interfaces

### Core Reusable Components

#### 1. Button Component

**Purpose**: Material 3 styled button with variants

**Props Interface**:
```typescript
interface ButtonProps {
  variant: 'filled' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary';
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
}
```

**Material 3 Specifications**:
- Filled: Elevated with primary color background
- Outlined: Border with transparent background
- Text: No border, transparent background
- Rounded corners: 20px (full pill shape)
- Hover/Active states with elevation changes

#### 2. Card Component

**Purpose**: Container for events and team members

**Props Interface**:
```typescript
interface CardProps {
  variant: 'elevated' | 'filled' | 'outlined';
  clickable?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}
```

**Material 3 Specifications**:
- Elevated: Shadow elevation level 1
- Filled: Surface color with no shadow
- Outlined: 1px border with no shadow
- Border radius: 12px
- Hover state: Elevation increase for clickable cards

#### 3. Accordion Component

**Purpose**: Expandable FAQ sections

**Props Interface**:
```typescript
interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}
```

**Behavior**:
- Single expansion by default (allowMultiple=false)
- Smooth height animation using Motion
- Chevron icon rotation on expand/collapse
- Keyboard accessible (Enter/Space to toggle)

#### 4. Navigation Component

**Purpose**: Primary navigation bar

**Props Interface**:
```typescript
interface NavigationProps {
  currentPath: string;
}

interface NavLink {
  label: string;
  path: string;
}
```

**Features**:
- Desktop: Horizontal navigation with active indicator
- Mobile: Hamburger menu with slide-in drawer
- Active page highlighting with underline or background
- Sticky positioning on scroll

#### 5. Footer Component

**Purpose**: Site footer with links and branding

**Props Interface**:
```typescript
interface FooterProps {
  socialLinks: SocialLink[];
  codeOfConductUrl: string;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}
```

### Feature-Specific Components

#### 6. EventCard Component

**Purpose**: Display event information in list views

**Props Interface**:
```typescript
interface EventCardProps {
  event: Event;
  onClick: (eventId: string) => void;
}
```

**Layout**:
- Date badge (top-left corner)
- Event title
- Location with icon
- Speaker avatars (horizontal row)
- RSVP button (bottom-right)

#### 7. TeamMemberCard Component

**Purpose**: Display team member information

**Props Interface**:
```typescript
interface TeamMemberCardProps {
  member: TeamMember;
}
```

**Layout**:
- Profile photo (circular, 120px diameter)
- Name (headline typography)
- Title/Role (body typography)
- Social links (icon buttons)

#### 8. HeroSection Component

**Purpose**: Home page hero with title and mission

**Props Interface**:
```typescript
interface HeroSectionProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
}
```

#### 9. HighlightCard Component

**Purpose**: Display workshop/hackathon/talks highlights

**Props Interface**:
```typescript
interface HighlightCardProps {
  icon: string;
  title: string;
  description: string;
}
```

#### 10. HorizontalScroll Component

**Purpose**: Scrollable container for events

**Props Interface**:
```typescript
interface HorizontalScrollProps {
  children: React.ReactNode;
  showScrollbar?: boolean;
}
```

**Features**:
- Touch swipe support on mobile
- Scroll snap points
- Optional scroll indicators
- Keyboard navigation (arrow keys)

## Data Models

### Event Model

```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO 8601 format
  time: string; // "HH:MM" format
  location: string;
  type: 'workshop' | 'hackathon' | 'talk' | 'meetup';
  status: 'upcoming' | 'past';
  featured: boolean;
  speakers: Speaker[];
  rsvpUrl?: string;
  imageUrl?: string;
}

interface Speaker {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  bio?: string;
}
```

### TeamMember Model

```typescript
interface TeamMember {
  id: string;
  name: string;
  title: string;
  role: 'leader' | 'core' | 'member';
  team: 'leadership' | 'technical' | 'marketing' | 'operations' | 'design';
  photoUrl: string;
  bio?: string;
  socialLinks: SocialLink[];
}

interface SocialLink {
  platform: 'linkedin' | 'github' | 'twitter' | 'instagram' | 'website';
  url: string;
}
```

### FAQ Model

```typescript
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}
```

### Highlight Model

```typescript
interface Highlight {
  id: string;
  icon: string;
  title: string;
  description: string;
}
```

## Design Tokens and Styling

### Color Palette (GDG Colors)

```css
:root {
  /* Primary Colors */
  --color-blue: #4285F4;
  --color-red: #EA4335;
  --color-yellow: #FBBC04;
  --color-green: #34A853;
  
  /* Surface Colors */
  --color-surface: #FFFFFF;
  --color-surface-variant: #F5F5F5;
  --color-background: #FAFAFA;
  
  /* Text Colors */
  --color-on-surface: #1F1F1F;
  --color-on-surface-variant: #5F6368;
  
  /* State Colors */
  --color-hover: rgba(66, 133, 244, 0.08);
  --color-focus: rgba(66, 133, 244, 0.12);
  --color-active: rgba(66, 133, 244, 0.16);
}
```

### Typography

```css
:root {
  /* Font Family */
  --font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  /* Display */
  --font-display-large: 57px / 64px;
  --font-display-medium: 45px / 52px;
  --font-display-small: 36px / 44px;
  
  /* Headline */
  --font-headline-large: 32px / 40px;
  --font-headline-medium: 28px / 36px;
  --font-headline-small: 24px / 32px;
  
  /* Body */
  --font-body-large: 16px / 24px;
  --font-body-medium: 14px / 20px;
  --font-body-small: 12px / 16px;
  
  /* Label */
  --font-label-large: 14px / 20px (500 weight);
  --font-label-medium: 12px / 16px (500 weight);
  --font-label-small: 11px / 16px (500 weight);
}
```

### Elevation (Shadows)

```css
:root {
  --elevation-1: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
  --elevation-2: 0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15);
  --elevation-3: 0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.3);
}
```

### Spacing Scale

```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
}
```

### Border Radius

```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

## Page Implementations

### Home Page

**Layout Structure**:
1. Navigation Bar (sticky)
2. Hero Section (full viewport height)
3. Mission Snippet (centered, max-width 800px)
4. Highlights Section (3-column grid on desktop, 1-column on mobile)
5. Recent Events Section (horizontal scroll)
6. Footer

**Key Features**:
- Hero with gradient background using GDG colors
- Highlights with icon, title, and description
- Horizontal scroll for events with touch support
- CTA button linking to events page

### About Page

**Layout Structure**:
1. Navigation Bar
2. Mission & Vision Section (two-column on desktop)
3. Values Section (3 cards: Learning, Connecting, Growing)
4. FAQ Section (Accordion component)
5. Footer

**Key Features**:
- Values cards with icons and descriptions
- Accordion with smooth animations
- Single expansion mode for FAQs

### Team Page

**Layout Structure**:
1. Navigation Bar
2. Leadership Section (2 leaders, prominent display)
3. Team Sections (4 teams: Technical, Marketing, Operations, Design)
4. Footer

**Key Features**:
- Leadership cards larger than regular team cards
- Team sections with headers
- Grid layout: 2 columns on mobile, 3 on tablet, 4 on desktop
- Hover effects on team member cards
- Social links open in new tabs

### Upcoming Events Page

**Layout Structure**:
1. Navigation Bar
2. Featured Event Banner (if exists)
3. Filter Controls (Upcoming / Past toggle)
4. Events Grid
5. Footer

**Key Features**:
- Filter state managed with useState
- Featured event displayed prominently at top
- Grid layout: 1 column on mobile, 2 on tablet, 3 on desktop
- Click on event card navigates to detail page

### Event Detail Page

**Layout Structure**:
1. Navigation Bar
2. Event Header (image, title, date badge)
3. Event Details Section (description, speakers, location, time)
4. RSVP Section (button and registration info)
5. Footer

**Key Features**:
- Event ID from URL params
- Back button to events page
- Speaker cards with avatars and bios
- RSVP button links to external registration (if available)

## Implementation Strategy

### Phase 1: Project Setup
1. Create `frontend/gdg-website/` directory
2. Initialize Vite + React + TypeScript project with Bun
3. Configure Biome for linting/formatting
4. Set up project structure (components, pages, types, etc.)
5. Install dependencies: react-router-dom, motion
6. Configure Vite for port 3001

### Phase 2: Design System Foundation
1. Create design tokens CSS file
2. Implement core components: Button, Card
3. Create typography and spacing utilities
4. Set up global styles

### Phase 3: Layout Components
1. Implement Navigation component (desktop + mobile)
2. Implement Footer component
3. Create page layout wrapper

### Phase 4: Feature Components
1. Implement EventCard component
2. Implement TeamMemberCard component
3. Implement Accordion component
4. Implement HorizontalScroll component
5. Implement HeroSection component
6. Implement HighlightCard component

### Phase 5: Pages Implementation
1. Create static data files (events, team members, FAQs)
2. Implement HomePage
3. Implement AboutPage
4. Implement TeamPage
5. Implement EventsPage
6. Implement EventDetailPage

### Phase 6: Routing and Navigation
1. Set up React Router configuration
2. Implement route transitions
3. Add active page indicators
4. Test navigation flow

### Phase 7: Responsive Design
1. Test all pages on mobile breakpoint
2. Test all pages on tablet breakpoint
3. Test all pages on desktop breakpoint
4. Adjust layouts and spacing as needed

### Phase 8: Accessibility
1. Add ARIA labels to interactive elements
2. Ensure keyboard navigation works
3. Test with screen reader
4. Verify color contrast ratios
5. Add focus indicators

### Phase 9: Polish and Optimization
1. Add animations and transitions
2. Optimize images
3. Implement code splitting
4. Test performance
5. Final QA pass

## Accessibility Implementation

### Semantic HTML
- Use `<nav>` for navigation
- Use `<main>` for main content
- Use `<article>` for event cards
- Use `<section>` for page sections
- Use `<button>` for interactive elements (not `<div>`)

### ARIA Labels
```typescript
// Button with icon only
<button aria-label="Open menu">
  <MenuIcon />
</button>

// Navigation
<nav aria-label="Main navigation">
  ...
</nav>

// Accordion
<button
  aria-expanded={isExpanded}
  aria-controls={`panel-${id}`}
>
  {question}
</button>
<div
  id={`panel-${id}`}
  role="region"
  aria-labelledby={`button-${id}`}
>
  {answer}
</div>
```

### Keyboard Navigation
- Tab order follows visual order
- Enter/Space activates buttons
- Escape closes mobile menu
- Arrow keys navigate horizontal scroll
- Focus trap in mobile menu

### Color Contrast
- Text on surface: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Interactive elements: 3:1 minimum
- Focus indicators: 3:1 minimum

### Focus Indicators
```css
:focus-visible {
  outline: 2px solid var(--color-blue);
  outline-offset: 2px;
}
```

## Error Handling

### Route Not Found
- Implement 404 page component
- Display friendly message with navigation back to home
- Log navigation errors to console (development only)

### Missing Event Data
- Check if event exists in EventDetailPage
- Display "Event not found" message if ID is invalid
- Provide link back to events page

### Image Loading Errors
- Provide fallback images for team members and events
- Use `onError` handler to swap to placeholder
- Ensure alt text is always present

### External Link Failures
- RSVP links open in new tab with `rel="noopener noreferrer"`
- Social links handle missing URLs gracefully
- Display error message if external service is unavailable


## Testing Strategy

### Testing Approach

The GDG website will use a dual testing approach combining unit tests and property-based tests:

**Unit Tests**:
- Specific examples of component rendering
- Edge cases (empty states, missing data)
- Configuration verification (ports, build outputs)
- Component architecture validation
- Integration between components

**Property-Based Tests**:
- Universal behaviors across all inputs
- Responsive layout behavior at all breakpoints
- Interactive element behaviors (clicks, hovers, keyboard)
- Accessibility compliance across all components
- Navigation and routing behavior

**Testing Library**: Vitest with React Testing Library for unit tests, fast-check for property-based tests

**Configuration**:
- Property tests: Minimum 100 iterations per test
- Each property test tagged with: **Feature: gdg-website, Property {number}: {property_text}**
- Unit tests focus on specific examples and edge cases
- Property tests verify universal behaviors

### Test Organization

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx          # Unit tests
│   │   └── Button.property.test.tsx # Property tests
│   └── ...
├── pages/
│   ├── HomePage.tsx
│   └── HomePage.test.tsx
└── utils/
    └── ...
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Responsive Layout Adaptation

*For any* page in the website, when viewed at different viewport widths, the layout should adapt appropriately: mobile layout for widths < 768px, tablet layout for widths 768-1024px, and desktop layout for widths > 1024px.

**Validates: Requirements 1.6, 8.2, 8.3, 8.4**

### Property 2: FAQ Accordion Toggle

*For any* FAQ item in the accordion, clicking on it should toggle its expanded state—expanding if currently collapsed, collapsing if currently expanded.

**Validates: Requirements 2.4, 2.5**

### Property 3: Team Member Card Required Elements

*For any* team member card, it should display all required elements: photo, name, title, and social links.

**Validates: Requirements 3.3**

### Property 4: Social Links Open in New Tab

*For any* social link on a team member card, clicking it should open the link in a new browser tab with appropriate security attributes (rel="noopener noreferrer").

**Validates: Requirements 3.5**

### Property 5: Event Card Required Elements

*For any* event card displayed in the events list, it should contain all required elements: date badge, title, location, speaker avatars, and RSVP button.

**Validates: Requirements 4.1**

### Property 6: Event Filter Behavior

*For any* collection of events, when a filter is applied (Upcoming or Past), only events matching that filter status should be displayed.

**Validates: Requirements 4.3, 4.4**

### Property 7: Event Card Navigation

*For any* event card, clicking on it should navigate to the event detail page with the correct event ID in the URL.

**Validates: Requirements 4.6**

### Property 8: Event Detail Page Required Information

*For any* event, when viewing its detail page, all comprehensive information should be displayed: description, date, time, location, and speakers.

**Validates: Requirements 5.1**

### Property 9: RSVP Button Action

*For any* event with an RSVP URL, clicking the RSVP button should initiate the registration process (navigate to external URL or trigger registration flow).

**Validates: Requirements 5.3**

### Property 10: Navigation Bar Presence

*For any* page in the website, a navigation bar should be present and visible.

**Validates: Requirements 6.1**

### Property 11: Navigation Link Behavior

*For any* navigation link in the navigation bar, clicking it should navigate to the corresponding page.

**Validates: Requirements 6.3**

### Property 12: Active Page Indication

*For any* page currently being viewed, the corresponding navigation link should be visually indicated as active.

**Validates: Requirements 6.4**

### Property 13: Mobile Navigation Adaptation

*For any* page viewed at mobile viewport width (< 768px), the navigation bar should display a mobile-friendly navigation menu (hamburger menu with drawer).

**Validates: Requirements 6.5**

### Property 14: Interactive Element Visual Feedback

*For any* interactive element (button, link, card), it should provide visual feedback for hover, active, and focus states.

**Validates: Requirements 7.5, 3.4**

### Property 15: Touch Swipe Support

*For any* horizontal scroll container on a mobile device, touch swipe gestures should be supported for scrolling.

**Validates: Requirements 8.6**

### Property 16: Semantic HTML Usage

*For any* content section on the website, it should use appropriate semantic HTML elements (nav, main, article, section, header, footer) rather than generic div elements.

**Validates: Requirements 9.1**

### Property 17: Image Alternative Text

*For any* image element on the website, it should have an alt attribute with descriptive alternative text.

**Validates: Requirements 9.2**

### Property 18: Keyboard Accessibility

*For any* interactive element on the website, it should be reachable and operable using keyboard navigation (Tab, Enter, Space, Arrow keys).

**Validates: Requirements 9.3**

### Property 19: ARIA Labels for Non-Semantic Elements

*For any* interactive component that uses non-semantic HTML (e.g., div with onClick), it should have appropriate ARIA labels (aria-label, aria-labelledby, role).

**Validates: Requirements 9.5**

### Property 20: Visible Focus Indicators

*For any* focusable element, when focused via keyboard navigation, it should display a visible focus indicator (outline or border).

**Validates: Requirements 9.6**

