"use server";

import fetch from "node-fetch";
import { adminBucket } from "@/firebase/firebaseAdmin";
import { creditsToMinus } from "@/utils/credits";

interface ResultResponse {
  error?: { description: string };
  message?: string;
  result_url?: string;
}

interface DidResponse {
  kind: string;
  description: string;
  id: string;
}

const checkCredits = (useCredits: boolean | null, credits: string | null) => {
  if (useCredits && credits && Number(credits) < creditsToMinus('d-id')) {
    throw new Error(
      "Not enough credits to generate a video. Please purchase credits or use your own API keys."
    );
  }
};

export async function generateVideo(data: FormData) {
  try {
    const useCredits = data.get("useCredits") as boolean | null;
    const didAPIkey = useCredits ? process.env.DID_API_KEY : data.get("didAPIKey") as string;
    const credits = data.get("credits") as string | null;
    const scriptPrompt = data.get("scriptPrompt") as string | null;
    const videoModel = data.get("videoModel") as string | null;
    const audio = data.get("audio") as string | null;
    const imageUrl = data.get("imageUrl") as string | null;
    const animationType = data.get("animationType") as string | null;

    if ((!animationType && (!scriptPrompt || !audio)) || !videoModel || !imageUrl) {
      throw new Error("Required parameters are missing.");
    }

    checkCredits(useCredits, credits);

    let videoUrl: string | undefined;

    if (videoModel === "d-id") {
      const endpoint = scriptPrompt ? 'talks' : 'animations';
      let url = `https://api.d-id.com/${endpoint}`;
      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Basic ${useCredits ? didAPIkey : process.env.DID_API_KEY}`
        },
        body: JSON.stringify({
          source_url: imageUrl,
          ...(scriptPrompt ? {
            script: {
              type: 'text',
              subtitles: 'false',
              provider: {
                type: 'amazon',
                voice_id: audio
              },
              input: scriptPrompt
            },
            config: {
              fluent: 'false',
              pad_audio: '0.0',
              stitch: true
            }
          } : {
            driver_url: `bank://${animationType}`,
            config: { mute: true, stitch: true }
          })
        })
      };

      const didResponse = await (await fetch(url, options)).json() as unknown as DidResponse;
      const { id } = didResponse;

      if (!id) {
        const errorDescription = didResponse.description || "D-ID API Token is invalid.";
        throw new Error(errorDescription);
      }

      url = `https://api.d-id.com/${endpoint}/${id}`;
      const getOptions = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Basic ${useCredits ? didAPIkey : process.env.DID_API_KEY}`
        },
      };

      let attemptCount = 0;

      while (attemptCount++ < 24) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const response = await fetch(url, getOptions);
        let result = await response.json() as unknown as ResultResponse;

        if (result.error) return { error: result.error.description };
        if (result.result_url) {
          videoUrl = result.result_url;
          break;
        }
      }
    }

    if (videoUrl) {
      const videoResponse = await fetch(videoUrl);
      const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());

      const referenceFileName = `video-generation/${Date.now()}.mp4`
      const referenceFile = adminBucket.file(referenceFileName);

      await referenceFile.save(videoBuffer, {
        contentType: "video/mp4",
      });

      const [videoReferenceUrl] = await referenceFile.getSignedUrl({
        action: "read",
        expires: "03-17-2125",
      });

      return { videoUrl: videoReferenceUrl };
    }

    throw new Error("Video generation failed.");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error generating image/video:", errorMessage);
    return { error: errorMessage };
  }
}
