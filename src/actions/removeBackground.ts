"use server"

import { creditsToMinus } from "@/utils/credits";

export const removeBackground = async (useCredits: boolean, credits: number, imageUrl: string, briaApiKey: string) => {
    try {
        if (useCredits && credits < creditsToMinus('bria.ai')) {
            throw new Error("Not enough credits to remove background image. Please purchase credits or use your own API Keys.")
        }

        const formData = new FormData();
        formData.append(
            "file",
            await fetch(imageUrl).then((res) => res.blob()),
            "image.png"
        );

        const result = await fetch(
            "https://engine.prod.bria-api.com/v1/background/remove",
            {
                method: "POST",
                headers: {
                    api_token: useCredits ? process.env.BRIA_AI_API_KEY! : briaApiKey,
                },
                body: formData,
            }
        );
        const result_json = await result.json();

        if (result.ok) {
            return result_json;
        } else if (result_json === 'Invalid customer token key') {
            return {error: 'Bria API key is invalid.'}
        }

        throw new Error("Removing background failed.");
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error removing background:", error);
        return { error: errorMessage };
    }
}