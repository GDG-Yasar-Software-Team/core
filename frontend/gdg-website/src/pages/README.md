# Pages Structure

This directory contains all page components organized in a modular structure. Each page has its own folder with related components, styles, and data.

## Structure

```
pages/
├── Home/
│   ├── index.tsx                 # Re-exports HomePage
│   ├── HomePage.tsx              # Main page component
│   ├── HomePage.css              # Page styles
│   └── components/               # Page-specific components
│
├── Team/
│   ├── index.tsx                 # Re-exports TeamPage
│   ├── TeamPage.tsx              # Main page component
│   ├── TeamPage.css              # Page styles
│   └── components/               # Page-specific components
│
├── About/
│   ├── index.tsx                 # Re-exports AboutPage
│   ├── AboutPage.tsx             # Main page component
│   ├── AboutPage.css             # Page styles
│   └── components/               # Page-specific components
│
└── UpcomingEvents/
    ├── index.tsx                 # Re-exports UpcomingEventsPage
    ├── UpcomingEventsPage.tsx    # Main page component
    ├── UpcomingEventsPage.css    # Page styles
    ├── components/               # Page-specific components
    │   ├── EventCard.tsx
    │   └── EventCard.css
    └── data/                     # Page-specific data
        └── events.ts             # Event data (upcoming & past)
```

## Benefits

1. **Modularity**: Each page is self-contained with its own components and styles
2. **Easy Maintenance**: Find everything related to a page in one place
3. **Scalability**: Easy to add new pages or page-specific features
4. **Clear Dependencies**: Page-specific components are clearly separated from shared components

## Usage

Import pages in App.tsx using the folder name:

```tsx
const HomePage = lazy(() => import("./pages/Home"));
const TeamPage = lazy(() => import("./pages/Team"));
const AboutPage = lazy(() => import("./pages/About"));
const UpcomingEventsPage = lazy(() => import("./pages/UpcomingEvents"));
```

## Adding a New Page

1. Create a new folder: `pages/NewPage/`
2. Add required files:
   - `index.tsx` - Re-export the page component
   - `NewPage.tsx` - Main page component
   - `NewPage.css` - Page styles
   - `components/` - Page-specific components (if needed)
   - `data/` - Page-specific data (if needed)
3. Update `App.tsx` to include the new route

## Event Images

Event images are stored in `public/events/` directory. Upload event images there and reference them in the events data file.
