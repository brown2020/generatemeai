# Generate.me AI

<p align="center">
  <img src="public/favicon.ico" alt="Generate.me Logo" width="80" height="80">
</p>

<p align="center">
  <strong>A powerful AI-powered image and video generation platform</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#supported-ai-models">AI Models</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js" alt="Next.js 16.1.6">
  <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react" alt="React 19.2.4">
  <img src="https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript" alt="TypeScript 5.9.3">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.1.18-38B2AC?logo=tailwind-css" alt="Tailwind CSS 4.1.18">
  <img src="https://img.shields.io/badge/Firebase-12.8.0-FFCA28?logo=firebase" alt="Firebase 12.8.0">
  <img src="https://img.shields.io/badge/Zustand-5.0.11-brown" alt="Zustand 5.0.11">
  <img src="https://img.shields.io/badge/Vercel_AI_SDK-6.0.67-black?logo=vercel" alt="Vercel AI SDK 6.0.67">
  <img src="https://img.shields.io/badge/Zod-4.3.6-3E67B1" alt="Zod 4.3.6">
  <img src="https://img.shields.io/badge/License-AGPL--3.0-blue" alt="AGPL-3.0 License">
</p>

---

## Overview

Generate.me AI is a full-stack application that enables users to create custom images and videos using multiple AI providers. The platform supports various artistic styles, lighting conditions, color schemes, and advanced generation parameters. Users can either provide their own API keys or purchase credits to access generation features.

Built with modern React patterns, this project showcases best practices including:

- **React Server Components** with Next.js 16 App Router
- **Zustand** for efficient state management
- **Zod 4** for TypeScript-first schema validation
- **Strategy Pattern** for AI provider abstraction
- **Factory Pattern** for option configuration
- **Unified Model Registry** as single source of truth for models, credits, and API keys
- **Custom Hooks** for reusable logic
- **TypeScript** strict mode throughout

---

## Features

### 🎨 Image Generation

- **Multiple AI Models**: Support for DALL-E, Stable Diffusion XL, Flux Schnell, Ideogram, and more
- **Style Customization**: 20+ artistic styles from Renaissance to Contemporary Art
- **Advanced Parameters**: Control lighting, color scheme, perspective, composition, medium, and mood
- **Image-to-Image**: Use reference images to guide generation (supported models)
- **Prompt Enhancement**: AI-powered prompt optimization using GPT-4
- **Voice Input**: Speak your prompts with Web Speech API integration

### 🎬 Video Generation

- **Talking Avatars**: Create talking head videos with D-ID
- **Video Animation**: Transform images into videos with Runway ML
- **GIF Conversion**: Convert videos to GIF format using FFmpeg
- **Audio Support**: Add voiceovers to generated videos

### 👤 User Management

- **Firebase Authentication**: Google Sign-In, email/password, and passwordless email links
- **Profile Management**: Store and manage multiple API keys securely
- **Credit System**: Pay-per-use credit system or bring your own API keys
- **Image History**: Browse, search, and manage all generated content

### 💳 Payment Integration

- **Stripe Integration**: Secure payment processing
- **Credit Purchases**: Buy credits for generation usage
- **Transaction History**: View all payment records

### 🔗 Social Features

- **Image Sharing**: Share generated images publicly with optional password protection
- **Social Sharing**: Share to Facebook, Twitter, LinkedIn, and Email
- **Tags & Categories**: Organize and search generated content

---

## Supported AI Models

### Image Generation

| Model                   | Provider                     | Features                         |
| ----------------------- | ---------------------------- | -------------------------------- |
| **DALL-E**              | OpenAI                       | Text-to-image, high quality      |
| **Stable Diffusion XL** | Fireworks AI                 | Text-to-image, image-to-image    |
| **SD3-Turbo**           | Stability AI                 | Fast generation, text-to-image   |
| **Playground V2**       | Fireworks AI                 | Aesthetic-focused generation     |
| **Playground V2.5**     | Fireworks AI                 | Enhanced 1024px aesthetic output |
| **Flux Schnell**        | Replicate (Blackforest Labs) | Fast, high-quality generation    |
| **Ideogram AI**         | Ideogram                     | Text rendering, typography       |

