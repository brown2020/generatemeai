import { PageWithFooter } from "@/components/layouts";

export const metadata = {
  title: "Terms of Service | Generate.me",
  description:
    "Review Generate.me's Terms of Service to understand the rights and responsibilities of using our AI-powered image generation platform. Stay informed about usage guidelines, restrictions, and policies.",
  keywords:
    "Generate.me terms of service, AI platform terms, image generation terms, usage guidelines, user rights, platform policies, terms and conditions",
  canonical: "https://www.generate.me/terms",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageWithFooter>{children}</PageWithFooter>;
}
