// "use server";

// import { adminBucket } from "@/firebase/firebaseAdmin";
// import { model } from "@/types/model";
// import * as dotenv from "dotenv";
// import { File, FormData } from "formdata-node";
// import fs from "fs";

// dotenv.config();

// export async function generateImage(
//   message: string,
//   uid: string,
//   openAPIKey: string,
//   fireworksAPIKey: string,
//   stabilityAPIKey: string,
//   useCredits: boolean,
//   credits: number,
//   model: model,
//   imageField: any
// ) {
//   try {
//     if (useCredits && credits < 2) {
//       throw new Error("Not enough credits to generate an image. Please purchase credits or use your own API keys.");
//     }

//     let apiUrl, requestBody, formData, headers;

//     if (model == 'dall-e') {
//       apiUrl = `https://api.openai.com/v1/images/generations`;
//       requestBody = {
//         prompt: message,
//         n: 1,
//         size: "1024x1024"
//       };
//       headers = {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${useCredits ? process.env.OPENAI_API_KEY : openAPIKey}`,
//       };
//     } else if (model == 'stable-diffusion-xl') {
//       apiUrl = `https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0`;
//       requestBody = {
//         cfg_scale: 7,
//         height: 1024,
//         width: 1024,
//         sampler: null,
//         samples: 1,
//         steps: 30,
//         seed: 0,
//         style_preset: null,
//         safety_check: false,
//         prompt: message,
//       };
//       headers = {
//         "Content-Type": "application/json",
//         Accept: "image/jpeg",
//         Authorization: `Bearer ${useCredits ? process.env.FIREWORKS_API_KEY : fireworksAPIKey}`,
//       };
//     } else if (model == 'stability-sd3-turbo') {
//       formData = new FormData();
//       formData.append("mode", "text-to-image");
//       formData.append("prompt", message);
//       formData.append("aspect_ratio", "1:1");
//       formData.append("output_format", "png");
//       formData.append("model", "sd3-turbo");
//       formData.append("isValidPrompt", "true");

//       apiUrl = "https://api.stability.ai/v2beta/stable-image/generate/sd3";
//       headers = {
//         Accept: "image/*",
//         Authorization: `Bearer ${useCredits ? process.env.STABILITY_API_KEY : stabilityAPIKey}`,
//       };
//     } else if (model == 'playground-v2') {
//       if (imageField) {
//         const initImage = new File(
//           [fs.readFileSync("/Users/biruk/Downloads/cat_2024-09-19.png")],
//           "image.jpg"
//         );
//         formData = new FormData();
//         formData.append("init_image", initImage);
//         formData.append("prompt", "");
//         formData.append("init_image_mode", "IMAGE_STRENGTH");
//         formData.append("image_strength", "0.5");
//         formData.append("cfg_scale", 7);
//         formData.append("seed", 1);
//         formData.append("steps", 30);
//         formData.append("safety_check", false);

//         apiUrl = "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/playground-v2-1024px-aesthetic/image_to_image"
//         headers = {
//           'Accept': 'image/jpeg',
//           'Authorization': `Bearer ${useCredits ? process.env.FIREWORKS_API_KEY : fireworksAPIKey}`,
//         }
//       } else {
//         apiUrl = "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/playground-v2-1024px-aesthetic";
//         requestBody = {
//           cfg_scale: 7,
//           height: 1024,
//           width: 1024,
//           sampler: null,
//           samples: 1,
//           steps: 30,
//           seed: 0,
//           style_preset: null,
//           safety_check: false,
//           prompt: message,
//         };
//         headers = {
//           "Content-Type": "application/json",
//           Accept: "image/jpeg",
//           Authorization: `Bearer ${useCredits ? process.env.FIREWORKS_API_KEY : fireworksAPIKey}`,
//         };
//       }
//     }

//     if (!apiUrl) return;

//     const response = await fetch(apiUrl, {
//       method: "POST",
//       headers: headers,
//       body: model != 'stability-sd3-turbo' ? JSON.stringify(requestBody) : formData,
//     });

//     if (!response.ok) {
//       throw new Error(`Error from Image API: ${response.status} ${response.statusText}`);
//     }

//     const imageData = model == "dall-e"
//       ? await fetch((await response.json()).data[0].url).then(res => res.arrayBuffer())
//       : await response.arrayBuffer();

//     const finalImage = Buffer.from(imageData);

//     const fileName = `generated/${uid}/${Date.now()}.jpg`;
//     const file = adminBucket.file(fileName);

//     await file.save(finalImage, {
//       contentType: "image/jpeg",
//     });

//     const metadata = {
//       metadata: {
//         prompt: message,
//       },
//     };

//     await file.setMetadata(metadata);

//     const [imageUrl] = await file.getSignedUrl({
//       action: "read",
//       expires: "03-17-2125",
//     });

//     return { imageUrl };
//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
//     console.error("Error generating image:", error);
//     return { error: errorMessage };
//   }
// }
