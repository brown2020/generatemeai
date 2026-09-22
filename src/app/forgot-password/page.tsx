import type { Metadata } from "next";
import { AuthPageForm } from "@/components/auth/AuthPageForm";
import { PageWithFooter } from "@/components/layouts/PageWithFooter";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <PageWithFooter>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <AuthPageForm mode="forgot" />
      </div>
    </PageWithFooter>
  );
}
