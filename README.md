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
  <a href="#documentation">Documentation</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Firebase-13-orange?logo=firebase" alt="Firebase">
  <img src="https://img.shields.io/license/MIT-green" alt="MIT License">
</p>

---

## Overview

Generate.me AI is a full-stack application that enables users to create custom images and videos using multiple AI providers. The platform supports various artistic styles, lighting conditions, color schemes, and advanced generation parameters. Users can either provide their own API keys or purchase credits to access generation features.

## Features

### 🎨 Image Generation

- **Multiple AI Models**: Support for DALL-E, Stable Diffusion XL, Flux Schnell, Ideogram, and more
- **Style Customization**: 20+ artistic styles from Renaissance to Contemporary Art
- **Advanced Parameters**: Control lighting, color scheme, perspective, composition, medium, and mood
- **Image-to-Image**: Use reference images to guide generation (supported models)
- **Prompt Enhancement**: AI-powered prompt optimization for better results
- **Voice Input**: Speak your prompts with speech recognition

### 🎬 Video Generation

- **Talking Avatars**: Create talking head videos with D-ID
- **Video Animation**: Transform images into videos with Runway ML
- **GIF Conversion**: Convert videos to GIF format
- **Audio Support**: Add voiceovers to generated videos

### 👤 User Management

- **Firebase Authentication**: Google Sign-In, email/password, and passwordless email links
- **Profile Management**: Store and manage multiple API keys
- **Credit System**: Pay-per-use credit system or bring your own API keys
- **Image History**: Browse and manage all generated content

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

