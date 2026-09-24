# Generate.me AI

Open-source AI image and video generation for creators. Sign in, pick a model, describe what you want, and generate — pay with platform credits (Stripe) or bring your own provider API keys (BYOK). Live at [https://generate.me](https://generate.me).

## Features

- **Multi-provider image generation** — GPT Image (OpenAI), Stability SD3.5 Turbo, FLUX.2 Pro (Replicate), FLUX Kontext Pro (Fireworks), Ideogram 3.0
- **Style controls** — art style, color, lighting, perspective, composition, medium, mood; aspect ratios; negative prompt (where supported); multi-image counts
- **Image-to-image** reference upload for supported models
- **Video** — D-ID talking avatars and RunwayML image-to-video; GIF conversion via FFmpeg
- **Utilities** — AI prompt optimization, AI tag suggestions (OpenAI), background removal (Bria AI), voice prompt input (Web Speech API)
- **Gallery** — personal history with tag filtering and per-image detail pages
- **Sharing** — publish to a public URL (optional non-secret password), social share, download
- **Profile** — credit balance, per-provider BYOK keys, payment history
- **Auth** — Firebase Google, email/password, and passwordless email-link sign-in
- **Payments** — Stripe PaymentIntent credit packs

## Tech stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js ^16.3.6 (App Router, Turbopack dev) |
| UI | React ^19.2.5, Tailwind CSS ^4.2.4, Framer Motion, Lucide / react-icons |
| Language | TypeScript ^6.0.3 |
| State | Zustand ^5.0.12 |
| Backend | Firebase client ^12.12.1 + Firebase Admin ^13.8.0 (Auth, Firestore, Storage) |
| AI | Vercel AI SDK (`ai` ^6, `@ai-sdk/openai`), Replicate SDK, direct REST (Stability, Ideogram, Fireworks, D-ID, RunwayML, Bria) |
| Payments | Stripe ^22 + `@stripe/react-stripe-js` |
| Validation | Zod ^4.3.6 |
| Media | `sharp`, `fluent-ffmpeg` + `ffmpeg-static`, `dom-to-image` |
| Tests / quality | Vitest ^4.1.8, ESLint 10, React Doctor |

## Project structure

```
src/
  app/                 # Pages + API route handlers
    api/
      auth/sync/       # Sign-in metadata
      generate/        # image (NDJSON stream), video, gif, tags, optimize-prompt, background-removal
      images/[imageId] # GET/PATCH/DELETE + /share
      payments/        # intent, process, validate
      profile/         # profile + payments list
      history/         # save generation record
      previews/        # model/style preview listing
  actions/             # Client wrappers that call /api/* (not server actions)
  lib/api/             # apiGet/apiPost helpers + withAuth / ActionResult envelope
  strategies/          # Image provider Strategy Pattern (dalle, stability, replicate, ideogram, fireworksKontext)
  constants/           # modelRegistry (source of truth), options, routes
  firebase/            # Client + Admin SDK setup
  components/          # UI by domain (generate, gallery, auth, profile, …)
  zustand/             # Auth, profile, generation, payments stores
  utils/               # Auth, credits, validation, storage helpers
firestore.rules  storage.rules  .env.example
```

Architecture notes: privileged work runs in Node API routes with Firebase Admin. The edge `src/proxy.ts` only soft-checks for an auth cookie; real auth verifies the Firebase ID token server-side. Image generation streams NDJSON progress events.

## Getting started

### Prerequisites

- Node.js 22+
- npm
- Firebase project (Auth, Firestore, Storage)
- Stripe account (for credit purchases)
- Provider API keys for the models you want to enable

### Install

```bash
git clone https://github.com/brown2020/generatemeai.git
cd generatemeai
cp .env.example .env.local
# Fill in values (see table below) — never commit real secrets
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Deploy Firestore and Storage rules from this repo (`firestore.rules`, `storage.rules`) to your Firebase project before relying on production-like security.

## Environment variables

Copy `.env.example` to `.env.local`. Use placeholders only — never commit real keys.

| Name | Purpose | Where to get it |
| --- | --- | --- |
| `FIREBASE_TYPE` | Admin service account type (usually `service_account`) | Firebase Console → Project settings → Service accounts |
| `FIREBASE_PROJECT_ID` | Admin project id | Same |
| `FIREBASE_PRIVATE_KEY_ID` | Admin private key id | Same |
| `FIREBASE_PRIVATE_KEY` | Admin private key (PEM) | Same |
| `FIREBASE_CLIENT_EMAIL` | Admin client email | Same |
| `FIREBASE_CLIENT_ID` | Admin client id | Same |
| `FIREBASE_AUTH_URI` | OAuth auth URI | Usually Google default in `.env.example` |
| `FIREBASE_TOKEN_URI` | OAuth token URI | Usually Google default in `.env.example` |
| `FIREBASE_AUTH_PROVIDER_X509_CERT_URL` | Cert URL | Usually Google default in `.env.example` |
| `FIREBASE_CLIENT_CERTS_URL` | Client certs URL | Service account JSON |
| `FIREBASE_UNIVERSE_DOMAIN` | Universe domain | Usually `googleapis.com` |
| `NEXT_PUBLIC_FIREBASE_APIKEY` | Client Firebase API key | Firebase Console → Project settings |
| `NEXT_PUBLIC_FIREBASE_AUTHDOMAIN` | Client auth domain | Same |
| `NEXT_PUBLIC_FIREBASE_PROJECTID` | Client project id | Same |
| `NEXT_PUBLIC_FIREBASE_STORAGEBUCKET` | Storage bucket | Same |
| `NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID` | Messaging sender id | Same |
| `NEXT_PUBLIC_FIREBASE_APPID` | App id | Same |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENTID` | Analytics measurement id (optional) | Same |
| `NEXT_PUBLIC_COOKIE_NAME` | Name of the auth ID-token cookie | Choose a stable cookie name |
| `OPENAI_API_KEY` | OpenAI / GPT Image + prompt/tag helpers | [platform.openai.com](https://platform.openai.com) |
| `OPENAI_ORG_ID` | OpenAI org id (optional) | Same |
| `STABILITY_API_KEY` | Stability SD3.5 Turbo | [platform.stability.ai](https://platform.stability.ai) |
| `REPLICATE_API_KEY` | FLUX via Replicate | [replicate.com](https://replicate.com) |
| `FIREWORKS_API_KEY` | FLUX Kontext Pro | [fireworks.ai](https://fireworks.ai) |
| `IDEOGRAM_API_KEY` | Ideogram 3.0 | [ideogram.ai](https://ideogram.ai) |
| `DID_API_KEY` | D-ID video | [d-id.com](https://www.d-id.com) |
| `RUNWAYML_API_SECRET` | RunwayML video | [runwayml.com](https://runwayml.com) |
| `BRIA_AI_API_KEY` | Background removal | [bria.ai](https://bria.ai) |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe publishable key | Stripe Dashboard |
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe Dashboard |
| `NEXT_PUBLIC_STRIPE_PRODUCT_NAME` | Display name for credit product | Your choice / Stripe product |
| `NEXT_PUBLIC_CREDITS_PER_*` | Per-model credit costs (see `.env.example`) | Tune for your pricing |
| `NEXT_PUBLIC_ENABLE_PREVIEW_MARKING` | Toggle preview watermarking | `true` / `false` |

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run doctor` | React Doctor checks |

## Testing and CI

- Unit tests (Vitest) cover model registry, routes, credit reserve, and related API helpers.
- `.github/workflows/ci.yml` on `dev` / `main`: lint → typecheck → unit tests → React Doctor → production build (build env from Actions secrets only).
- A separate malware IOC scan workflow runs via `scripts/malware-scan.sh`.

## Firebase / services setup

1. Enable Email/Password, Google, and Email link auth as needed.
2. Deploy `firestore.rules` and `storage.rules` (client reads are owner-scoped; privileged writes use Admin SDK).
3. Configure Storage CORS if browsers upload/download across origins (`cors.json` / `firebase-cors.json` are included as references).
4. Wire Stripe products/prices to match your credit packs (`src/constants/creditPack.ts`).

## Deployment

Designed for Vercel (or any Node-capable Next.js host). Set the same env vars in the host dashboard. Point custom domains (e.g. generate.me) at the deployment. Do not embed secrets in workflow YAML — use host / Actions secrets.

## Contributing

1. Branch from `dev`.
2. Prefer new API route handlers over server actions; keep `MODEL_REGISTRY` as the single source of truth for models.
3. Run `npm run lint`, `npm run typecheck`, and `npm test` before opening a PR.
4. Never commit `.env.local` or real API keys.

## License

GNU Affero General Public License v3.0 — see [LICENSE.md](LICENSE.md).
