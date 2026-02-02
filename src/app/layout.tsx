import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ClientProvider } from "@/components/ClientProvider";
import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";

export const metadata: Metadata = {
  title: {
    template: "%s | Generate.me",
    default: "Generate.me - AI Image Generation Platform",
  },
  description:
    "Generate.me is a cutting-edge platform that turns your ideas into stunning visuals using AI models like DALL-E, Stable Diffusion, and more. Join today and start creating beautiful images effortlessly.",
  keywords: [
    "AI image generation",
    "create images with AI",
    "DALL-E",
    "Stable Diffusion",
    "AI art generator",
    "artistic styles",
    "AI image creation",
    "generate art",
    "creative AI platform",
    "text to image",
    "Flux",
    "Playground",
  ],
  authors: [{ name: "Generate.me" }],
  creator: "Generate.me",
  publisher: "Generate.me",
  metadataBase: new URL("https://www.generate.me"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.generate.me",
    siteName: "Generate.me",
    title: "Generate.me - AI Image Generation Platform",
    description:
      "Turn your ideas into stunning visuals using AI models like DALL-E, Stable Diffusion, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Generate.me - AI Image Generation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Generate.me - AI Image Generation Platform",
    description:
      "Turn your ideas into stunning visuals using AI models like DALL-E, Stable Diffusion, and more.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  // Allow user scaling for accessibility (WCAG 1.4.4 Resize Text)
  maximumScale: 5,
  userScalable: true,
  viewportFit: "contain",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProvider>
          {/* Skip to main content link for keyboard navigation */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Skip to main content
          </a>
          <div className="flex flex-col h-full">
            <Header />
            <main
              id="main-content"
              className="flex flex-col h-container-small md:h-container-custom overflow-y-scroll"
              tabIndex={-1}
            >
              <div className="flex flex-col h-full flex-1">{children}</div>
            </main>
            <BottomBar />
          </div>
        </ClientProvider>
      </body>
    </html>
  );
}
