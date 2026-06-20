# AGENTS.md

Authoritative instructions for AI coding agents (Codex, Claude, Cursor, etc.) working in this repository. Read this file before making any changes. The product specification and roadmap live in `spec.md`.

---

## Project Overview

**Generate.me AI** is an open-source, full-stack web app for AI image and video generation. Users sign in with Firebase, generate images through several AI providers, animate or voice images into videos, manage a personal gallery, and share results publicly. Generation is paid for either with platform **credits** or with the user's **own provider API keys (BYOK)**.

The app is a Next.js 16 App Router project deployed on Vercel, backed by Firebase (Auth, Firestore, Storage).

## Product Purpose

Give creators a simple, transparent alternative to closed AI-art suites:

- **Multiple providers behind one UI** — DALL·E / GPT Image (OpenAI), Stability SD3.5 Turbo, FLUX (Replicate + Fireworks Kontext), Ideogram, plus D-ID and RunwayML for video.
- **BYOK or credits** — users pay providers directly with their own keys, or buy credits via Stripe. No markup is forced.
- **Deliberately simple** — a single generation screen, opinionated defaults, fast results.

See `spec.md` for the full product promise, user flows, and roadmap.

## Current Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack dev, `src/proxy.ts` edge guard)
- **Language**: TypeScript 6, strict mode, `@/*` → `src/*`
- **React**: 19
- **Styling**: Tailwind CSS 4 (`@tailwindcss/postcss`, no `tailwind.config.ts` — config is CSS-first in `globals.css`), Framer Motion
- **State**: Zustand 5
- **Backend**: Firebase 12 client SDK + Firebase Admin 13 (Auth, Firestore, Storage)
- **AI**: Vercel AI SDK 6 (`ai`, `@ai-sdk/openai`, `@ai-sdk/rsc`), Replicate SDK, plus direct REST calls (Stability, Ideogram, Fireworks, D-ID, RunwayML, Bria)
- **Payments**: Stripe 22 (`stripe`, `@stripe/react-stripe-js`, `@stripe/stripe-js`)
- **Validation**: Zod 4
- **Media**: `sharp`, `fluent-ffmpeg` + `ffmpeg-static` (GIF), `dom-to-image`
- **Lint**: ESLint 10 (flat config `eslint.config.mjs`, `eslint-config-next`)

Package manager is **npm** (`package-lock.json`, `.npmrc`). Do not switch package managers.

## Repository Structure

```
src/
├── app/                 # App Router pages + API route handlers
│   ├── api/             # Route Handlers (server work lives here)
│   │   ├── auth/sync/           # Set/clear auth cookie
│   │   ├── generate/            # image (NDJSON stream), video, gif, tags, optimize-prompt, background-removal
│   │   ├── images/[imageId]/    # GET/PATCH/DELETE + /share
│   │   ├── payments/            # intent, process, validate
│   │   ├── profile/             # GET/PATCH profile, payments list
│   │   ├── history/             # save generation record
│   │   └── previews/            # model/style preview listing
│   ├── generate/  images/[id]/  profile/  payment-*/  loginfinish/
│   └── (legal pages: about, terms, privacy, support)
├── actions/             # CLIENT-side typed wrappers that call /api/* (NOT server actions)
├── lib/
│   ├── api/client.ts    # apiGet/apiPost/apiPostForm/apiPatch/apiDelete → ActionResult envelope
│   ├── api/server.ts    # withAuth, parseJsonBody, jsonOk/jsonError, errorToResponse
│   └── stripe.ts        # Stripe server client
├── components/          # React components by domain (ui, home, image, image-page, images, generate, generation, auth, layouts, navigation, profile)
├── constants/           # modelRegistry (source of truth), optionFactory, routes, option sets
├── firebase/            # firebaseClient, firebaseAdmin, paths
├── hooks/               # client hooks (auth, generation, speech, debounce, clipboard, url sync)
├── strategies/          # image provider Strategy Pattern (dalle, stability, replicate, ideogram, fireworksKontext)
├── styles/tokens.ts     # design tokens
├── types/               # shared TS types
├── utils/               # errors, validationSchemas, creditValidator, profileFields, serverAuth, storage, promptUtils, polling, cn, ...
└── zustand/             # stores: useAuthStore, useProfileStore, useGenerationStore, usePaymentsStore
firestore.rules  storage.rules  next.config.mjs  eslint.config.mjs  .env.example
```

