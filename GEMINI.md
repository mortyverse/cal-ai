# GEMINI.md

## Project Overview

This is a Next.js web application called "CalAI", an AI-powered food logging service. Users can upload a picture of their meal, and the application will use AI to identify the food, and estimate the calories and nutritional information. The project is built with TypeScript, Next.js, and Tailwind CSS. It uses a webhook for image analysis and Supabase for the backend, although the current version heavily relies on mock data for demonstration purposes.

## Building and Running

To get the development environment running, use the following commands:

```bash
# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

Other available scripts:

*   `pnpm build`: Creates a production build of the application.
*   `pnpm start`: Starts the production server.

## Development Conventions

*   **Package Manager:** The project uses `pnpm` for package management.
*   **Language:** The codebase is written in TypeScript.
*   **Styling:** Styling is done using Tailwind CSS. The project also uses `shadcn/ui` components, which can be found in the `components/ui` directory.
*   **Icons:** The project uses `lucide-react` for icons.
*   **Authentication:** For development, a mock authentication system is in place. You can bypass the login by using the "Demo Login" button on the homepage. The authentication bypass logic is located in `lib/auth-bypass.ts`.
*   **Image Analysis:** Image analysis is handled by a webhook to an n8n instance. The API route for this is in `app/api/upload-image/route.ts`.
*   **Data:** The application currently uses mock data for the dashboard and food history pages. The mock data generation logic is in `lib/mock-data.ts`.

## Coding and Architectural Rules

This project adheres to a set of coding and architectural rules to ensure code quality, maintainability, and performance. These are derived from the `.cursor/rules` directory.

### General World-Class Coding Practices

These are the foundational principles applied to all code in the project.

*   **Clarity & Readability:** Write code for humans. Use clear naming, consistent formatting (via Prettier), and comment on the *why*, not the *what*.
*   **Simplicity (KISS, DRY, YAGNI):** Prefer simple, elegant solutions. Avoid repetition by abstracting common logic. Don't implement functionality that isn't needed now.
*   **Robustness:** Handle errors explicitly and gracefully. Validate all external inputs at the system boundaries. Manage resources like file handles and network connections properly.
*   **Security:** Never hardcode secrets. Prevent common vulnerabilities like injection attacks. Use the principle of least privilege. Keep dependencies updated and scanned for vulnerabilities.
*   **Testability:** Write unit, integration, and E2E tests. Design code to be testable, focusing on critical paths and edge cases.
*   **Performance:** Be mindful of algorithmic complexity (Big O). Profile before optimizing and focus on identified bottlenecks.
*   **Maintainability:** Refactor continuously to reduce technical debt. Externalize configuration from code.
*   **Collaboration:** Use Git effectively with clear commit messages. Participate constructively in code reviews.

### Next.js & TypeScript Specific Rules

These rules are specific to the Next.js App Router and TypeScript stack used in this project.

*   **App Router First:** All new features, UI, and APIs must use the `app/` directory and its file-based routing conventions (`page.tsx`, `layout.tsx`, `route.ts`, etc.).
*   **Colocation:** **Strongly prefer colocating feature-specific code** (components, hooks, actions) in private folders (e.g., `app/dashboard/_components/`). Global directories like `components/` and `lib/` are reserved for truly application-wide, shared code.
*   **Server Components by Default:** Maximize the use of React Server Components (RSCs) for direct data fetching and to reduce client-side JavaScript.
*   **Client Components (`'use client'`):** Use the `'use client'` directive only when necessary for interactivity (hooks, event listeners). Keep these components as small and as far down the tree as possible.
_This is a new rule that was added to the `GEMINI.md` file._
*   **Data Mutations with Server Actions:** **Prioritize Server Actions for all data mutations** (e.g., form submissions). This is the modern, preferred approach over traditional API route handlers for mutations.
*   **Data Fetching:** Use `async/await` with `fetch` in Server Components for data retrieval, leveraging Next.js's built-in caching.
*   **Performance:**
    *   Always use the `next/image` component (`<Image>`) for images.
    *   Use `next/font` for font optimization.
    *   Implement `loading.tsx` with Suspense for better loading states.
*   **State Management:** Prefer using URL search params for state where possible (filters, pagination). Use `useState` for local component state and consider Zustand or Jotai for complex global client state.
*   **Security:** All Server Actions and API Route Handlers must perform robust server-side validation (Zod is recommended) and authentication/authorization checks.
*   **Styling:** Use Tailwind CSS for styling, keeping styles colocated with their components where applicable.