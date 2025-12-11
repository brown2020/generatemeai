import { PageWithFooter } from "./PageWithFooter";

interface LayoutOptions {
  withPadding?: boolean;
}

/**
 * Factory function to create page layouts with consistent structure.
 * Reduces boilerplate in layout.tsx files.
 *
 * @example
 * // In about/layout.tsx
 * export default createPageLayout({ withPadding: false });
 *
 * // In terms/layout.tsx
 * export default createPageLayout(); // defaults to withPadding: true
 */
export function createPageLayout(options: LayoutOptions = {}) {
  const { withPadding = true } = options;

  return function PageLayout({ children }: { children: React.ReactNode }) {
    return (
      <PageWithFooter withPadding={withPadding}>{children}</PageWithFooter>
    );
  };
}