## Core Architecture Overview

> The codebase was migrated from Server Actions to **API Route Handlers with a streaming image pipeline**. There are no `"use server"` files. Do not reintroduce server actions; add API routes instead.

1. **Client → API route → Firebase Admin.** Components and hooks call typed wrappers in `src/actions/*`, which call `src/lib/api/client.ts` helpers, which `fetch` an `/api/*` route. Routes run on the Node runtime and use Firebase **Admin** SDK for all privileged reads/writes.
2. **Uniform envelope.** Every JSON API returns `ActionResult<T>` = `{ success: true, data }` or `{ success: false, error, code }`. `apiFetch` normalizes network/parse failures into the same shape. Image generation is the exception: it streams **NDJSON progress events** (`started`/`generating`/`uploading`/`complete`/`error`) and always responds `200` so errors arrive as structured events.
3. **Route handler helpers** (`src/lib/api/server.ts`): wrap handlers in `withAuth(handler)` to inject the authenticated `uid`; validate JSON with `parseJsonBody(req, schema)`; return `jsonOk`/`jsonError`; let thrown `AppError` subclasses map to status codes via `errorToResponse`.
4. **Auth.** `src/proxy.ts` is a soft edge gate that only checks for the auth cookie's existence (prevents protected-page flashes). Real auth is `authenticateAction()` in `src/utils/serverAuth.ts`, which verifies the Firebase ID token from the cookie with the Admin SDK on every request. The cookie is set/cleared via `/api/auth/sync`.
5. **Strategy Pattern (image providers).** `getStrategy(model)` in `src/strategies/index.ts` resolves an implementation via `MODEL_REGISTRY[model].strategyKey`. Video (D-ID, RunwayML) is handled inline in `src/app/api/generate/video/route.ts` with `pollWithTimeout`, not via strategies.
6. **Model Registry.** `src/constants/modelRegistry.ts` is the single source of truth for model id/label/type, credit cost (env key + fallback), API-key mapping (env var + FormData key), and capabilities. Everything reads from it.
7. **Credits.** Validated and deducted **server-side** in `src/utils/creditValidator.ts` (`assertSufficientCreditsServer`, `deductCreditsServer` via Firestore transaction). Client-supplied credit values are never trusted. When BYOK is active (`useCredits === false`) no credits are deducted.
8. **Factory Pattern (options).** `src/constants/optionFactory.ts#createOptionSet` builds colors/lightings/perspectives/compositions/mediums/moods/artStyles with label↔value mappers.

## Key App Features (Today)

- **Image generation** with style, color, lighting, perspective, composition, medium, mood; aspect ratio, negative prompt (model-dependent), and multi-image counts; live streaming progress UI.
- **Image-to-image** reference upload for models that support it.
- **AI prompt optimization** and **AI tag suggestions** (OpenAI via API routes).
- **Voice prompt input** (Web Speech API).
- **Video generation**: D-ID talking avatars (with Amazon-voice TTS) and RunwayML image-to-video; **GIF conversion** via FFmpeg.
- **Background removal** (Bria AI).
- **Gallery**: paginated grid, tag filtering, per-image detail page.
- **Sharing**: publish an image to a public URL with optional (non-secret) password; social share buttons; downloads.
- **Profile**: store per-provider API keys, toggle credits vs BYOK, view credit balance.
- **Payments**: Stripe credit purchase (PaymentIntent) and payment history.
- **Auth**: Firebase Google, email/password, and passwordless email-link sign-in.

## Important Commands

```bash
npm install            # install deps (npm only)
npm run dev            # dev server (Turbopack) — never run in autonomous validation
npm run build          # production build
npm start              # serve production build
npm run lint           # ESLint (flat config)
npx tsc --noEmit       # typecheck (no dedicated script exists)
npm test               # Vitest unit tests (run mode, non-interactive)
```

### Canonical validation/check command

Run this exact sequence after any change and before committing:

```bash
npm run lint && npx tsc --noEmit && npm test && npm run build
```

- `lint` and `tsc --noEmit` currently pass clean — keep them green.
- `npm run build` requires environment variables only for runtime; build/typecheck do not need real secrets, but if a build step reads env at module load it may warn. If `build` cannot run in the sandbox (e.g. no network for fonts/Firebase), document that and rely on `lint` + `tsc --noEmit` as the minimum gate.

