import { PageWithFooter } from "@/components/layouts";

export const metadata = {
  title: "Support | Generate.me",
  description:
    "Get help and support for Generate.me. Contact our team for assistance with AI image generation, account issues, or any other questions.",
  keywords:
    "Generate.me support, help, contact, AI image generation help, customer support",
  canonical: "https://www.generate.me/support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageWithFooter>{children}</PageWithFooter>;
}
