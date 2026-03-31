# GDG on Campus Yaşar University Website

Official website for GDG on Campus Yaşar University, built with React, TypeScript, and Vite.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router 7** - Client-side routing
- **Motion** - Animations
- **Biome** - Linting and formatting
- **Vitest** - Testing framework

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm or Bun package manager

### Installation

```bash
# Install dependencies
npm install

# Start development server (runs on port 3001, or 3002 if 3001 is busy)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Commands

```bash
# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm test
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components (Button, Card, Accordion)
│   ├── layout/          # Layout components (Navigation, Footer)
│   └── features/        # Feature-specific components (EventCard, TeamMemberCard, etc.)
├── pages/               # Page components (HomePage, AboutPage, etc.)
├── data/                # Static data (events, team, FAQs, highlights)
├── types/               # TypeScript type definitions
├── styles/              # Global styles and design tokens
└── test/                # Test utilities and setup
```

## Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Accessible (WCAG 2.1 compliant)
- ✅ Material 3 design system
- ✅ Smooth animations and transitions
- ✅ SEO-friendly
- ✅ Fast performance (Vite + React)

## Pages

- **Home** (`/`) - Hero section, mission, highlights, upcoming events
- **About** (`/about`) - Mission, vision, values, FAQs
- **Team** (`/team`) - Leadership and team members
- **Events** (`/events`) - Event listing with filters
- **Event Detail** (`/events/:id`) - Individual event details

## Design System

The website follows Material 3 design principles with GDG brand colors:

- **Blue** (#4285F4) - Primary
- **Red** (#EA4335) - Secondary
- **Yellow** (#FBBC04) - Accent
- **Green** (#34A853) - Success

## Contributing

Please follow the coding conventions in `docs/react-conventions.md` and ensure all tests pass before submitting a PR.

## License

© 2024 GDG on Campus Yaşar University. All rights reserved.
