# Generate.me AI — Product Specification & Roadmap

Authoritative product spec for Generate.me AI. This is the source of truth for product scope and current behavior. The punchlist lives in `roadmap.md`. Engineering conventions live in `AGENTS.md`. Setup lives in `README.md`.

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
- Models (image): GPT Image (OpenAI) is the only model offered. Stability SD3.5 Turbo, FLUX.2 Pro (Replicate), and Ideogram 3.0 are registered with `hidden: true`: they don't appear on the generate page, `?model=` links fall back to GPT Image, `/api/generate/image` rejects them before charging, and their API-key fields are hidden on the profile page (saved keys are kept). Unhide each one once its provider integration works again. **(inferred: the registry is the source of truth; older Playground V2/V2.5, Fireworks SDXL, and FLUX Kontext Pro entries are no longer registered.)**
- Prompt enrichment via style, color scheme, lighting, perspective, composition, medium, mood (Factory-pattern option sets).
- Aspect-ratio selection, negative prompts, and multi-image counts — gated per-model by `MODEL_REGISTRY` capabilities (`supportsAspectRatio`, `supportsNegativePrompt`, `maxImages`).
- Image-to-image reference upload for models that support it.
- AI prompt optimization and AI tag suggestions (OpenAI). Typing a prompt does not call those routes. The enhance control and the tag Suggestions button show the ChatGPT credit cost, and that is the amount those actions charge. The generate button shows `creditsToMinus(model) × imageCount`, which is the amount image generation charges.
- Voice prompt input (Web Speech API).
- Live streaming progress UI (started → generating → uploading X/Y → complete/error).

**Video & media**
- D-ID talking avatars (script-to-speech via Amazon voices) and silent animations.
- RunwayML image-to-video.
- GIF conversion (FFmpeg via `ffmpeg-static`). A finished video is saved on a new gallery cover as `videoDownloadUrl`. The owner then sees **Create GIF** on that page. GIF conversion does not charge credits.
- Background removal (Bria AI).
- Both video providers run a poll-until-ready loop inside the request (`maxDuration = 300`, Node runtime). **(inferred: there is no separate job queue or cron — long jobs complete within the request.)**

**Gallery & sharing**
- Private gallery of generated media with a paginated grid and tag filtering, loaded newest-first from `GET /api/images`; a failed load shows a retryable error instead of an empty gallery.
- Per-image detail page: metadata, tags (CRUD), caption, background color, download.
- Public sharing: copy an image into `publicImages/{id}` with an optional password and social-share buttons. A locked public image is returned without its media URLs or password; `POST /api/images/:id/access` checks the password and then returns the media. The home page shows recent unprotected public images from a tagged cache; sharing, unsharing, editing, deleting, or deleting the account expires that cache so changes appear on the next request.

**Accounts, profile & payments**
- Firebase auth: Google, email/password on dedicated `/login` and `/signup` pages, `/forgot-password`, and passwordless email link, with mapped inline errors and a show/hide password control. A signed-out visit to a protected page goes to `/login` and returns there after sign-in.
- Profile: store per-provider API keys, toggle credits vs BYOK, view credit balance. The first server read creates the profile with `STARTING_CREDITS` (1000). Later reads return the stored balance, including zero. The client displays that number.
- Stripe credit purchases (PaymentIntent) and a payment-history view.

### Current user flows

- **Auth flow**: `/login`, `/signup`, and `/forgot-password` (`AuthPageForm`) → Firebase sign-in → `POST /api/auth/session` verifies the ID token and sets an HttpOnly cookie, then the form does a full-page navigation (so router-cache redirects prefetched while signed out are discarded) → returns to the `?redirect=` page the proxy set, or `/generate` → `proxy.ts` allows protected routes → API routes verify the token with Admin SDK. `/api/auth/sync` stores sign-in metadata only. Email/password signup sends a verification email; platform-credit generation requires `email_verified` on the token.
- **Generate flow**: `useImageGenerator` builds a prompt (the description plus chosen option labels; options left at None add nothing) + FormData → streams `/api/generate/image`. The route reserves `creditsToMinus(model) × bounded imageCount` before the provider call, refunds that reserve if generation or upload fails, stores the media, and writes the gallery cover before `complete`. The client then refreshes profile credits and fills style metadata on that same cover. Video, tag suggestions, and background removal reserve their model cost before the provider call and refund it if that work fails. A refunded image failure ends with "Your credits were refunded." in the error event, and an unaffordable request fails as `INSUFFICIENT_CREDITS` (402 on JSON routes) before any charge.
- **Image detail flow**: `useImagePageData` loads owner data (falls back to public copy) → owner actions (share/delete/tags/caption/background/video) call `/api/images/[id]*`. Delete and background removal ask for confirmation in a native `<dialog>` first.
- **Payment flow**: create a PaymentIntent for the published pack only (`9999` cents → `10000` credits), bound to the signed-in uid → Stripe Elements → process/validate. Process grants credits once, inside a transaction keyed by the PaymentIntent id.

### Existing integrations

