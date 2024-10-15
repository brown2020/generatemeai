"use client";

import useProfileStore from "@/zustand/useProfileStore";
import { useCallback, useEffect, useState } from "react";
import { isIOSReactNativeWebView } from "@/utils/platform"; // Import the platform check function
import { usePaymentsStore } from "@/zustand/usePaymentsStore";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/zustand/useAuthStore";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function ProfileComponent() {
  const profile = useProfileStore((state) => state.profile);
  const router = useRouter();
  const updateProfile = useProfileStore((state) => state.updateProfile);

  const [fireworksApiKey, setFireworksApiKey] = useState(profile.fireworks_api_key);
  const [openaiApiKey, setOpenaiApiKey] = useState(profile.openai_api_key);
  const [stabilityAPIKey, setStabilityAPIKey] = useState(profile.stability_api_key);
  const [briaApiKey, setBriaApiKey] = useState(profile.bria_api_key);
  const [didApiKey, setdidApiKey] = useState(profile.did_api_key);
  const [replicateApiKey, setreplicateApiKey] = useState(profile.replicate_api_key);

  const [useCredits, setUseCredits] = useState(profile.useCredits);
  const [showCreditsSection, setShowCreditsSection] = useState(true);
  const addCredits = useProfileStore((state) => state.addCredits);
  const addPayment = usePaymentsStore((state) => state.addPayment);
  const deleteAccount = useProfileStore((state) => state.deleteAccount);
  const clearAuthDetails = useAuthStore((s) => s.clearAuthDetails);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const handleMessageFromRN = async (event: MessageEvent) => {
      const message = event.data;
      if (message?.type === "IAP_SUCCESS") {
        await addPayment({
          id: message.message,
          amount: message.amount,
          status: "succeeded",
          mode: 'iap',
          platform: message.platform,
          productId: message.productId,
          currency: message.currency
        });
        await addCredits(10000);
      }
    };

    // Listen for messages from the RN WebView
    window.addEventListener("message", handleMessageFromRN);

    return () => {
      window.removeEventListener("message", handleMessageFromRN);
    };
  }, [addCredits, addPayment]);

  useEffect(() => {
    setFireworksApiKey(profile.fireworks_api_key);
    setOpenaiApiKey(profile.openai_api_key);
    setStabilityAPIKey(profile.stability_api_key);
    setBriaApiKey(profile.bria_api_key);
    setdidApiKey(profile.did_api_key);
    setreplicateApiKey(profile.replicate_api_key);

    setShowCreditsSection(!isIOSReactNativeWebView());
  }, [
    profile.fireworks_api_key,
    profile.openai_api_key,
    profile.stability_api_key,
    profile.bria_api_key,
    profile.did_api_key,
    profile.replicate_api_key
  ]);

  const handleApiKeyChange = async () => {
    if (
      fireworksApiKey !== profile.fireworks_api_key ||
      openaiApiKey !== profile.openai_api_key ||
      stabilityAPIKey !== profile.stability_api_key ||
      briaApiKey !== profile.bria_api_key ||
      didApiKey !== profile.did_api_key ||
      replicateApiKey !== profile.replicate_api_key
    ) {
      try {
        await updateProfile({
          fireworks_api_key: fireworksApiKey,
          openai_api_key: openaiApiKey,
          stability_api_key: stabilityAPIKey,
          bria_api_key: briaApiKey,
          did_api_key: didApiKey,
          replicate_api_key: replicateApiKey
        });
        console.log("API keys updated successfully!");
      } catch (error) {
        console.error("Error updating API keys:", error);
      }
    }
  };

  const handleCreditsChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUseCredits(e.target.value === "credits");
    await updateProfile({ useCredits: e.target.value === "credits" });
  };

  const handleBuyClick = useCallback(
    () => {
      if (showCreditsSection) {
        window.location.href = "/payment-attempt";
      } else {
        window.ReactNativeWebView?.postMessage("INIT_IAP");
      }
    },
    [showCreditsSection]
  );

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const onDeleteConfirm = useCallback(async () => {
    setShowDeleteModal(false);
    try {
      await deleteAccount();
      await signOut(auth);
      clearAuthDetails();
      toast.success("Account deleted successfully.");
      router.replace("/");
    } catch (error) {
      console.error("Error on deletion of account:", error);
    }
  }, [deleteAccount, clearAuthDetails, router]);

  const areApiKeysAvailable = fireworksApiKey && openaiApiKey && stabilityAPIKey && briaApiKey && didApiKey && replicateApiKey;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row px-5 py-3 gap-3 border border-gray-500 rounded-md">
        <div className="flex gap-2 w-full items-center">
          <div className="flex-1">Usage Credits: {Math.round(profile.credits)}</div>
          <button
            className="bg-blue-500 text-white px-3 py-2 rounded-md hover:opacity-50 flex-1 text-center"
            onClick={handleBuyClick}
          >
            Buy 10,000 Credits
          </button>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          You can either buy credits or add your own API keys.
        </div>
      </div>

      <div className="flex flex-col px-5 py-3 gap-3 border border-gray-500 rounded-md">
        <label htmlFor="fireworks-api-key" className="text-sm font-medium">
          Fireworks API Key:
        </label>
        <input
          type="text"
          id="fireworks-api-key"
          value={fireworksApiKey}
          onChange={(e) => setFireworksApiKey(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 h-10"
          placeholder="Enter your Fireworks API Key"
        />

        <label htmlFor="openai-api-key" className="text-sm font-medium">
          OpenAI API Key:
        </label>
        <input
          type="text"
          id="openai-api-key"
          value={openaiApiKey}
          onChange={(e) => setOpenaiApiKey(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 h-10"
          placeholder="Enter your OpenAI API Key"
        />

        <label htmlFor="stability-api-key" className="text-sm font-medium">
          Stability API Key:
        </label>
        <input
          type="text"
          id="stability-api-key"
          value={stabilityAPIKey}
          onChange={(e) => setStabilityAPIKey(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 h-10"
          placeholder="Enter your Stability API Key"
        />

        <label htmlFor="bria-api-key" className="text-sm font-medium">
          Bria API Key:
        </label>
        <input
          type="text"
          id="bria-api-key"
          value={briaApiKey}
          onChange={(e) => setBriaApiKey(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 h-10"
          placeholder="Enter your Bria API Key"
        />

        <label htmlFor="d-id-api-key" className="text-sm font-medium">
          D-ID API Key:
        </label>
        <input
          type="text"
          id="d-id-api-key"
          value={didApiKey}
          onChange={(e) => setdidApiKey(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 h-10"
          placeholder="Enter your D-ID API Key"
        />

        <label htmlFor="replicate-api-key" className="text-sm font-medium">
          Replicate API Key:
        </label>
        <input
          type="text"
          id="replicate-api-key"
          value={replicateApiKey}
          onChange={(e) => setreplicateApiKey(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 h-10"
          placeholder="Enter your Replicate API Key"
        />

        <button
          onClick={handleApiKeyChange}
          disabled={
            fireworksApiKey === profile.fireworks_api_key &&
            openaiApiKey === profile.openai_api_key &&
            stabilityAPIKey === profile.stability_api_key &&
            briaApiKey === profile.bria_api_key &&
            didApiKey === profile.did_api_key &&
            replicateApiKey === profile.replicate_api_key
          }
          className="bg-blue-500 text-white px-3 py-2 rounded-md hover:opacity-50 disabled:opacity-50"
        >
          Update API Keys
        </button>
      </div>

      <div className="flex flex-col px-5 py-3 gap-3 border border-gray-500 rounded-md">
        <label htmlFor="setting-lable-key" className="text-sm font-medium">
          Settings:
        </label>
        <button
          className="btn-primary bg-[#e32012] self-start rounded-md hover:bg-[#e32012]/30"
          onClick={handleDeleteClick}
        >
          Delete Account
        </button>
      </div>

      <div className="flex items-center px-5 py-3 gap-3 border border-gray-500 rounded-md">
        <label htmlFor="toggle-use-credits" className="text-sm font-medium">
          Use:
        </label>
        <select
          id="toggle-use-credits"
          value={useCredits ? "credits" : "apikeys"}
          onChange={handleCreditsChange}
          className="border border-gray-300 rounded-md px-3 py-2 h-10"
          disabled={!areApiKeysAvailable}
        >
          <option value="credits">Credits</option>
          {areApiKeysAvailable && <option value="apikeys">API Keys</option>}
        </select>
      </div>

      <DeleteConfirmModal
        showDeleteModal={showDeleteModal}
        onHideModal={() => setShowDeleteModal(false)}
        onDeleteConfirm={onDeleteConfirm}
      />
    </div>
  );
}
