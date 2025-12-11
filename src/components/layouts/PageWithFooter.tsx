import Footer from "@/components/Footer";

interface PageWithFooterProps {
  children: React.ReactNode;
  withPadding?: boolean;
}

/**
 * Shared layout component for pages with footer.
 * Eliminates duplication across about, terms, privacy, generate layouts.
 */
export function PageWithFooter({
  children,
  withPadding = true,
}: PageWithFooterProps) {
  return (
    <div className="flex flex-col h-full">
      <div className={`flex-1 ${withPadding ? "p-4" : ""}`}>{children}</div>
      <Footer />
    </div>
  );
}
