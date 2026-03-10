# GDG Mail Service - Admin Frontend

Admin dashboard for managing email campaigns via the GDG Mail Service API.

## Tech Stack

- React 19, TypeScript 5.9, Vite 7
- Tailwind CSS 3.4
- react-router-dom v7, react-hook-form, zod
- CodeMirror (HTML editor), sonner (toasts), lucide-react (icons), date-fns

## Getting Started

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Start development server (port 3001)
bun dev
```

## Environment Variables

| Variable              | Default                 | Description          |
| --------------------- | ----------------------- | -------------------- |
| `VITE_MAIL_SERVICE_URL` | `http://localhost:8000` | Mail service API URL |

## Available Scripts

```bash
bun dev       # Start dev server
bun build     # Type-check and build for production
bun preview   # Preview production build
bun run lint  # Lint with Biome
bun run format # Format with Biome
```

## Project Structure

```
src/
├── components/    # Reusable UI components
├── pages/         # Route page components
├── hooks/         # Custom React hooks
├── services/      # API service layer
├── types/         # TypeScript type definitions
├── utils/         # Helper utilities
├── App.tsx        # Route definitions
├── main.tsx       # Entry point
└── index.css      # Global styles (Tailwind)
```

## Pages

| Route                          | Page               | Description                     |
| ------------------------------ | ------------------ | ------------------------------- |
| `/`                            | DashboardPage      | Campaign list with stats        |
| `/campaigns/new`               | CreateCampaignPage | Create a new email campaign     |
| `/campaigns/:campaignId`       | CampaignDetailPage | View campaign details & trigger |
| `/campaigns/:campaignId/edit`  | EditCampaignPage   | Edit an existing campaign       |
