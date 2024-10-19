import "./globals.css";
import { ClientProvider } from "@/components/ClientProvider";
import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Generate.me",
  description:
    "Generate.me is a cutting-edge platform that turns your ideas into stunning visuals using AI models like DALL-E, Stable Diffusion, and more. Join today and start creating beautiful images effortlessly.",
  keywords:
    "AI image generation, create images with AI, DALL-E, Stable Diffusion, AI art generator, artistic styles, AI image creation, generate art, creative AI platform",
  canonical: "https://www.generate.me/",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, viewport-fit=contain user-scalable=no maximum-scale=1"
        />
        <meta name="theme-color" content="#ffffff" />
      </head>
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
