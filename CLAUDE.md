# CLAUDE.md

## Project Overview

Generate.me AI is an open-source AI image and video generation platform. Users generate images via multiple AI providers (DALL-E, Stability, Flux, Ideogram, Fireworks Kontext), create talking avatar videos (D-ID), and animate images (Runway ML). Supports credit-based billing and bring-your-own-API-keys.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **React**: 19
- **Styling**: Tailwind CSS 4, Framer Motion
- **State**: Zustand 5
- **Backend**: Firebase 12 (Auth, Firestore, Storage), Firebase Admin 13
- **AI**: Vercel AI SDK 6, OpenAI, Replicate, Fireworks, Stability, Ideogram
- **Payments**: Stripe 20
- **Validation**: Zod 4

## Commands

```bash
npm run dev      # Dev server (Turbopack)
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint
```

## Project Structure

```
src/
├── app/           # Pages and API routes (App Router)
├── actions/       # Server Actions (all Firestore writes go here)
├── components/    # React components by domain
│   ├── ui/        # Base components (Button, IconButton, Skeleton)
│   ├── home/      # Landing page sections
│   ├── image/     # Image display (viewer, metadata, actions, tags)
│   ├── image-page/ # Image page hooks and modal composition
│   ├── images/    # Image list (grid, filters, pagination)
│   ├── generate/  # Generation form (prompt, settings, preview)
│   ├── generation/ # Shared generation UI (selectors, cards)
│   ├── auth/      # Auth modal
│   ├── layouts/   # Page layout wrappers
│   ├── navigation/ # Nav items
│   └── profile/   # Profile sub-components
├── constants/     # Config (modelRegistry, options, routes)
├── firebase/      # Client + Admin SDK init, path utilities
├── hooks/         # Client hooks (auth, generation, speech, debounce)
├── strategies/    # AI provider implementations (Strategy Pattern)
├── styles/        # Design tokens
├── types/         # TypeScript type definitions
├── utils/         # Shared utilities (errors, validation, storage, auth)
└── zustand/       # State stores (auth, profile, generation, payments)
```

## Key Architectural Patterns

### Route Protection: proxy.ts (NOT middleware.ts)

Next.js 16 uses `src/proxy.ts` for edge route protection. **Do NOT create a middleware.ts — it will cause a build error.**

- `src/proxy.ts` — soft gate that checks for auth cookie existence
- `src/constants/routes.ts` — single source of truth for protected/public routes
- Real auth is enforced in Server Actions via `authenticateAction()` (Firebase Admin token verification)

### Server Actions for All Writes

All Firestore writes go through Server Actions in `src/actions/`. Components never write to Firestore directly. The flow:
1. Client calls server action
2. `authenticateAction()` verifies the Firebase ID token via Admin SDK
3. Action performs the write with `adminDb`
4. Client refreshes local state via `fetchProfile()`

Server actions: `generateImage`, `generateVideo`, `generateGif`, `removeBackground`, `suggestTags`, `imageActions` (share/delete/tags/caption/background), `paymentActions`, `processPayment`, `profileActions`, `saveHistory`, `syncAuth`.

### Strategy Pattern (AI Providers)

- Interface: `src/strategies/types.ts` → `GenerationStrategy`
- Registry: `src/strategies/index.ts` → `getStrategy(modelName)`
- One file per provider: `dalle.ts`, `stability.ts`, `replicate.ts`, `ideogram.ts`, `fireworksKontext.ts`

### Model Registry

`src/constants/modelRegistry.ts` is the single source of truth for all model config: names, credit costs, API key mappings, capabilities. Everything else reads from it.

### Factory Pattern (Options)

`src/constants/optionFactory.ts` creates option sets with label-to-value mappers and finders. Used by: colors, lightings, perspectives, compositions, mediums, moods, artStyles.

### Typed Errors and ActionResult

- `src/utils/errors.ts`: `AppError` base class, specialized errors (`AuthenticationError`, `ValidationError`, etc.)
- All server actions return `ActionResult<T>` — either `{ success: true, data: T }` or `{ success: false, error: string, code: string }`

### Credit Validation

Credits are validated and deducted server-side in `src/utils/creditValidator.ts`. `assertSufficientCreditsServer(uid, model)` reads from Firestore. `deductCreditsServer(uid, amount)` uses a transaction. Client-provided credit values are never trusted.

## Coding Conventions

- **TypeScript**: Strict mode, no `any`. Use the error classes from `utils/errors.ts`.
- **Components**: Functional, `"use client"` only when hooks are used. Props interfaces required.
- **Styling**: Tailwind utilities. Use `cn()` from `utils/cn.ts` for conditional classes. Reference `styles/tokens.ts` for the design system. Tailwind 4 syntax: `bg-linear-to-r` not `bg-gradient-to-r`.
- **State**: Zustand for global, `useState` for local. Stores call server actions — they don't write to Firestore directly.
- **Server Actions**: In `src/actions/`. Call `authenticateAction()` first. Validate with Zod. Return `ActionResult<T>`.
- **Imports**: Use `@/*` alias (maps to `src/*`).
- **Async cleanup**: Use `isMountedRef` pattern to prevent state updates after unmount.
- **Errors**: Use `getErrorMessage()` instead of string concatenation.

