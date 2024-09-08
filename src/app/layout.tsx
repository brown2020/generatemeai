import type { Metadata } from "next";
import "./globals.css";
import { ClientProvider } from "@/components/ClientProvider";
import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";

export const metadata: Metadata = {
  title: "Generate.me",
  description: "Image generation demo",
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
