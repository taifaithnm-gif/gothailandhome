# GoThailandHome

Production web foundation for [gothailandhome.com](https://gothailandhome.com).

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- ESLint + Prettier
- shadcn/ui

## Project structure

```text
src/
  app/                 # App Router entrypoints
  components/
    ui/                # shadcn/ui primitives
  config/              # App and site configuration
  hooks/               # Shared React hooks
  lib/                 # Shared utilities
  types/               # Shared TypeScript types
public/                # Static assets
```

## Scripts

```bash
npm run dev        # local development
npm run build      # production build
npm run start      # serve production build
npm run lint       # ESLint
npm run format     # Prettier write
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
