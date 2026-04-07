# Form Frontend

React frontend for the GDG Form Service.

## Setup

```bash
# Install dependencies
bun install

# Create local env
cp .env.example .env.local

# Run development server
bun run dev
```

## Environment

```bash
VITE_FORM_SERVICE_URL=http://localhost:8002
```

## Project Structure

```
src/
├── components/      # Reusable components
├── pages/           # Page components
├── hooks/           # Custom hooks
├── utils/           # Helper functions
├── types/           # TypeScript types
├── services/        # API calls
└── App.tsx
```

## Code Quality

```bash
# Lint code
bun run lint

# Fix lint issues
bun run lint:fix

# Format code
bun run format
```
