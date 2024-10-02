"use client";

import Link from "next/link";
import useProfileStore from "@/zustand/useProfileStore";
import { MouseEvent, useCallback, useEffect, useState } from "react";
import { isIOSReactNativeWebView } from "@/utils/platform";

export default function ProfileComponent() {
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);

  const [fireworksApiKey, setFireworksApiKey] = useState(profile.fireworks_api_key);
  const [openaiApiKey, setOpenaiApiKey] = useState(profile.openai_api_key);
  const [stabilityAPIKey, setStabilityAPIKey] = useState(profile.stability_api_key);
  const [briaApiKey, setBriaApiKey] = useState(profile.bria_api_key);
  const [picsartApiKey, setPicsartApiKey] = useState(profile.picsart_api_key);

  const [useCredits, setUseCredits] = useState(profile.useCredits);
  const [showCreditsSection, setShowCreditsSection] = useState(true);

  useEffect(() => {
    setFireworksApiKey(profile.fireworks_api_key);
    setOpenaiApiKey(profile.openai_api_key);
    setStabilityAPIKey(profile.stability_api_key);
    setBriaApiKey(profile.bria_api_key);
    setPicsartApiKey(profile.picsart_api_key);

    setShowCreditsSection(!isIOSReactNativeWebView());
  }, [
    profile.fireworks_api_key,
    profile.openai_api_key,
    profile.stability_api_key,
    profile.bria_api_key,
    profile.picsart_api_key,
  ]);

  const handleApiKeyChange = async () => {
    if (
      fireworksApiKey !== profile.fireworks_api_key ||
      openaiApiKey !== profile.openai_api_key ||
      stabilityAPIKey !== profile.stability_api_key ||
      briaApiKey !== profile.bria_api_key ||
      picsartApiKey !== profile.picsart_api_key
    ) {
      try {
        await updateProfile({
          fireworks_api_key: fireworksApiKey,
          openai_api_key: openaiApiKey,
          stability_api_key: stabilityAPIKey,
          bria_api_key: briaApiKey,
          picsart_api_key: picsartApiKey,
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
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (showCreditsSection) {
        window.location.href = "/payment-attempt";
      } else {
        window.ReactNativeWebView?.postMessage("INIT_IAP");
      }
    },
    [showCreditsSection]
  );

  const areApiKeysAvailable = fireworksApiKey && openaiApiKey && stabilityAPIKey && briaApiKey && picsartApiKey;

  return (
    <div className="flex flex-col gap-4">
      {showCreditsSection && (
        <>
          <div className="flex flex-col sm:flex-row px-5 py-3 gap-3 border border-gray-500 rounded-md">
            <div className="flex gap-2 w-full items-center">
              <div className="flex-1">Usage Credits: {Math.round(profile.credits)}</div>
              <Link
                className="bg-blue-500 text-white px-3 py-2 rounded-md hover:opacity-50 flex-1 text-center"
                href={"/payment-attempt"}
              >
                Buy 10,000 Credits
              </Link>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              You can either buy credits or add your own API keys for Fireworks and OpenAI.
            </div>
            <Link
              className="bg-blue-500 text-white px-3 py-2 rounded-md hover:opacity-50 flex-1 text-center"
              href={"/payment-attempt"}
              onClick={handleBuyClick}
            >
              Buy 10,000 Credits
            </Link>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            You can either buy credits or add your own API keys for Fireworks and
            OpenAI.
          </div></>
      )}

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

        <label htmlFor="picsart-api-key" className="text-sm font-medium">
          PicsArt API Key:
        </label>
        <input
          type="text"
          id="picsart-api-key"
          value={picsartApiKey}
          onChange={(e) => setPicsartApiKey(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 h-10"
          placeholder="Enter your PicsArt API Key"
        />

        <button
          onClick={handleApiKeyChange}
          disabled={
            fireworksApiKey === profile.fireworks_api_key &&
            openaiApiKey === profile.openai_api_key &&
            stabilityAPIKey === profile.stability_api_key &&
            briaApiKey === profile.bria_api_key &&
            picsartApiKey === profile.picsart_api_key
          }
          className="bg-blue-500 text-white px-3 py-2 rounded-md hover:opacity-50 disabled:opacity-50"
        >
          Update API Keys
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
    </div >
  );
}
