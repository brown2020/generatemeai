# Generate.me AI — Product Specification & Roadmap

Authoritative product spec for Generate.me AI. This is the single source of truth for product scope, current state, and roadmap. Engineering/agent conventions live in `AGENTS.md`. Setup details live in `README.md`.

> Conclusions marked **(inferred)** are derived from reading the codebase rather than from prior documentation. They reflect actual behavior at the time of writing.

---

## 1. Product Overview

### Product promise

A simple, transparent, open-source studio for turning a text prompt (or a reference image) into high-quality images and short videos — using best-in-class AI providers behind one clean interface, paid for either with platform credits or with your own provider API keys, with no forced markup and your work saved to a private gallery you can share when you choose.

### Target users

- **Content creators & social media managers** who need on-brand visuals fast.
- **Hobbyists & AI-art explorers** who want results without a steep learning curve.
- **Developers & privacy-conscious users** drawn to an open-source, BYOK, potentially self-hostable alternative to closed suites.
- **Small teams/businesses** needing affordable, ad-hoc visual assets.

### Core workflows

1. **Sign in** (Google, email/password, or passwordless email link).
2. **Generate an image** — write a prompt, pick a model, optionally tune style/lighting/color/aspect ratio/etc., watch live progress, get one or more images.
3. **Manage** — generated media lands in a private gallery; browse, filter by tag, open detail.
4. **Transform** — animate an image (RunwayML), make a talking avatar (D-ID), convert to GIF, or remove its background.
5. **Share** — publish an image to a public URL (optionally password-gated) and share to social networks; download locally.
6. **Pay** — use credits (buy via Stripe) or bring your own provider API keys.

### Product goals

- **Simplicity as a feature** — one opinionated generation screen, great defaults, minimal knob overload.
- **Cost transparency** — users always understand what an action costs (credits or direct provider spend).
- **Provider breadth without lock-in** — multiple image/video providers, swappable via BYOK.
- **Reliability** — generation either succeeds with clear progress or fails with a clear, actionable message.
- **Fast activation** — a new user reaches their first successful generation quickly.

---

## 2. Current Application State

### What the app currently does

Generate.me AI is a working Next.js 16 app where authenticated users generate, manage, transform, and share AI images and videos, paying with credits or their own API keys. Server work runs in API Route Handlers using Firebase Admin; the client calls these via typed wrappers that return a uniform `ActionResult<T>` envelope. Image generation streams NDJSON progress events for a live "generating / uploading" experience.

### Current feature inventory

**Image generation**
- Models (image): DALL·E / GPT Image (OpenAI), Stability SD3.5 Turbo, FLUX.2 Pro (Replicate), Ideogram 3.0, FLUX Kontext Pro (Fireworks). **(inferred: the registry is the source of truth; older Playground V2/V2.5 and Fireworks SDXL entries documented elsewhere are no longer registered.)**
- Prompt enrichment via style, color scheme, lighting, perspective, composition, medium, mood (Factory-pattern option sets).
- Aspect-ratio selection, negative prompts, and multi-image counts — gated per-model by `MODEL_REGISTRY` capabilities (`supportsAspectRatio`, `supportsNegativePrompt`, `maxImages`).
- Image-to-image reference upload for models that support it.
- AI prompt optimization and AI tag suggestions (OpenAI).
- Voice prompt input (Web Speech API).
- Live streaming progress UI (started → generating → uploading X/Y → complete/error).

**Video & media**
- D-ID talking avatars (script-to-speech via Amazon voices) and silent animations.
- RunwayML image-to-video.
- GIF conversion (FFmpeg via `ffmpeg-static`).
- Background removal (Bria AI).
- Both video providers run a poll-until-ready loop inside the request (`maxDuration = 300`, Node runtime). **(inferred: there is no separate job queue or cron — long jobs complete within the request.)**

**Gallery & sharing**
- Private gallery of generated media with a paginated grid and tag filtering.
- Per-image detail page: metadata, tags (CRUD), caption, background color, download.
- Public sharing: copy an image into `publicImages/{id}` with optional password and social-share buttons.

**Accounts, profile & payments**
- Firebase auth: Google, email/password, passwordless email link; auth cookie synced via `/api/auth/sync`.
- Profile: store per-provider API keys, toggle credits vs BYOK, view credit balance. New profiles seed a default credit balance. **(inferred: default seed is 1000 credits with a 100-credit floor in `useProfileStore`.)**
- Stripe credit purchases (PaymentIntent) and a payment-history view.

### Current user flows

- **Auth flow**: `AuthModal` → Firebase sign-in → ID token stored in cookie via `/api/auth/sync` → `proxy.ts` allows protected routes → API routes verify the token with Admin SDK.
- **Generate flow**: `useImageGenerator` builds a prompt + FormData → streams `/api/generate/image` → on `complete`, refreshes profile (credits) and saves a history record to Firestore.
- **Image detail flow**: `useImagePageData` loads owner data (falls back to public copy) → owner actions (share/delete/tags/caption/background/video) call `/api/images/[id]*`.
- **Payment flow**: create PaymentIntent → Stripe Elements → process/validate → credits updated server-side.