## Important Files

- `src/proxy.ts` — Edge route protection (NOT middleware.ts)
- `src/constants/routes.ts` — Protected/public route definitions
- `src/constants/modelRegistry.ts` — All model config (credits, API keys, capabilities)
- `src/utils/serverAuth.ts` — `authenticateAction()` for server actions
- `src/utils/errors.ts` — Error classes, `ActionResult<T>`, `getErrorMessage()`
- `src/utils/creditValidator.ts` — Server-side credit validation and deduction
- `src/firebase/firebaseAdmin.ts` — Admin SDK (`adminDb`, `adminAuth`, `adminBucket`)
- `src/firebase/firebaseClient.ts` — Client SDK (`db`, `auth`, `storage`)
- `src/firebase/paths.ts` — All Firestore/Storage path construction
- `src/strategies/index.ts` — AI provider registry (`getStrategy()`)
- `src/styles/tokens.ts` — Design tokens (colors, typography, spacing)

## Adding a New AI Provider

1. Create `src/strategies/new-provider.ts` implementing `GenerationStrategy`
2. Register in `src/strategies/index.ts`
3. Add model entry to `src/constants/modelRegistry.ts` (credits, API key, capabilities)
4. Add environment variable to `.env.local`

## Data Model (Firestore)

- `users/{uid}` — Auth metadata (email, displayName, lastSignIn)
- `users/{uid}/profile/userData` — Profile (credits, API keys, settings)
- `users/{uid}/payments/{paymentId}` — Payment records
- `profiles/{uid}/covers/{coverId}` — Generated images/videos (user's gallery)
- `publicImages/{imageId}` — Publicly shared images (copied from covers when shared)

## Environment Variables

**Firebase Admin (server-only):**
`FIREBASE_TYPE`, `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_CLIENT_ID`, `FIREBASE_AUTH_URI`, `FIREBASE_TOKEN_URI`, `FIREBASE_AUTH_PROVIDER_X509_CERT_URL`, `FIREBASE_CLIENT_CERTS_URL`

**Firebase Client (public):**
`NEXT_PUBLIC_FIREBASE_APIKEY`, `NEXT_PUBLIC_FIREBASE_AUTHDOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECTID`, `NEXT_PUBLIC_FIREBASE_STORAGEBUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID`, `NEXT_PUBLIC_FIREBASE_APPID`, `NEXT_PUBLIC_FIREBASE_MEASUREMENTID`

**AI Providers (server-only):**
`OPENAI_API_KEY`, `FIREWORKS_API_KEY`, `STABILITY_API_KEY`, `BRIA_AI_API_KEY`, `DID_API_KEY`, `REPLICATE_API_KEY`, `IDEOGRAM_API_KEY`

**Stripe:**
`STRIPE_SECRET_KEY` (server), `NEXT_PUBLIC_STRIPE_KEY` (public), `NEXT_PUBLIC_STRIPE_PRODUCT_NAME` (public)

**App:**
`NEXT_PUBLIC_COOKIE_NAME`, `NEXT_PUBLIC_ENABLE_PREVIEW_MARKING`, `NEXT_PUBLIC_CREDITS_PER_*` (per-model credit costs)

---

## Rules

**Write clean, direct code:**
- The simplest solution that works correctly is the best solution.
- Do NOT create wrapper functions, utility classes, or abstractions that are only used once. Inline it.
- Do NOT create types or interfaces that just duplicate the shape of something already typed.
- Do NOT add comments that restate what the code does. Comments explain WHY, not WHAT.
- Before creating anything new, search the codebase for existing solutions first.

**No speculative engineering:**
- Do NOT add options, configuration, or generalization "for future flexibility."
- Do NOT create abstractions to "make it easier to swap X later."
- Do NOT add error handling for conditions that cannot occur.
- Solve the actual problem. Not a hypothetical general version of the problem.

**Big improvements welcome, busywork is not:**
- Refactors that fix real problems (security, performance, correctness, maintainability) are encouraged — even large ones.
- Refactors that just reorganize working code, add layers of indirection, or rename things for "consistency" are not.
- A 200-line PR that fixes a real architectural issue is better than a 20-line PR that wraps a function in a class for no reason.

**Do NOT create middleware.ts.** This is Next.js 16. Route protection is in `src/proxy.ts`. Creating a middleware.ts will break the build.

**Do NOT write to Firestore from client code.** All writes go through server actions in `src/actions/` using Firebase Admin SDK. Client components call server actions, then refresh local state.

**Do NOT trust client-provided credit values.** Credit checks and deductions happen server-side via `assertSufficientCreditsServer()` and `deductCreditsServer()`.

**Always search before creating.** Before adding a new utility, component, hook, or type — search the codebase. If something exists that does what you need, use it.