### Non-interactive testing rules

- A small **Vitest** unit suite exists (`npm test` → `vitest run`); there is **no CI** wired yet. The suite currently covers pure route-protection logic (`src/constants/routes.test.ts`), model registry env documentation (`src/constants/modelRegistry.test.ts`), profile-update sanitization (`src/utils/profileFields.test.ts`), and storage URL allowlisting (`src/utils/storageUrl.test.ts`).
- Always run tests in run mode (`vitest run` / `npm test`), never watch mode.
- Never start dev servers or a headed browser as part of validation.
- Never wait for manual login or interactive input.
- Use only CI-safe, non-interactive commands. Treat the canonical command above as the gate.
- Prefer Vitest (+ React Testing Library for components). Keep tests free of network/Firebase/secret dependencies — test pure logic and boundaries. Add tests for new bug-prone or security-sensitive logic and update this file and `spec.md`.

## Development Conventions

- Functional components; add `"use client"` only when a component uses hooks/browser APIs. Props interfaces required.
- Tailwind utilities + `cn()` from `src/utils/cn.ts`. Tailwind 4 syntax (`bg-linear-to-r`, not `bg-gradient-to-r`). Reference `src/styles/tokens.ts`.
- Reuse before creating: search for an existing util/hook/component/type first.
- No single-use wrappers or speculative abstractions. Inline simple logic.
- Comments explain **why**, never restate **what**. Don't narrate edits in comments.
- Use `getErrorMessage()` and the error classes in `src/utils/errors.ts` instead of ad-hoc strings.
- Async cleanup: use the `isMountedRef` pattern to avoid state updates after unmount.

### TypeScript and lint expectations

- Strict mode. **No `any`.** Prefer precise types and the `ActionResult<T>` envelope.
- Validate all external input with Zod (`src/utils/validationSchemas.ts`). FormData via `parseFormData`, JSON via `parseJsonBody`.
- `tsc --noEmit` must be clean. ESLint must be clean (warnings included — keep the baseline at zero).

### Server / client boundary guidance

- **Server-only** code (Firebase Admin, provider secrets, credit logic) lives in `src/app/api/**/route.ts`, `src/lib/api/server.ts`, `src/utils/serverAuth.ts`, `src/utils/creditValidator.ts`, `src/strategies/*`, and `src/firebase/firebaseAdmin.ts`. Mark new server-only modules with `import "server-only"`.
- **Never** import `firebaseAdmin`, provider secrets, or `process.env.*_API_KEY` into client components or `src/actions/*`.
- Client never writes to Firestore directly. Client → `src/actions/*` wrapper → `/api/*` route → Admin SDK. After a write, refresh local state (e.g. `fetchProfile()`).
- New server endpoints: add a route under `src/app/api/...`, wrap with `withAuth`, validate with Zod, return `jsonOk`/`jsonError`; add a matching client wrapper in `src/actions/*` using `src/lib/api/client.ts`.

### Route-protection guidance

- Route protection is **`src/proxy.ts`** (Next.js 16). **Never create `middleware.ts` — it breaks the build.**
- `src/constants/routes.ts` is the single source of truth for protected/public routes. `/images` is protected but `/images/[id]` is public for sharing.
- The proxy is UX-only. Enforce real authorization inside each API route (`withAuth` + ownership checks against `profiles/{uid}/covers/{id}`).

### State-management guidance

- Zustand for global state, `useState` for local. Stores call `src/actions/*` wrappers; they never touch Firestore directly.
- Stores: `useAuthStore` (uid/email/auth readiness), `useProfileStore` (credits, API keys, useCredits, settings), `useGenerationStore` (prompt/model/settings/result), `usePaymentsStore` (history).
- Use `useShallow` / selectors for multi-field subscriptions to avoid re-render churn.

### Testing expectations

- A focused Vitest suite covers route-protection, model registry env documentation, profile-sanitization, and storage URL allowlist logic; extend it when you touch bug-prone or security-sensitive pure logic. Don't fabricate passing runs.
- For UI/flow changes without unit coverage, manually reason through the affected flow and keep the validation gate green.
- If a change is risky (payments, credits, auth, storage rules), call it out in the commit/notes and prefer the smallest safe change.

## Files and Systems Requiring Extra Caution

