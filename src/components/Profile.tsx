"use client";

import AuthDataDisplay from "./AuthDataDisplay";
import PaymentsPage from "./PaymentsPage";
import ProfileComponent from "./ProfileComponent";

export default function Profile() {
  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto gap-4">
      <div className="text-3xl font-bold mt-5">User Profile</div>
      <AuthDataDisplay />
      <ProfileComponent />
      <PaymentsPage />
    </div>
  );
}