### Video Generation

| Model         | Provider | Features                              |
| ------------- | -------- | ------------------------------------- |
| **D-ID**      | D-ID     | Talking avatars, lip sync, animations |
| **Runway ML** | Runway   | Image-to-video animation              |

### Additional Services

| Service                 | Provider     | Features                           |
| ----------------------- | ------------ | ---------------------------------- |
| **Background Removal**  | Bria AI      | Remove image backgrounds           |
| **Prompt Optimization** | OpenAI GPT-4 | Enhance prompts for better results |
| **Tag Suggestions**     | OpenAI GPT-4 | AI-powered tag recommendations     |

---

## Tech Stack

### Core Framework

| Package                                       | Version | Description                                 |
| --------------------------------------------- | ------- | ------------------------------------------- |
| [Next.js](https://nextjs.org/)                | 16.1.6  | React framework with App Router & Turbopack |
| [React](https://react.dev/)                   | 19.2.4  | UI library with Server Components           |
| [TypeScript](https://www.typescriptlang.org/) | 5.9.3   | Type-safe JavaScript                        |

### State Management

| Package                                  | Version | Description                  |
| ---------------------------------------- | ------- | ---------------------------- |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5.0.11  | Lightweight state management |

### Styling & UI

| Package                                                     | Version | Description                 |
| ----------------------------------------------------------- | ------- | --------------------------- |
| [Tailwind CSS](https://tailwindcss.com/)                    | 4.1.18  | Utility-first CSS framework |
| [Framer Motion](https://www.framer.com/motion/)             | 12.29.2 | Animation library           |
| [Lucide React](https://lucide.dev/)                         | 0.563.0 | Icon library                |
| [React Icons](https://react-icons.github.io/react-icons/)   | 5.5.0   | Additional icons            |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | 3.4.0   | Merge Tailwind classes      |
| [clsx](https://github.com/lukeed/clsx)                      | 2.1.1   | Class name utility          |

### Backend & Database

| Package                                                                     | Version | Description                        |
| --------------------------------------------------------------------------- | ------- | ---------------------------------- |
| [Firebase](https://firebase.google.com/)                                    | 12.8.0  | Authentication, Firestore, Storage |
| [Firebase Admin](https://firebase.google.com/docs/admin/setup)              | 13.6.0  | Server-side Firebase SDK           |
| [react-firebase-hooks](https://github.com/CSFrequency/react-firebase-hooks) | 5.1.1   | React hooks for Firebase           |

### AI Integration

| Package                                                                   | Version | Description                     |
| ------------------------------------------------------------------------- | ------- | ------------------------------- |
| [Vercel AI SDK](https://sdk.vercel.ai/)                                   | 6.0.67  | AI SDK core                     |
| [@ai-sdk/openai](https://sdk.vercel.ai/providers/ai-sdk-providers/openai) | 3.0.25  | OpenAI provider                 |
| [@ai-sdk/rsc](https://sdk.vercel.ai/docs/api-reference/ai-sdk-rsc)        | 2.0.67  | React Server Components support |
| [Replicate](https://replicate.com/)                                       | 1.4.0   | Replicate API client            |

### Payments

| Package                                                            | Version | Description             |
| ------------------------------------------------------------------ | ------- | ----------------------- |
| [Stripe](https://stripe.com/)                                      | 20.3.0  | Payment processing      |
| [@stripe/react-stripe-js](https://stripe.com/docs/stripe-js/react) | 5.6.0   | React Stripe components |
| [@stripe/stripe-js](https://stripe.com/docs/js)                    | 8.7.0   | Stripe.js               |

### Media Processing

| Package                                                              | Version | Description                       |
| -------------------------------------------------------------------- | ------- | --------------------------------- |
| [Sharp](https://sharp.pixelplumbing.com/)                            | 0.34.5  | High-performance image processing |
| [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) | 2.1.3   | FFmpeg wrapper                    |
| [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static)         | 5.2.0   | Static FFmpeg binaries            |
| [dom-to-image](https://github.com/tsayen/dom-to-image)               | 2.6.0   | DOM to image conversion           |

### Validation

| Package                 | Version | Description                        |
| ----------------------- | ------- | ---------------------------------- |
| [Zod](https://zod.dev/) | 4.3.6   | TypeScript-first schema validation |

### UI Components

| Package                                                                        | Version | Description              |
| ------------------------------------------------------------------------------ | ------- | ------------------------ |
| [React Modal](https://reactcommunity.org/react-modal/)                         | 3.16.1  | Accessible modal dialogs |
| [React Select](https://react-select.com/)                                      | 5.8.1   | Select input component   |
| [React Hot Toast](https://react-hot-toast.com/)                                | 2.4.1   | Toast notifications      |
| [React Spinners](https://www.davidhu.io/react-spinners/)                       | 0.17.0  | Loading spinners         |
| [React Share](https://github.com/nygardk/react-share)                          | 5.1.0   | Social sharing buttons   |
| [react-textarea-autosize](https://github.com/Andarist/react-textarea-autosize) | 8.5.3   | Auto-resizing textarea   |
| [react-cookie-consent](https://github.com/Mastermindzh/react-cookie-consent)   | 10.0.1  | Cookie consent banner    |

### Utilities

| Package                                                     | Version | Description                 |
| ----------------------------------------------------------- | ------- | --------------------------- |
| [cookies-next](https://github.com/andreizanik/cookies-next) | 6.1.1   | Cookie handling for Next.js |
| [formdata-node](https://github.com/octet-stream/form-data)  | 6.0.3   | FormData implementation     |

### Development

| Package                         | Version | Description    |
| ------------------------------- | ------- | -------------- |
| [ESLint](https://eslint.org/)   | 9.15.0  | Code linting   |
| [PostCSS](https://postcss.org/) | 8.4.47  | CSS processing |

---

## Quick Start

### Prerequisites

- **Node.js 20+** (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- **Firebase Project** with Firestore, Storage, and Authentication enabled
- **API Keys** for at least one AI provider (OpenAI, Fireworks, or Replicate)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/brown2020/generatemeai.git
   cd generatemeai
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration (see [Environment Variables](#environment-variables)).

4. **Set up Firebase**

   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Google, Email/Password, Email Link)
   - Create a Firestore database
   - Create a Storage bucket
   - Download your service account key for server-side operations

   **Deploy security rules (recommended):**

   - Firestore rules: `firestore.rules`
   - Storage rules: `storage.rules`

   With Firebase CLI installed/configured:

   ```bash
   firebase deploy --only firestore:rules,storage
   ```

---

## Firebase Security Rules

This repo includes production-ready Firebase rules that **protect user-generated content by default**:

- **Firestore (`firestore.rules`)**

  - Private content: `profiles/{uid}/covers/{id}` is **owner-only** read/write.
  - Private user data: `users/{uid}/**` is **owner-only** read/write.
  - Public sharing: `publicImages/{imageId}` supports **public `get`** (no `list`) to avoid noisy permission errors when a doc is missing/unshared. Only the owner can **create/update/delete** (must have `profiles/{auth.uid}/covers/{imageId}`), and shared docs are enforced to be written with `isSharable == true`.
  - **Note on “password protection”**: passwords are stored in the public doc today; do not treat it as a secret.

- **Storage (`storage.rules`)**
  - Private user uploads: `generated/{uid}/*` and `image-references/{uid}/*` are **owner-only** read/write (with basic image + size limits).
  - Public static assets: `previews/**` is public read.
  - Server-only artifacts: `video-generation/*` is denied for SDK access (served via signed URLs).

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm start
```

---

## Environment Variables

Create a `.env.local` file in the root directory:

### Firebase Configuration (Required)

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_APIKEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECTID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=your_sender_id
NEXT_PUBLIC_FIREBASE_APPID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENTID=G-XXXXXXXXXX

# Firebase Admin SDK (Server-side)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERTS_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_service_account
```

### AI Provider API Keys (At least one required)

```env
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...                    # Optional
FIREWORKS_API_KEY=fw_...
REPLICATE_API_KEY=r8_...
STABILITY_API_KEY=sk-...
IDEOGRAM_API_KEY=...
DID_API_KEY=...
BRIA_AI_API_KEY=...
```

### Stripe Configuration (For payments)

```env
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_KEY=pk_...
NEXT_PUBLIC_STRIPE_PRODUCT_NAME=...
```

### Credit Configuration

```env
NEXT_PUBLIC_CREDITS_PER_DALL_E_IMAGE=4
NEXT_PUBLIC_CREDITS_PER_STABLE_DIFFUSION_XL_IMAGE=4
NEXT_PUBLIC_CREDITS_PER_STABILITY_SD3_TURBO_IMAGE=4
NEXT_PUBLIC_CREDITS_PER_PLAYGROUND_V2_IMAGE=4
NEXT_PUBLIC_CREDITS_PER_PLAYGROUND_V2_5_IMAGE=4
NEXT_PUBLIC_CREDITS_PER_FLUX_SCHNELL=4
NEXT_PUBLIC_CREDITS_PER_D_ID=50
NEXT_PUBLIC_CREDITS_PER_RUNWAY=4
NEXT_PUBLIC_CREDITS_PER_IDEOGRAM=4
NEXT_PUBLIC_CREDITS_PER_BRIA_IMAGE=4
NEXT_PUBLIC_CREDITS_PER_CHATGPT=2
```

### Application Settings

```env
NEXT_PUBLIC_COOKIE_NAME=generateAuthToken
NEXT_PUBLIC_ENABLE_PREVIEW_MARKING=false
```

---

## Project Structure

```
generatemeai/
├── public/                          # Static assets
│   ├── previews/                    # Model/style preview images
│   └── .well-known/                 # App association files
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── api/previews/            # API routes
│   │   ├── generate/                # Image generation page
│   │   ├── images/                  # Gallery & detail pages
│   │   │   └── [id]/                # Dynamic image page
│   │   ├── profile/                 # User profile
│   │   ├── payment-attempt/         # Payment checkout
│   │   ├── payment-success/         # Payment confirmation
│   │   ├── loginfinish/             # Email link auth handler
│   │   └── [legal pages]/           # About, Terms, Privacy, Support
│   │
│   ├── actions/                     # Server Actions
│   │   ├── generateImage.ts         # Image generation orchestration
│   │   ├── generateVideo.ts         # Video generation (D-ID, Runway)
│   │   ├── generateGif.ts           # GIF conversion (FFmpeg)
│   │   ├── generateResponse.ts      # AI text responses
│   │   ├── suggestTags.ts           # AI tag suggestions (AI SDK)
│   │   ├── removeBackground.ts      # Background removal (Bria AI)
│   │   └── paymentActions.ts        # Stripe payment processing
│   │
│   ├── components/                  # React components
│   │   ├── auth/                    # Authentication components
│   │   │   └── AuthModal.tsx        # Sign-in modal
│   │   ├── common/                  # Shared UI components
│   │   │   └── PaginatedGrid.tsx    # Generic paginated grid
│   │   ├── generate/                # Image generation form
│   │   │   ├── GeneratedImagePreview.tsx
│   │   │   ├── GenerationSettings.tsx
│   │   │   └── PromptInput.tsx
│   │   ├── generation/              # Generation UI elements
│   │   │   ├── SelectableCard.tsx   # Model/style selector card
│   │   │   ├── SettingsSelector.tsx # Option selector component
│   │   │   ├── PreviewCard.tsx      # Preview image card
│   │   │   └── PreviewMarker.tsx    # Mark as preview feature
│   │   ├── home/                    # Landing page sections
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesGrid.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── ImageShowcase.tsx
│   │   │   └── CTASection.tsx
│   │   ├── image/                   # Image display components
│   │   │   ├── ImageViewer.tsx      # Main image display
│   │   │   ├── ImageActions.tsx     # Share, delete actions
│   │   │   ├── ImageMetadata.tsx    # Metadata display
│   │   │   ├── TagManager.tsx       # Tag CRUD operations
│   │   │   ├── SocialShare.tsx      # Social sharing buttons
│   │   │   ├── PasswordModal.tsx    # Password protection modal
│   │   │   ├── PasswordProtection.tsx
│   │   │   └── ColorPickerModal.tsx
│   │   ├── image-page/              # Image page logic (hooks)
│   │   │   ├── useImagePageData.ts  # Data fetching hook
│   │   │   ├── useImagePageActions.ts
│   │   │   ├── ImagePageModals.tsx
│   │   │   └── ImagePageOwnerActions.tsx
│   │   ├── images/                  # Gallery components
│   │   │   ├── ImageGrid.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── TagFilter.tsx
│   │   │   └── Pagination.tsx
│   │   ├── layouts/                 # Layout components
│   │   │   ├── createPageLayout.tsx
│   │   │   └── PageWithFooter.tsx
│   │   ├── navigation/              # Navigation components
│   │   │   └── NavItem.tsx
│   │   ├── profile/                 # Profile components
│   │   │   └── ApiKeyInput.tsx
│   │   ├── ui/                      # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── IconButton.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── Skeleton.tsx
│   │   └── [page components]        # Full page components
│   │
│   ├── constants/                   # Configuration constants
│   │   ├── modelRegistry.ts         # Unified model registry (single source of truth)
│   │   ├── optionFactory.ts         # Factory for option sets
│   │   ├── artStyles.ts             # 20 art style definitions
│   │   ├── colors.ts                # 16 color scheme options
│   │   ├── lightings.ts             # Lighting options
│   │   ├── perspectives.ts          # Perspective options
│   │   ├── compositions.ts          # Composition options
│   │   ├── mediums.ts               # Medium options
│   │   ├── moods.ts                 # Mood options
│   │   ├── animations.ts            # D-ID animation types
│   │   ├── audios.ts                # Audio options for video
│   │   ├── apiKeys.ts               # API key form configuration
│   │   ├── routes.ts                # Application routes
│   │   └── menuItems.ts             # Navigation menu items
│   │
│   ├── firebase/                    # Firebase configuration
│   │   ├── firebaseClient.ts        # Client SDK initialization
│   │   ├── firebaseAdmin.ts         # Admin SDK initialization
│   │   └── paths.ts                 # Firestore path utilities
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── index.ts                 # Barrel exports
│   │   ├── useAuth.ts               # Authentication utilities
│   │   ├── useAuthLogic.ts          # Auth form state/handlers
│   │   ├── useAuthToken.ts          # JWT token management
│   │   ├── useImageGenerator.ts     # Image generation orchestration
│   │   ├── useGenerationHistory.ts  # Save to Firestore
│   │   ├── useNavigation.ts         # Navigation utilities
│   │   ├── usePreviewSaver.ts       # Preview saving logic
│   │   ├── useSpeechRecognition.ts  # Web Speech API integration
│   │   ├── useUrlSync.ts            # URL parameter sync
│   │   ├── useDebounce.ts           # Debounce utilities
│   │   └── useClipboard.ts          # Clipboard utilities
│   │
│   ├── strategies/                  # AI provider strategies (Strategy Pattern)
│   │   ├── types.ts                 # Strategy interface
│   │   ├── index.ts                 # Strategy registry & lookup
│   │   ├── dalle.ts                 # OpenAI DALL-E
│   │   ├── fireworks.ts             # Fireworks AI (SDXL, Playground)
│   │   ├── replicate.ts             # Replicate (Flux Schnell)
│   │   ├── stability.ts             # Stability AI (SD3-Turbo)
│   │   └── ideogram.ts              # Ideogram AI
│   │
│   ├── styles/                      # Design system
│   │   └── tokens.ts                # Design tokens (colors, spacing, typography)
│   │
│   ├── types/                       # TypeScript definitions
│   │   ├── image.ts                 # Image data types
│   │   ├── generation.ts            # Generation types
│   │   ├── model.ts                 # Model types
│   │   ├── menu.ts                  # Menu types
│   │   ├── promptdata.ts            # Prompt data types
│   │   └── [type declarations]      # .d.ts files
│   │
│   ├── utils/                       # Utility functions
│   │   ├── index.ts                 # Barrel exports
│   │   ├── errors.ts                # Error classes & ActionResult type
│   │   ├── cn.ts                    # Class name utility (clsx + tailwind-merge)
│   │   ├── creditValidator.ts       # Credit validation
│   │   ├── promptUtils.ts           # Prompt building
│   │   ├── promptOptimizer.ts       # AI prompt enhancement (GPT-4)
│   │   ├── firestoreValidation.ts   # Runtime Firestore validation
│   │   ├── validationSchemas.ts     # Zod schemas
│   │   ├── actionWrapper.ts         # Server action utilities
│   │   ├── formDataBuilder.ts       # FormData construction
│   │   ├── imageUtils.ts            # Image utilities
│   │   ├── storage.ts               # Storage utilities
│   │   ├── platform.ts              # Platform detection
│   │   ├── polling.ts               # Async polling utilities
│   │   └── env.ts                   # Environment variable helpers
│   │
│   └── zustand/                     # State management stores
│       ├── useAuthStore.ts          # Authentication state
│       ├── useProfileStore.ts       # User profile, credits, API keys
│       ├── useGenerationStore.ts    # Generation parameters & result
│       ├── usePaymentsStore.ts      # Payment history
│       ├── useInitializeStores.ts   # Store initialization
│       ├── helpers.ts               # Store helper utilities
│       └── selectors.ts             # Memoized selectors
│
├── .env.example                     # Example environment variables
├── firestore.rules                  # Firestore security rules
├── storage.rules                    # Storage security rules
├── next.config.mjs                  # Next.js configuration
├── postcss.config.mjs               # PostCSS with Tailwind v4
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Project dependencies
```

---

## Architecture

### Unified Model Registry

All AI model configurations are centralized in a single source of truth:

```typescript
// src/constants/modelRegistry.ts
export const MODEL_REGISTRY = {
  "dall-e": {
    id: 1,
    value: "dall-e",
    label: "DALL-E (OpenAI)",
    type: "image",
    credits: { envKey: "NEXT_PUBLIC_CREDITS_PER_DALL_E_IMAGE", fallback: 4 },
    apiKey: { envKey: "OPENAI_API_KEY", formDataKey: "openAPIKey" },
    capabilities: { supportsImageUpload: false, ... },
    strategyKey: "dalle",
  },
  // ... other models
} as const;

// Utility functions
export const getModelConfig = (modelName: string): ModelConfig | undefined;
export const creditsToMinus = (modelName: string): number;
export const resolveApiKey = (modelName: string, useCredits: boolean, userApiKey?: string): string;
```

### Strategy Pattern for AI Providers

The application uses a **Strategy Pattern** to abstract different AI model integrations, making it easy to add new providers:

```typescript
// src/strategies/types.ts
export interface StrategyContext {
  message: string;
  img: File | null;
  apiKey: string;
  useCredits: boolean;
}

export type GenerationStrategy = (
  context: StrategyContext
) => Promise<ArrayBuffer | Buffer>;

// src/strategies/index.ts - Strategy lookup via MODEL_REGISTRY
export function getStrategy(modelName: string): GenerationStrategy | undefined {
  const config = getModelConfig(modelName);
  return config?.strategyKey
    ? strategyImplementations[config.strategyKey]
    : undefined;
}
```

### Factory Pattern for Options

Option constants use a **Factory Pattern** for consistent behavior:

```typescript
// src/constants/optionFactory.ts
export const createOptionSet = <T extends Option>(options: T[]) => {
  const optionsWithIds = withIds(options);
  return {
    options: optionsWithIds,
    getValueFromLabel: createLabelToValueMapper(),
    findByValue: createOptionFinder(optionsWithIds),
    findByLabel: createOptionFinderByLabel(optionsWithIds),
  };
};

// Usage in src/constants/colors.ts
export const {
  options: colors,
  getValueFromLabel: getColorFromLabel,
  findByValue: findColorByValue,
  findByLabel: findColorByLabel,
} = createOptionSet(colorOptions);
```

### Custom Hooks Architecture

Hooks are organized by domain and responsibility:

| Hook                   | Purpose                          |
| ---------------------- | -------------------------------- |
| `useAuth`              | Authentication state utilities   |
| `useAuthLogic`         | Auth form state and handlers     |
| `useAuthToken`         | JWT token management and refresh |
| `useImageGenerator`    | Orchestrates image generation    |
| `useGenerationHistory` | Saves generation to Firestore    |
| `useNavigation`        | Shared navigation logic          |
| `usePreviewSaver`      | Save images as previews          |
| `useSpeechRecognition` | Web Speech API integration       |
| `useUrlSync`           | Sync state with URL parameters   |
| `useDebounce`          | Debounced values and callbacks   |
| `useClipboard`         | Clipboard copy utilities         |

### Zustand Store Organization

```typescript
// Stores are organized by domain
useAuthStore; // Authentication: uid, email, displayName, authReady
useProfileStore; // Profile: credits, API keys, preferences
useGenerationStore; // Generation: prompt, model, settings, result
usePaymentsStore; // Payments: history, processing state

// Helper utilities
import { helpers, selectors } from "@/zustand";
```

### Error Handling

Custom error types provide consistent error handling:

```typescript
// src/utils/errors.ts
export class AppError extends Error {
  constructor(message: string, code: ErrorCode, statusCode: number) { ... }
}

export class InsufficientCreditsError extends AppError { ... }
export class AuthenticationError extends AppError { ... }
export class AuthorizationError extends AppError { ... }
export class ValidationError extends AppError { ... }
export class ExternalApiError extends AppError { ... }
export class RateLimitError extends AppError { ... }
export class NotFoundError extends AppError { ... }

// Server action result type
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: ErrorCode };
```

### Firebase Path Utilities

Centralized Firestore paths prevent typos and enable refactoring:

```typescript
// src/firebase/paths.ts
export const FirestorePaths = {
  userProfile: (uid: string) => `users/${uid}/profile/userData`,
  profileCover: (uid: string, coverId: string) =>
    `profiles/${uid}/covers/${coverId}`,
  publicImage: (id: string) => `publicImages/${id}`,
  // ...
} as const;
```

---

## Usage

### Image Generation

1. Navigate to the **Generate** page
2. Enter a text prompt describing your desired image
3. Select an AI model from the available options
4. Optionally customize:
   - Artistic style (Renaissance, Impressionism, etc.)
   - Color scheme (Warm, Cool, Vibrant, etc.)
   - Lighting (Golden Hour, Dramatic, Soft, etc.)
   - Perspective, composition, medium, and mood
5. Click **Generate Image**
6. View, download, or share your generated image

### Video Generation

1. Generate or upload a base image
2. Open the image detail page
3. Click **Create Video**
4. Choose between:
   - **Talking Avatar** (D-ID): Add speech to your image
   - **Animation** (Runway ML): Add motion to your image
5. Configure audio/script options
6. Generate and download your video

### Profile Management

- **API Keys**: Add your own keys for each AI provider
- **Credits**: Purchase credits or use your own API keys
- **Toggle Mode**: Switch between credits and API key usage
- **Delete Account**: Remove all data and generated content

---

## Scripts

```bash
# Development with Turbopack (fast refresh)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code patterns and architecture
- Use TypeScript strict mode - avoid `any` types
- Use the Factory Pattern for new option sets
- Use the Strategy Pattern for new AI providers
- Create custom hooks for reusable logic
- Write meaningful commit messages

### Code Style

| Area       | Convention                                 |
| ---------- | ------------------------------------------ |
| Components | Functional components with hooks           |
| State      | Zustand for global, `useState` for local   |
| Styling    | Tailwind CSS utility classes               |
| Types      | Explicit types, use custom error types     |
| Validation | Zod schemas for runtime validation         |
| Paths      | Use `FirestorePaths` utility               |
| Options    | Use `createOptionSet` factory              |
| Models     | Use `MODEL_REGISTRY` in `modelRegistry.ts` |

### Adding a New AI Provider

1. Create a new strategy in `src/strategies/`
2. Implement the `GenerationStrategy` interface
3. Register the strategy in `src/strategies/index.ts`
4. Add model configuration to `src/constants/modelRegistry.ts` (single source of truth for model, credits, and API key config)
5. Add required environment variables to `.env.local`

---

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Deploy with automatic CI/CD

### Other Platforms

The application can be deployed to any platform supporting Next.js:

- **AWS Amplify**
- **Google Cloud Run**
- **Railway**
- **Render**

Requirements:

- Node.js 20+
- Server-side rendering support
- Environment variables
- FFmpeg binary (for video processing)

---

## Troubleshooting

### Common Issues

**Firebase Authentication Errors**

- Ensure all Firebase config values are correct
- Check that authentication methods are enabled in Firebase Console
- Verify the authorized domains include your deployment URL

**API Rate Limits**

- AI providers have rate limits; implement retry logic for production
- Consider using credits to distribute load across providers

**Video Processing Fails**

- Ensure FFmpeg is available in your environment
- Check that `ffmpeg-static` is properly installed

**Images Not Loading**

- If you're using Firebase Storage **SDK reads**, ensure rules allow the reads you expect.
- This app primarily serves generated media via **signed URLs** (Admin SDK), so Storage rules typically won't block rendering.
- Check that `next.config.mjs` includes all required image domains.

**Build Errors**

- Run `npm run lint` to check for TypeScript errors
- Ensure all environment variables are set

---

## License

This project is licensed under the GNU Affero General Public License v3.0. See the [LICENSE.md](LICENSE.md) file for details.

---

## Support

- **Email**: [info@ignitechannel.com](mailto:info@ignitechannel.com)
- **Issues**: [GitHub Issues](https://github.com/brown2020/generatemeai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/brown2020/generatemeai/discussions)

---

## Acknowledgments

- [OpenAI](https://openai.com/) for DALL-E and GPT-4
- [Fireworks AI](https://fireworks.ai/) for Stable Diffusion hosting
- [Replicate](https://replicate.com/) for Flux Schnell
- [Stability AI](https://stability.ai/) for SD3-Turbo
- [D-ID](https://www.d-id.com/) for talking avatar technology
- [Runway](https://runwayml.com/) for video generation
- [Vercel](https://vercel.com/) for the AI SDK and hosting platform
- [Firebase](https://firebase.google.com/) for backend services

---

<p align="center">
  Made with ❤️ by <a href="https://ignitechannel.com">Ignite Channel</a>
</p>
