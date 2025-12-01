# React Conventions

## Official Documentation

- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Vite**: https://vite.dev/
- **Bun**: https://bun.sh/docs
- **Biome**: https://biomejs.dev/

Please read the official docs. Feel free to ask questions to the team if you need help!

---

## Project Structure

```
frontend/your-app/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Helper functions
│   ├── types/           # TypeScript types
│   └── App.tsx
├── package.json
└── README.md
```

## Dependencies

We use **bun** for package management.

```bash
# Install bun (if not installed)
curl -fsSL https://bun.sh/install | bash

# Create new project
bun create vite my-app --template react-ts

# Install dependencies
bun install

# Add a package
bun add axios

# Run dev server
bun run dev
```

## Code Style

We use **Biome** for linting and formatting. It runs automatically on PRs.

```bash
# Add biome to project
bun add -d @biomejs/biome

# Format code
bun run biome format --write .

# Check linting
bun run biome lint .

# Check all (lint + format)
bun run biome check .
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserCard.tsx` |
| Hooks | camelCase with `use` | `useAuth.ts` |
| Utils | camelCase | `formatDate.ts` |
| Types/Interfaces | PascalCase | `User`, `ApiResponse` |
| Variables | camelCase | `userName` |
| Constants | UPPER_SNAKE | `API_URL` |

## Components

```tsx
// Use function components with TypeScript
interface UserCardProps {
  name: string;
  email: string;
  onClick?: () => void;
}

export function UserCard({ name, email, onClick }: UserCardProps) {
  return (
    <div className="user-card" onClick={onClick}>
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
}
```

## Hooks

```tsx
// Custom hooks for reusable logic
import { useState, useEffect } from "react";

export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then((data) => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  return { user, loading };
}
```

## TypeScript

```tsx
// Define types for API responses
interface User {
  id: number;
  name: string;
  email: string;
}

// Use generics for reusable types
interface ApiResponse<T> {
  data: T;
  error?: string;
}
```

## Best Practices

1. **Always use TypeScript**
   - Define props interfaces
   - Type API responses
   - Avoid `any`

2. **Keep components small**
   - One component per file
   - Extract logic to hooks
   - Extract UI to smaller components

3. **Use meaningful names**
   ```tsx
   // Good
   const [isLoading, setIsLoading] = useState(false);
   
   // Bad
   const [x, setX] = useState(false);
   ```

4. **Handle loading and error states**
   ```tsx
   if (loading) return <Spinner />;
   if (error) return <ErrorMessage error={error} />;
   return <UserList users={users} />;
   ```

5. **Use early returns**
   ```tsx
   if (!user) return null;
   return <UserCard user={user} />;
   ```

## File Organization

```
components/
├── UserCard/
│   ├── UserCard.tsx
│   ├── UserCard.css
│   └── index.ts        # export { UserCard } from './UserCard'
```