- `src/proxy.ts` / `src/constants/routes.ts` — auth gating. Don't convert to `middleware.ts`.
- `src/utils/creditValidator.ts` + `MODEL_REGISTRY` credit config — money/credits. Keep deductions server-side and transactional.
- `src/app/api/profile/route.ts` + `src/utils/profileFields.ts` — `PATCH /api/profile` merges client-supplied fields, so it strips server-controlled fields (`credits`) via `stripServerControlledProfileFields`. Never let `credits` (or any future money field) be client-writable here.
- `src/app/api/images/[imageId]/route.ts` — owner-scoped. `DELETE`/`PATCH` must verify the caller owns `profiles/{uid}/covers/{imageId}` **before** touching the global `publicImages/{imageId}` mirror, or any user could mutate another user's public image by id.
- `src/utils/serverAuth.ts`, `src/app/api/auth/sync/route.ts` — auth/session cookie. Breaking these logs everyone out.
- `firestore.rules`, `storage.rules` — security boundaries. Public image password is **stored in plaintext in the public doc; it is not a secret** — never treat it as one.
- `src/app/api/payments/*`, `src/actions/paymentActions.ts`, `src/lib/stripe.ts` — Stripe. Validate `paymentIntentId`; never trust client amounts.
- `src/app/api/generate/image/route.ts` — NDJSON streaming contract shared with `src/actions/generateImage.ts`. Keep event shapes in sync.
- `src/app/api/generate/video/route.ts`, `src/actions/generateGif.ts` — long-running polling + FFmpeg (`maxDuration = 300`, Node runtime). Mind Vercel plan timeouts.
- `package-lock.json` and other generated files — don't hand-edit; change via npm.

## Git Workflow Expectations

- **`main`** is the stable production branch. **Never push to `main`** and never open PRs into it as part of autonomous runs.
- **`dev`** is the autonomous working branch. Commit directly to `dev` and push to `origin/dev`.
- Do not create feature branches for autonomous runs unless explicitly told to.
- Before working: `git fetch --all --prune`, check out `dev`, pull latest `origin/dev`, inspect the working tree. If `dev` is behind `main` and is a strict ancestor, fast-forward `dev` to `main` (safe, non-destructive) so work reflects production. Never overwrite existing uncommitted changes.
- Before pushing: confirm you're on `dev`, pull/integrate `origin/dev` again, re-run validation.
- Use clear `type: summary` commit messages (`docs:`, `feat:`, `fix:`, `chore:`).

## Definition of Done

A change is done when:

1. It is a single, focused, PR-sized unit of work (see below).
2. `npm run lint && npx tsc --noEmit && npm test && npm run build` passes (or any unavailable step is documented with reason).
3. Server/client boundary, route protection, and credit/auth rules are respected.
4. No new `any`, no dead code, no single-use abstractions, no narration comments.
5. Docs touched by the change are updated (`README.md`, `spec.md`, this file).
6. Generated files were changed only via their tooling.
7. Committed to `dev` with a descriptive message and pushed to `origin/dev`. `main` untouched.

## Rules for Autonomous Codex Runs

- **One focused, PR-sized change per run**, even though you commit directly to `dev`. A "PR-sized change" is one coherent feature/fix that could stand alone as a single reviewable pull request and one clean commit sequence. Do not bundle unrelated changes.
- Work from `spec.md`'s roadmap. Pick the next unblocked, highest-impact item; implement it end-to-end (code + docs).
- Prefer completing/improving existing product capability over generic cleanup. Don't generate large lint/test/refactor backlogs unless they directly unlock product value.
- Search before creating. Follow the existing patterns (Strategy, Factory, Model Registry, `ActionResult`, API-route + client wrapper).
- Keep the working tree clean: stage and commit only files relevant to the change.
- After finishing the change: validate, commit to `dev`, push `origin/dev`, then stop and report.

## Stop Conditions

Stop and report (do not guess or expand scope) when:

- The validation gate fails for reasons you cannot safely fix within the current change's scope.
- A change would require pushing to `main`, force-pushing, or rewriting shared history.
- A task needs real secrets, live external services, manual login, or a headed browser to verify.
- You hit a security-sensitive area (auth, credits, payments, Firestore/Storage rules) and the safe path is ambiguous.
- The working tree already has unrelated uncommitted changes you'd have to overwrite.
- The next step is genuinely ambiguous or would exceed a single PR-sized change.

When you stop, report what was done, what's blocking, and the recommended next step.
