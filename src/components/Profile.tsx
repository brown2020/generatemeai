"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, Copy, Check, LogOut } from "lucide-react";

import PaymentsPage from "./PaymentsPage";
import useProfileStore from "@/zustand/useProfileStore";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useAuthLogic } from "@/hooks/useAuthLogic";
import { API_KEY_CONFIGS, getApiKeyValue } from "@/constants/apiKeys";

export default function Profile() {
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const deleteAccount = useProfileStore((state) => state.deleteAccount);
  const { uid, authEmail } = useAuthStore((state) => state);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { handleSignOut } = useAuthLogic();
  const router = useRouter();

  const onSignOut = useCallback(async () => {
    await handleSignOut();
    router.push("/");
  }, [handleSignOut, router]);

  const handleCopyToClipboard = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  const toggleApiKeyVisibility = useCallback((key: string) => {
    setShowApiKey((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleDeleteAccount = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      deleteAccount();
    }
  }, [deleteAccount]);

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 relative overflow-hidden flex justify-between items-center">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-500 to-purple-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Account Settings
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your API keys and credits
            </p>
          </div>
          <button
            onClick={onSignOut}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium 
              hover:bg-gray-200 transition-colors active:bg-gray-300 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
              Account Information
            </h2>
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  User ID
                </label>
                <div className="group relative">
                  <div className="mt-1 text-sm font-mono bg-gray-50 p-3 rounded-lg border border-gray-200 break-all">
                    {uid || "Not available"}
                  </div>
                  <button
                    onClick={() => handleCopyToClipboard(uid || "", "uid")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedKey === "uid" ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Email Address
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {authEmail || "Not set"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Account Type
                </label>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                    ${
                      profile.useCredits
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {profile.useCredits
                      ? "Credits Account"
                      : "API Keys Account"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
              API Keys
            </h2>
            <div className="space-y-6">
              {API_KEY_CONFIGS.map(({ key, label }) => {
                const value = getApiKeyValue(profile, key);
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <div className="relative group">
                      <input
                        type={showApiKey[key] ? "text" : "password"}
                        value={value}
                        onChange={(e) =>
                          updateProfile({ [key]: e.target.value })
                        }
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-20
                          text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                          hover:border-gray-400"
                        placeholder={`Enter your ${label}`}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button
                          onClick={() => handleCopyToClipboard(value, key)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {copiedKey === key ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleApiKeyVisibility(key)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showApiKey[key] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              Credits & Payments
            </h2>
            <PaymentsPage />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
              Settings
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={profile.useCredits ? "credits" : "apikeys"}
                  onChange={(e) =>
                    updateProfile({ useCredits: e.target.value === "credits" })
                  }
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5
                    text-sm transition-colors focus:border-blue-500 focus:ring-1 
                    focus:ring-blue-500 hover:border-gray-400"
                >
                  <option value="credits">Use Credits</option>
                  <option value="apikeys">Use API Keys</option>
                </select>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium 
                    hover:bg-red-100 transition-colors active:bg-red-200"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
