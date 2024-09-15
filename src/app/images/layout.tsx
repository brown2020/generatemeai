import Footer from "@/components/Footer";
import { ProtectUsers } from "@/components/ProtectUsers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectUsers>
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4">{children}</div>
        <Footer />
      </div>
    </ProtectUsers>
  );
}