| Model                   | Provider                     | Features                       |
| ----------------------- | ---------------------------- | ------------------------------ |
| **DALL-E**              | OpenAI                       | Text-to-image, high quality    |
| **Stable Diffusion XL** | Fireworks AI                 | Text-to-image, image-to-image  |
| **SD3-Turbo**           | Stability AI                 | Fast generation, text-to-image |
| **Playground V2**       | Fireworks AI                 | Aesthetic-focused generation   |
| **Playground V2.5**     | Fireworks AI                 | Enhanced aesthetic generation  |
| **Flux Schnell**        | Replicate (Blackforest Labs) | Fast, high-quality generation  |
| **Ideogram AI**         | Ideogram                     | Text rendering, typography     |

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

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router and Turbopack
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5.6](https://www.typescriptlang.org/) (strict mode)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion 12](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/)

### State Management

- **Global State**: [Zustand 5](https://zustand-demo.pmnd.rs/)
- **Server State**: React Server Components + Server Actions

### Backend & Database

- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Storage**: [Firebase Cloud Storage](https://firebase.google.com/docs/storage)
- **Admin SDK**: [Firebase Admin 13](https://firebase.google.com/docs/admin/setup)

### AI Integration

- **AI SDK**: [Vercel AI SDK 5](https://sdk.vercel.ai/)
- **OpenAI**: [@ai-sdk/openai](https://sdk.vercel.ai/providers/ai-sdk-providers/openai)
- **Replicate**: [Replicate Node SDK](https://replicate.com/)

### Payments

- **Payment Processing**: [Stripe](https://stripe.com/)
- **React Integration**: [@stripe/react-stripe-js](https://stripe.com/docs/stripe-js/react)

### Media Processing

- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/)
- **Video Processing**: [Fluent-FFmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)
- **DOM to Image**: [dom-to-image](https://github.com/tsayen/dom-to-image)

### Utilities

- **HTTP Cookies**: [cookies-next](https://github.com/andreizanik/cookies-next)
- **Toast Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **Modals**: [React Modal](https://reactcommunity.org/react-modal/)
- **Social Sharing**: [React Share](https://github.com/nygardk/react-share)

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

   Copy the example environment file and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

4. **Set up Firebase**

   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Google, Email/Password, Email Link)
   - Create a Firestore database
   - Create a Storage bucket
   - Download your service account key for server-side operations

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

Create a `.env.local` file in the root directory with the following variables:

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
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
```

### AI Provider API Keys (At least one required)

```env
# OpenAI (for DALL-E, GPT-4 prompt optimization)
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...

# Fireworks AI (for Stable Diffusion, Playground models)
FIREWORKS_API_KEY=fw_...

# Replicate (for Flux Schnell)
REPLICATE_API_TOKEN=r8_...

# Stability AI (for SD3-Turbo)
STABILITY_API_KEY=sk-...

# Ideogram AI
IDEOGRAM_API_KEY=...

# D-ID (for talking avatars)
DID_API_KEY=...

# Runway ML (for video generation)
RUNWAY_API_KEY=...

# Bria AI (for background removal)
BRIA_API_KEY=...
```

### Stripe Configuration (For payments)

```env
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

### Credit Configuration

```env
# Credits charged per generation (customize per model)
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
├── public/                    # Static assets
│   ├── previews/             # Model/style preview images
│   └── .well-known/          # App association files
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── about/           # About page
│   │   ├── api/             # API routes
│   │   ├── generate/        # Image generation page
│   │   ├── images/          # Image gallery & detail pages
│   │   ├── loginfinish/     # Email link auth completion
│   │   ├── payment-*/       # Payment flow pages
│   │   ├── privacy/         # Privacy policy
│   │   ├── profile/         # User profile
│   │   ├── support/         # Support page
│   │   └── terms/           # Terms of service
│   ├── actions/             # Server Actions
│   │   ├── generateImage.ts # Main image generation
│   │   ├── generateVideo.ts # Video generation
│   │   ├── generateGif.ts   # GIF conversion
│   │   ├── suggestTags.ts   # AI tag suggestions
│   │   └── removeBackground.ts
│   ├── components/          # React components
│   │   ├── common/          # Shared UI components
│   │   ├── generation/      # Generation-specific components
│   │   └── image/           # Image display components
│   ├── constants/           # App constants & options
│   ├── firebase/            # Firebase configuration
│   ├── hooks/               # Custom React hooks
│   ├── strategies/          # AI provider strategy pattern
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── zustand/             # Zustand stores
├── .env.example             # Example environment variables
├── next.config.mjs          # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

---

## Architecture

### Strategy Pattern for AI Providers

The application uses a strategy pattern to abstract different AI model integrations:

```typescript
// src/strategies/types.ts
interface GenerationStrategy {
  (context: StrategyContext): Promise<ArrayBuffer>;
}

// src/strategies/index.ts
export const strategies: Record<string, GenerationStrategy> = {
  "dall-e": dalleStrategy,
  "stable-diffusion-xl": fireworksStrategy,
  "flux-schnell": replicateStrategy,
  // ... more strategies
};
```

This allows easy addition of new AI providers without modifying core generation logic.

### State Management

Zustand stores are organized by domain:

- **`useAuthStore`**: Authentication state (uid, email, display name)
- **`useProfileStore`**: User profile, API keys, credits
- **`useGenerationStore`**: Generation parameters and results
- **`usePaymentsStore`**: Payment history and transactions

### Server Actions

Next.js Server Actions handle all AI API calls and Firebase Admin operations:

- **`generateImage`**: Orchestrates image generation across providers
- **`generateVideo`**: Creates talking avatar videos
- **`suggestTags`**: AI-powered tag recommendations
- **`optimizePrompt`**: Enhances user prompts with GPT-4

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
# Development with Turbopack
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

- Follow the existing code style and patterns
- Use TypeScript strict mode
- Write meaningful commit messages
- Update documentation as needed
- Add tests for new features when applicable

### Code Style

- **Components**: Functional components with hooks
- **State**: Zustand for global state, React state for local
- **Styling**: Tailwind CSS utility classes
- **Types**: Explicit TypeScript types, avoid `any`

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

Ensure your deployment platform supports:

- Node.js 20+
- Server-side rendering
- Environment variables
- FFmpeg binary (for video processing)

---

## Troubleshooting

### Common Issues

**Firebase Authentication Errors**

- Ensure all Firebase config values are correct
- Check that authentication methods are enabled in Firebase Console

**API Rate Limits**

- AI providers have rate limits; implement retry logic for production
- Consider using credits to distribute load across providers

**Video Processing Fails**

- Ensure FFmpeg is available in your environment
- Check that `ffmpeg-static` is properly installed

**Images Not Loading**

- Verify Firebase Storage rules allow authenticated reads
- Check that `next.config.mjs` includes all image domains

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

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

---

<p align="center">
  Made with ❤️ by <a href="https://ignitechannel.com">Ignite Channel</a>
</p>