### Existing integrations

OpenAI (DALL·E/GPT Image, GPT prompt+tags), Stability AI, Replicate (FLUX), Fireworks (FLUX Kontext), Ideogram, D-ID, RunwayML, Bria AI; Firebase (Auth/Firestore/Storage); Stripe; Vercel (hosting/AI SDK).

### Current architecture summary

- **Next.js 16 App Router**, Node-runtime API routes do all privileged work; `src/proxy.ts` is a soft auth gate (cookie presence only). No `middleware.ts`.
- **Client → `src/actions/*` (client wrappers) → `src/lib/api/client.ts` → `/api/*` route → Firebase Admin.** Uniform `ActionResult<T>` envelope; image generation streams NDJSON.
- **Strategy Pattern** for image providers (`src/strategies`), **Model Registry** as single source of truth (`src/constants/modelRegistry.ts`), **Factory Pattern** for option sets.
- **Server-side credits** (`creditValidator.ts`, transactional deduction); client profile updates are sanitized server-side (`PATCH /api/profile` strips `credits`) and image mutations are owner-scoped before touching the public mirror; **Zod** validation at every boundary; **typed errors** + `ActionResult`.
- **Zustand** stores for auth/profile/generation/payments.
- **Data model (Firestore)**: `users/{uid}` (auth metadata), `users/{uid}/profile/userData` (credits, keys, settings), `users/{uid}/payments/{id}`, `profiles/{uid}/covers/{id}` (gallery), `publicImages/{id}` (shared copies). Media in Storage under `generated/{uid}/*`, `image-references/{uid}/*`, served via signed URLs.

### Existing technical constraints

- Long-running video/GIF jobs must finish inside one request (Vercel `maxDuration` ≤ 300; Hobby plan caps at 60s). **(inferred constraint.)**
- Provider rate limits and per-provider API differences are absorbed in strategies/routes; failures surface as `ExternalApiError`.
- Build/runtime require many env vars (Firebase Admin + client, provider keys, Stripe, credit costs, cookie name).

### Known limitations

- **Minimal automated tests and no CI.** A small Vitest unit suite covers route-protection, model registry env documentation, profile-sanitization, and storage URL allowlisting logic; the rest of the app is unverified by tests, and no CI pipeline runs them automatically. Validation is `lint` + `tsc --noEmit` + `npm test` + `build`. **(inferred.)**
- **Public-image password is stored in plaintext** in the public doc — it deters casual access only and is not a real secret (documented in `README.md` and `firestore.rules`).
- **Gallery has tag filtering and pagination but no free-text prompt search and no bulk operations.** **(inferred.)**
- **No cost/credit preview before generating** — users don't see what an action will cost until after. **(inferred.)**
- **No reproducibility controls** (seed) and **no upscaling** — both are table stakes for the category.
- **`publicImages` exists but there is no community/discovery feed** — sharing is per-link only. **(inferred.)**
- **Registry/env drift guard exists.** A unit test verifies `.env.example` lists every provider API key and exactly the public credit env vars declared in `MODEL_REGISTRY`, preventing the DALL·E/GPT Image credit-key typo and removed-model credit vars from returning. **(inferred.)**

---

## 3. Product Roadmap

Product-oriented, ordered by impact and dependency. Each item is sized for **one clean PR / commit sequence** and is grounded in the existing app. Do larger items by splitting along the sub-bullets if needed.

### M1 — Credit/cost preview before generating
- **User value**: Removes the #1 frustration in this category (surprise cost). Users see exactly what a generation will cost before committing.
- **Implementation intent**: In the generate screen, read `creditsToMinus(model)` and `imageCount` (client-safe; credit costs are public env values) to show "This will use N credits" next to the Generate button, plus the resulting balance. When BYOK is active, show "Using your own {provider} key — no credits" instead. Disable/condition the button when credits are insufficient.
- **Acceptance criteria**: Cost (or BYOK notice) is visible and updates live with model/imageCount changes; insufficient-credit state is clearly communicated; gate passes.

### M2 — Gallery prompt search
- **User value**: Table-stakes findability; users can locate past work by what they typed, not just tags.
- **Implementation intent**: Add a debounced search box to the gallery that filters covers by prompt/caption/tags. Extend the gallery API/query (`profiles/{uid}/covers`) to support a text match (Firestore prefix or client-side filter over the paginated set, whichever fits the existing pagination). Reuse `useDebounce` and the existing `FilterBar`.
- **Acceptance criteria**: Typing filters results within the existing grid/pagination; empty-result state is shown; tag filter and search compose; gate passes.

### M3 — Re-run / remix from history
- **User value**: Fast iteration and activation — re-generate or tweak a previous prompt in one click.
- **Implementation intent**: On an image detail page (and/or gallery card), add "Edit prompt & regenerate" that loads the saved generation record (prompt, model, style, settings already persisted via `saveGenerationHistory`) into `useGenerationStore` and routes to `/generate` prefilled.
- **Acceptance criteria**: Clicking populates the generate form with the prior settings; user can adjust and generate; no data loss on round-trip; gate passes.