OpenAI (DALL·E/GPT Image, GPT prompt+tags), Stability AI, Replicate (FLUX), Ideogram, D-ID, RunwayML, Bria AI; Firebase (Auth/Firestore/Storage); Stripe; Vercel (hosting/AI SDK).

### Current architecture summary

- **Next.js 16 App Router**, Node-runtime API routes do all privileged work; `src/proxy.ts` is a soft auth gate (cookie presence only). No `middleware.ts`.
- **Client → `src/actions/*` (client wrappers) → `src/lib/api/client.ts` → `/api/*` route → Firebase Admin.** Uniform `ActionResult<T>` envelope; image generation streams NDJSON.
- **Strategy Pattern** for image providers (`src/strategies`), **Model Registry** as single source of truth (`src/constants/modelRegistry.ts`), **Factory Pattern** for option sets.
- **Server-side credits** (`creditValidator.ts`, transactional deduction of per-image cost times bounded image count, refunded if the provider call fails); client profile updates are an allowlist (`PATCH /api/profile` drops `credits`, `emailVerified`, and unknown fields) and image mutations are owner-scoped before touching the public mirror; credit purchases accept only the published pack and grant it once per PaymentIntent, including from a signed `payment_intent.succeeded` webhook when `STRIPE_WEBHOOK_SECRET` is set; generation is capped at 20 attempts per minute; **Zod** validation at every boundary; **typed errors** + `ActionResult`.
- **Zustand** stores for auth/profile/generation/payments.
- **Data model (Firestore)**: `users/{uid}` (auth metadata), `users/{uid}/profile/userData` (credits, keys, settings), `users/{uid}/payments/{id}`, `users/{uid}/rateLimit/generation`, `profiles/{uid}/covers/{id}` (gallery), `publicImages/{id}` (shared copies). Media in Storage under `generated/{uid}/*`, `image-references/{uid}/*`, and `video-generation/{uid}/*`, served via signed URLs. The client SDK cannot write those objects.

### Existing technical constraints

- Long-running video/GIF jobs must finish inside one request (Vercel `maxDuration` ≤ 300; Hobby plan caps at 60s). **(inferred constraint.)**
- Provider rate limits and per-provider API differences are absorbed in strategies/routes; failures surface as `ExternalApiError`.
- **FLUX Kontext Pro was removed** after Fireworks stopped serving every FLUX model serverless on 2026-07-22 (its endpoint returned 404). Old images with that model still display, and "Try again" falls back to the default model.
- **No Firestore backups or error monitoring** are configured (checked 2026-10-20), so a restore drill is not possible yet. Owner action: enable a backup schedule or PITR and an error monitor, then run one restore into a scratch database.
- Build/runtime require many env vars (Firebase Admin + client, provider keys, Stripe, credit costs, cookie name).

### Known limitations

- **Route-level tests, no browser end-to-end suite.** Vitest covers the critical API routes (generate, gallery, share, delete, payments, credits), route protection, prompt assembly, and preview assets; the Firestore rules suite runs in the emulator. GitHub Actions runs lint, typecheck, tests, React Doctor, build, and the rules job on `dev` and `main`. UI flows are verified manually.
- **Public-image password is stored in plaintext** in the public doc and checked on the server. It is not returned to the client and it is not a real secret (documented in `README.md` and `firestore.rules`).
- **Gallery has tag filtering and pagination but no free-text prompt search and no bulk operations.** **(inferred.)**
- **Credit costs are shown on the action that charges them.** The generate button, video Generate button, prompt enhance control, and tag Suggestions button use the same `creditsToMinus` price the server deducts. Typing a prompt does not spend credits.
- **No reproducibility controls** (seed) and **no upscaling** — both are table stakes for the category.
- **`publicImages` exists but there is no community/discovery feed** — sharing is per-link only. **(inferred.)**
- **Registry/env drift guard exists.** A unit test verifies `.env.example` lists every provider API key and exactly the public credit env vars declared in `MODEL_REGISTRY`, preventing the DALL·E/GPT Image credit-key typo and removed-model credit vars from returning. **(inferred.)**

---

## 3. Roadmap

The punchlist, known bugs, and open issues live in `roadmap.md`.

---

## Appendix A — Historical notes

- A prior code-quality pass introduced Zod validation and standardized error handling (now baseline). A later runtime env-validation helper (`utils/env.ts`) was added but never wired up and has since been removed as dead code along with several other orphaned files.
- A stabilization/hardening pass fixed two verified authorization bugs (client credit-forging via `PATCH /api/profile`, and cross-user deletion of public images) and added a small Vitest suite for route-protection, profile sanitization, and storage URL allowlisting. These are reflected in §2.
- A codebase-improvement pass aligned `.env.example`, README model docs, and public model copy with `MODEL_REGISTRY`, and added `src/constants/modelRegistry.test.ts` so removed-model credit vars and missing provider env vars are caught locally.
- A competitive analysis of Leonardo.ai informed this roadmap. Key takeaways carried forward: cost transparency (M1), search/management table stakes (M2, M4), and open-source/BYOK + simplicity as differentiators (reflected in the product goals and M5–M8).
