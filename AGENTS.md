# Repository Guidelines

## Project Structure & Module Organization

- `app/`: Next.js App Router entrypoints (`layout.tsx`, `page.tsx`) and global CSS in `app/globals.css`.
- `components/`: shared React components; `components/ui/` contains shadcn/ui primitives.
- `hooks/`: reusable React hooks (e.g. `use-toast.ts`).
- `lib/`: utilities and shared logic (see `lib/utils.ts`).
- `public/`: static assets served from `/` (images, icons, sample photos).
- `styles/`: legacy global CSS; prefer updating `app/globals.css` unless a file explicitly imports from `styles/`.

## Build, Test, and Development Commands

- `pnpm install`: install dependencies.
- `pnpm dev`: run the local dev server (default `http://localhost:3000`).
- `pnpm build`: create a production build.
- `pnpm start`: run the production build.
- `pnpm lint`: run lint checks.

## Coding Style & Naming Conventions

- Use TypeScript + React functional components and hooks.
- Keep types accurate even if builds pass: `next.config.mjs` is configured to ignore TypeScript build errors.
- Formatting: match existing code (2-space indentation, double quotes, no semicolons).
- Naming:
  - Components: `PascalCase` (e.g. `ImageCanvas.tsx`).
  - Utilities/hooks: `kebab-case` (e.g. `use-image.ts`, `image-utils.ts`).
- Imports: prefer the `@/` alias (e.g. `import { Button } from "@/components/ui/button"`).

## Testing Guidelines

- No test runner is configured yet. If you add tests, include the test tooling + a `pnpm test` script in the same PR.
- Use `*.test.ts(x)` naming and keep tests close to the code they validate (e.g. `components/__tests__/...`).

## Commit & Pull Request Guidelines

- This checkout does not include Git history; use Conventional Commits (e.g. `feat: add crop tool`, `fix: handle empty upload`).
- PRs should include:
  - A short summary of user-visible behavior changes.
  - Screenshots/GIFs for UI updates.
  - Manual verification steps (example: “Upload image → apply edit → refresh page → confirm state”).

## Security & Configuration Tips

- Store secrets in `.env.local` and do not commit it.
- Keep `public/` assets reasonably sized; prefer optimized formats for new images.
