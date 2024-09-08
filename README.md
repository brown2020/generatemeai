# Generate.me

Generate.me is an AI-powered application that enables users to create custom images based on their prompts, manage profile details, and explore various artistic styles. The app integrates multiple services, including OpenAI, Fireworks API, Firebase, and more, to deliver a dynamic user experience.

**Note:** This project is currently under development, and new features are being added regularly. Users can either provide their own API keys for Fireworks and OpenAI or purchase usage credits to generate images.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
  - [Image Generation](#image-generation)
  - [Profile Management](#profile-management)
  - [Payment Handling](#payment-handling)
- [State Management with Zustand](#state-management-with-zustand)
- [Components](#components)
  - [ProfileComponent](#profilecomponent)
  - [ImageSelector](#imageselector)
  - [GenerateImage](#generateimage)
  - [ClientProvider](#clientprovider)
- [Server Actions](#server-actions)
  - [generateImage](#generateimage-server-action)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Image Generation:** Users can create custom images using prompts and a selection of artistic styles.
- **Profile Management:** Users can manage their profile details, including API keys and credit usage.
- **Flexible Payment Options:** Users can either add their own API keys or purchase usage credits to access image generation features.
- **Real-Time Updates:** The app uses Firestore's snapshot listeners to provide real-time updates on image selections and profile changes.
- **Firebase Authentication:** Supports secure authentication with Google Sign-In or passwordless email links.
- **Responsive Design:** Adjusts dynamically to different screen sizes and supports React Native WebView.
- **Error Handling and Notifications:** Provides feedback via toast notifications and error boundaries for a seamless user experience.

## Tech Stack

- **Frontend:** React, Next.js 14, TypeScript (strict mode), Tailwind CSS
- **State Management:** Zustand
- **Backend:** Firebase Firestore, Firebase Admin SDK, Server Actions (Next.js 14)
- **APIs:** Fireworks API, OpenAI API
- **Tools:** ESLint, dotenv, React Hot Toast, React Select, Sharp

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase Project
- API keys for Fireworks and OpenAI

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/generate.me.git
   cd generate.me
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Firebase:**

   Configure your Firebase project and update the `.env` file with your Firebase credentials.

4. **Run the development server:**

   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory and populate it with the following values:

```plaintext
# Firebase Server Config
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERTS_URL=your_client_cert_url
FIREBASE_UNIVERSE_DOMAIN=googleapis.com

# Firebase Client Config
NEXT_PUBLIC_FIREBASE_APIKEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECTID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APPID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENTID=your_firebase_measurement_id

OPENAI_API_KEY=your_openai_api_key
OPENAI_ORG_ID=your_openai_org_id
FIREWORKS_API_KEY=your_fireworks_api_key

NEXT_PUBLIC_COOKIE_NAME=generateAuthToken
```

## Usage

### Image Generation

Use the **GenerateImage** component to create custom images by providing a text prompt and selecting an artistic style. The images are generated using the Fireworks API and stored in Firebase storage.

### Profile Management

The **ProfileComponent** allows users to manage their profile details, including API keys for Fireworks and OpenAI, and check their usage credits.

### Payment Handling

Use the payment interface to buy additional credits. Credits are required to use certain app features unless the user provides their own API keys.

## State Management with Zustand

Generate.me utilizes **Zustand** for state management to maintain a lightweight and efficient local state store. Zustand is leveraged to handle various application states, such as user authentication, profile data, and payments.

### Keeping Local State in Sync with Firebase

Our Zustand hooks (`useAuthStore`, `usePaymentsStore`, `useProfileStore`, etc.) are designed to keep the local state in sync with Firebase Firestore:

- **Real-time Synchronization:** We use Firestore snapshot listeners within our Zustand hooks to automatically update the local state whenever there are changes in the Firestore database. For example, the `useAuthStore` hook listens for authentication state changes, while `usePaymentsStore` listens for payment-related updates.
- **Optimistic Updates:** Actions such as updating the user profile or adding payments are first applied to the local state in Zustand, providing a responsive experience for the user. These updates are then synced with Firestore, ensuring the backend remains the source of truth.
- **Error Handling and Rollbacks:** In case of a failure while syncing data with Firebase, our hooks revert the local state to the last known good state, ensuring consistency and reliability.

This approach ensures that the application state is always up-to-date with Firebase, providing a seamless user experience across different devices and sessions.

## Components

### ProfileComponent

- Handles user profile details.
- Allows updating Fireworks and OpenAI API keys.
- Displays and manages user credits.

### ImageSelector

- Displays a gallery of images fetched in real-time from Firebase Firestore.
- Allows users to view and select images stored in their profile.

### GenerateImage

- Takes user input for generating images based on text prompts.
- Allows selection of artistic styles from a predefined list.
- Saves generated images and user prompt history in Firestore.

### ClientProvider

- Manages global state and authentication.
- Handles dynamic viewport adjustments and React Native WebView compatibility.
- Provides error boundaries and toaster notifications.

## Server Actions

### `generateImage` Server Action

- A server-side function to generate images using the Fireworks API.
- Saves the generated image to Firebase storage and returns a signed URL.
- Provides error handling for API requests and file operations.

```typescript
"use server";

import { adminBucket } from "@/firebase/firebaseAdmin";
import * as dotenv from "dotenv";

dotenv.config();

export async function generateImage(message: string, uid: string) {
  try {
    const apiUrl = `https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0`;
    const requestBody = {
      /*...*/
    };

    const response = await fetch(apiUrl, {
      /*...*/
    });

    if (!response.ok) {
      throw new Error(
        `Error from Fireworks API: ${response.status} ${response.statusText}`
      );
    }

    const imageData = await response.arrayBuffer();
    const fileName = `generated/${uid}/${Date.now()}.jpg`;
    const file = adminBucket.file(fileName);

    await file.save(Buffer.from(imageData), {
      contentType: "image/jpeg",
    });

    const [imageUrl] = await file.getSignedUrl({
      action: "read",
      expires: "03-17-2125",
    });

    return { imageUrl };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error generating image:", errorMessage);
    return { error: errorMessage };
  }
}
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries or support, please contact us at [info@ignitechannel.com](mailto:info@ignitechannel.com).
