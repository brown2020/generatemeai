import { PageWithFooter } from "@/components/layouts";

export const metadata = {
  title: "About Generate.me | AI-Powered Art & Image Creation Platform",
  description:
    "Learn about Generate.me, the innovative platform that empowers creators to generate stunning images through advanced AI technology. Explore various artistic styles and start your creative journey.",
  keywords:
    "About Generate.me, AI image platform, AI-powered image generation, AI art tools, artistic styles with AI, creative image generator, AI creative community",
  canonical: "https://www.generate.me/about",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageWithFooter withPadding={false}>{children}</PageWithFooter>;
}
