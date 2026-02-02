# CLAUDE.md - AI Assistant Guide for Generate.me AI

## Project Overview

Generate.me AI is an open-source AI-powered image and video generation platform. Users can generate custom images using multiple AI providers (DALL-E, Stable Diffusion, Flux, Ideogram), create talking avatar videos (D-ID), and animate images (Runway ML). Supports both credit-based billing and bring-your-own-API-keys.

## Tech Stack

- **Framework**: Next.js 16+ with App Router & Turbopack
- **Language**: TypeScript (strict mode)
- **UI**: React 19, Tailwind CSS 4, Framer Motion
- **State**: Zustand stores (auth, profile, generation, payments)
- **Backend**: Firebase (Auth, Firestore, Storage), Firebase Admin SDK
- **AI**: Vercel AI SDK, OpenAI, Replicate, Fireworks, Stability, Ideogram
- **Payments**: Stripe
- **Validation**: Zod

## Commands

```bash
npm run dev      # Development server with Turbopack
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint
```

## Project Structure

```
src/
├── app/           # Next.js App Router pages & API routes
├── actions/       # Server Actions (generateImage, generateVideo, etc.)
├── components/    # React components organized by domain
│   ├── ui/        # Base UI components (Button, IconButton, Skeleton)
│   ├── home/      # Landing page sections (HeroSection, FeaturesGrid, etc.)
│   ├── image/     # Image display components
│   └── image-page/# Image page hooks and actions
├── constants/     # Config (modelRegistry, artStyles, options)
├── firebase/      # Firebase client/admin initialization & paths
├── hooks/         # Custom React hooks
├── strategies/    # AI provider Strategy Pattern implementations
├── styles/        # Design tokens (tokens.ts)
├── types/         # TypeScript type definitions
├── utils/         # Utility functions (errors, validation, storage)
└── zustand/       # Zustand state stores
```

## Key Architectural Patterns

### Strategy Pattern (AI Providers)
- Interface: `src/strategies/types.ts` → `GenerationStrategy`
- Registry: `src/strategies/index.ts`
- One strategy per provider: dalle.ts, fireworks.ts, replicate.ts, stability.ts, ideogram.ts

### Factory Pattern (Options)
- `src/constants/optionFactory.ts` creates option sets with utilities
- Used by: colors, lightings, perspectives, compositions, mediums, moods, artStyles

### Centralized Paths
- `src/firebase/paths.ts` for all Firestore path construction

### Typed Error Handling
- `src/utils/errors.ts`: AppError base class, specialized errors
- Server Actions return `ActionResult<T>` type

## Coding Conventions

- **TypeScript**: Strict mode, avoid `any`, use custom error types
- **Components**: Functional with hooks, props interfaces required
- **Styling**: Tailwind utilities, use `cn()` for conditional classes, reference `tokens.ts`
- **State**: Zustand for global, useState for component-local. Update Firestore first, then local state.
- **Server Actions**: Located in `src/actions/`, use Zod validation, return ActionResult<T>
- **Imports**: Use `@/*` path alias (maps to `src/*`)
- **Async Cleanup**: Use `isMountedRef` pattern to prevent state updates after unmount
- **Error Messages**: Use `getErrorMessage()` utility instead of string concatenation
- **UI Components**: Use components from `@/components/ui` for consistency

## Important Files

- `src/actions/generateImage.ts` - Main image generation pipeline
- `src/constants/modelRegistry.ts` - AI model definitions (single source of truth)
- `src/zustand/useAuthStore.ts` - Authentication state
- `src/utils/errors.ts` - Error classes & handling
- `src/firebase/paths.ts` - Firestore path utilities
- `src/strategies/index.ts` - AI provider registry (use `getStrategy()` function)
- `src/styles/tokens.ts` - Design system tokens (colors, typography, spacing)
- `src/components/ui/index.ts` - Base UI component exports
- `src/utils/firestoreValidation.ts` - Runtime validation for Firestore data

## Adding a New AI Provider

1. Create `src/strategies/new-provider.ts` implementing `GenerationStrategy`
2. Register in `src/strategies/index.ts`
3. Add model config to `src/constants/modelRegistry.ts`
4. Add environment variables
5. Configure credit costs

## Firebase Collections

- `users/{uid}` - User data
- `profiles/{uid}` - Profile with credits, API keys, covers (images)
- `publicImages/{imageId}` - Publicly shared images

## Environment Variables

Required in `.env.local`:
- Firebase: `NEXT_PUBLIC_FIREBASE_*` (client) + `FIREBASE_*` (admin)
- AI: `OPENAI_API_KEY`, `FIREWORKS_API_KEY`, `REPLICATE_API_TOKEN`, etc.
- Stripe: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- See `.env.example` for full list
