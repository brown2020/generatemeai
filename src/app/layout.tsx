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
  maximumScale: 1,
  userScalable: false,
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
          <div className="flex flex-col h-full">
            <Header />
            <div className="flex flex-col h-container-small md:h-container-custom overflow-y-scroll">
              <div className="flex flex-col h-full flex-1">{children}</div>
            </div>
            <BottomBar />
          </div>
        </ClientProvider>
      </body>
    </html>
  );
}