### M4 — Bulk select & delete in the gallery
- **User value**: Removes one-at-a-time tedium; basic library hygiene.
- **Implementation intent**: Add a multi-select mode to the gallery grid with a "Delete selected" action that calls the existing delete endpoint per item (batched), with a single confirm modal. Reuse `DeleteConfirmModal` and `deleteImage`.
- **Acceptance criteria**: Users can select multiple images and delete them with one confirmation; UI updates optimistically and reconciles; partial-failure is surfaced; gate passes.

### M5 — Generation presets (save & reuse a configuration)
- **User value**: Differentiator and repeat-use driver — save a favorite "model + style + lighting + aspect ratio" combo and apply it instantly.
- **Implementation intent**: Persist named presets on the profile (`users/{uid}/profile/userData` or a `presets` subcollection) via a new `/api/profile` field or endpoint + client wrapper. Add UI in the generate screen to save the current settings as a preset and to apply/delete presets. Keep it within existing store/registry patterns.
- **Acceptance criteria**: Users can create, apply, and delete presets; presets persist across sessions; applying a preset sets all relevant generation fields; gate passes.

### M6 — First-run onboarding & prompt starters
- **User value**: Faster activation — a new user reaches a successful first generation without a blank screen.
- **Implementation intent**: Add an empty-state/onboarding panel on `/generate` for users with no history: a few curated example prompts (one-click to load), a short "how it works" hint, and a clear note about starting credits vs BYOK. Reuse existing home `HowItWorks` content and option sets.
- **Acceptance criteria**: New users see starter prompts and guidance; clicking a starter fills the form; the panel disappears once the user has generations; gate passes.

### M7 — Side-by-side multi-model comparison
- **User value**: Differentiator — generate the same prompt across 2–3 models and compare to find the best result.
- **Implementation intent**: Add an optional "compare" mode that fans out the same prompt to multiple selected image models (sequential or parallel calls to `/api/generate/image`), rendering results in a comparison grid with per-model cost shown (builds on M1). Respect per-model capabilities and credit checks.
- **Acceptance criteria**: User selects multiple models, generates once, and sees labeled results side-by-side; each generation independently saves to history; costs are previewed; gate passes.

### M8 — Public community gallery (discovery feed)
- **User value**: Turns existing `publicImages` sharing into discovery and social proof; a growth/retention lever.
- **Implementation intent**: Add a public `/explore` (or `/gallery`) page listing recent shared `publicImages` with image, prompt, and a "copy prompt" action. Add a read-only API route to list public images (respecting `firestore.rules` public `get`/listing constraints — may require a curated/queryable index). Strictly read-only and unauthenticated-friendly.
- **Acceptance criteria**: Visitors browse recent public images; prompts are copyable; private images never appear; no write paths added; gate passes. **(Note: confirm `firestore.rules` allow the required listing or add an index field; do not weaken owner protections.)**

### M9 — Seed control for reproducibility
- **User value**: Table stakes for serious users — reproduce or vary a result deterministically.
- **Implementation intent**: For models whose providers support a seed, add a seed field to the generate form, thread it through FormData → validation schema → the relevant strategies, persist it in history, and display it on the image detail page. Gate visibility by a new `supportsSeed` capability on `MODEL_REGISTRY`.
- **Acceptance criteria**: Seed is settable where supported, used by the provider call, saved with the image, and re-loadable via M3; unsupported models hide the field; gate passes.

### Roadmap notes

- M1 → M7 have a soft dependency (cost preview is reused in comparison). M3 → M9 (re-run benefits from seed). Otherwise items are independent and can ship in the listed order.
- Reliability work (the doc/config drift in §2) is folded into M1 because it directly unlocks correct cost behavior; broader cleanup is intentionally **not** enumerated here to keep the roadmap product-focused.
- Do not introduce major new product directions (e.g. custom model training, full inpainting suite) without explicit product direction — they are out of scope for the current app shape.

---

## Appendix A — Historical notes

- A prior code-quality pass introduced Zod validation and standardized error handling (now baseline). A later runtime env-validation helper (`utils/env.ts`) was added but never wired up and has since been removed as dead code along with several other orphaned files.
- A stabilization/hardening pass fixed two verified authorization bugs (client credit-forging via `PATCH /api/profile`, and cross-user deletion of public images) and added a small Vitest suite for route-protection, profile sanitization, and storage URL allowlisting. These are reflected in §2.
- A codebase-improvement pass aligned `.env.example`, README model docs, and public model copy with `MODEL_REGISTRY`, and added `src/constants/modelRegistry.test.ts` so removed-model credit vars and missing provider env vars are caught locally.
- A competitive analysis of Leonardo.ai informed this roadmap. Key takeaways carried forward: cost transparency (M1), search/management table stakes (M2, M4), and open-source/BYOK + simplicity as differentiators (reflected in the product goals and M5–M8).
