import { PageWithFooter } from "@/components/layouts";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageWithFooter>{children}</PageWithFooter>;
}
