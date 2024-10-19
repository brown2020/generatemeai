"use server";

import fetch from "node-fetch";
import { adminBucket } from "@/firebase/firebaseAdmin";
import { creditsToMinus } from "@/utils/credits";
import { model } from "@/types/model";

interface ResultResponse {
  error?: { description: string };
  message?: string;
  result_url?: string;
  id?: string;
  status?: string;
  output: [string];
}

interface DidResponse {
  kind: string;
  description: string;
  id: string;
}

const checkCredits = (useCredits: boolean | null, credits: string | null, model: string) => {
  if (useCredits && credits && Number(credits) < creditsToMinus(model as model)) {
    throw new Error(
      "Not enough credits to generate a video. Please purchase credits or use your own API keys."
    );
  }
};

function getApiKey(model: string) {
  switch (model as model) {
    case 'runway-ml':
      return process.env.RUNWAYML_API_SECRET;
    case 'd-id':
      return process.env.DID_API_KEY;
    default:
      break;
  }

}
export async function generateVideo(data: FormData) {
  try {
    const useCredits = data.get("useCredits") as boolean | null;
    const videoModel = data.get("videoModel") as string | null;
    const didApiKey = useCredits ? getApiKey(videoModel as model) : data.get("didAPIKey") as string;
    const runwayApiKey = useCredits ? getApiKey(videoModel as model) : data.get("runwayApiKey") as string;

    const credits = data.get("credits") as string | null;
    const scriptPrompt = data.get("scriptPrompt") as string | null;
    const audio = data.get("audio") as string | null;
    const imageUrl = data.get("imageUrl") as string | null;
    const animationType = data.get("animationType") as string | null;

    if ((!animationType && (!scriptPrompt || !audio)) || !videoModel || !imageUrl) {
      throw new Error("Required parameters are missing.");
    }

    checkCredits(useCredits, credits, videoModel);

    let videoUrl: string | undefined;

    if (videoModel === "d-id") {
      const endpoint = scriptPrompt ? 'talks' : 'animations';
      let url = `https://api.d-id.com/${endpoint}`;
      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Basic ${useCredits ? didApiKey : process.env.DID_API_KEY}`
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
          authorization: `Basic ${useCredits ? didApiKey : process.env.DID_API_KEY}`
        },
      };

      let attemptCount = 0;

      while (attemptCount++ < 24) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const response = await fetch(url, getOptions);
        const result = await response.json() as unknown as ResultResponse;

        if (result.error) return { error: result.error.description };
        if (result.result_url) {
          videoUrl = result.result_url;
          break;
        }
      }
    }
    if (videoModel === "runway-ml") {
      const url = "https://api.dev.runwayml.com/v1/image_to_video";
      const body = {
        model: "gen3a_turbo",
        promptImage: imageUrl,
        watermark: false
      };
      const options = {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${useCredits ? runwayApiKey : process.env.RUNWAYML_API_SECRET}`,
          "X-Runway-Version": "2024-09-13",
          "Content-Type": "application/json",

        },
        body: JSON.stringify(body)
      };

      const response: ResultResponse = await (await fetch(url, options)).json() as ResultResponse;
      const { id } = response;
      let attempt = 0;

      while (attempt++ < 24) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const url = `https://api.dev.runwayml.com/v1/tasks/${id}`
        const getOptions = {
          method: 'GET',
          headers: {
            authorization: `Bearer ${useCredits ? runwayApiKey : process.env.RUNWAYML_API_SECRET}`,
            "X-Runway-Version": "2024-09-13",
          },
        };

        const videoResponse = await fetch(url, getOptions);
        const result: ResultResponse = await videoResponse.json() as ResultResponse;
        if (result.error) return { error: result.error.description };
        if (result.status == "SUCCEEDED") {
          videoUrl = result.output[0];
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
