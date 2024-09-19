import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | Generate.me",
  description: "Read Generate.me's Privacy Policy to understand how we handle your personal information and protect your data while using our AI image generation services. Learn about our commitment to privacy and security.",
  keywords: "Generate.me privacy policy, data privacy, AI platform privacy, user data protection, information security, privacy practices, data collection, GDPR compliance",
  canonical: "https://www.generate.me/privacy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4">{children}</div>
      <Footer />
    </div>
  );
}
