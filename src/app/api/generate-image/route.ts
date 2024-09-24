import { adminBucket } from '@/firebase/firebaseAdmin';
import { File, FormData } from 'formdata-node';
import fetch from 'node-fetch';
import { NextRequest, NextResponse } from 'next/server';

interface RequestBody {
    prompt: string;
    n?: number;
    size?: string;
    cfg_scale?: number;
    height?: number;
    width?: number;
    samples?: number;
    steps?: number;
    seed?: number;
    style_preset?: any;
    safety_check?: boolean;
    sampler?: string;
}

interface DalleResponse {
    data: { url: string }[];
}

export async function POST(req: NextRequest) {
    try {
        const requestFormData = await req.formData();

        const message = requestFormData.get("message") as string | null;
        const uid = requestFormData.get("uid") as string | null;
        const openAPIKey = requestFormData.get("openAPIKey") as string | null;
        const fireworksAPIKey = requestFormData.get("fireworksAPIKey") as string | null;
        const stabilityAPIKey = requestFormData.get("stabilityAPIKey") as string | null;
        const useCredits = requestFormData.get("useCredits") as string | null;
        const credits = requestFormData.get("credits") as string | null;
        const model = requestFormData.get("model") as string | null;
        const img: File | null = requestFormData.get("imageField") as File | null;

        if (useCredits && credits && Number(credits) < 2) {
            return NextResponse.json({ error: "Not enough credits to generate an image. Please purchase credits or use your own API keys." }, { status: 400 });
        }

        let apiUrl: string | undefined;
        let requestBody: RequestBody | undefined;
        let formData: FormData | undefined;
        let headers: { [key: string]: string } = {};

        if (model === 'dall-e') {
            if (img) {
                formData = new FormData();
                formData.append('image', img);
                formData.append('prompt', message!);
                formData.append('n', '1');
                formData.append('size', '1024x1024');

                apiUrl = `https://api.openai.com/v1/images/edits`;
                headers = {
                    Authorization: `Bearer ${useCredits ? process.env.OPENAI_API_KEY : openAPIKey}`,
                };
            } else {
                apiUrl = `https://api.openai.com/v1/images/generations`;
                requestBody = {
                    prompt: message!,
                    n: 1,
                    size: '1024x1024',
                };
                headers = {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${useCredits ? process.env.OPENAI_API_KEY : openAPIKey}`,
                };
            }
        } else if (model === 'stable-diffusion-xl') {
            if (img) {
                formData = new FormData();
                formData.append('init_image', img);
                formData.append('prompt', message!);
                formData.append('init_image_mode', 'IMAGE_STRENGTH');
                formData.append('image_strength', '0.5');
                formData.append('cfg_scale', 7);
                formData.append('seed', 1);
                formData.append('steps', 30);
                formData.append('safety_check', false);

                apiUrl = 'https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0/image_to_image';
                headers = {
                    Accept: 'image/jpeg',
                    Authorization: `Bearer ${useCredits ? process.env.FIREWORKS_API_KEY : fireworksAPIKey}`,
                };
            } else {
                apiUrl = `https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0`;
                requestBody = {
                    cfg_scale: 7,
                    height: 1024,
                    width: 1024,
                    samples: 1,
                    steps: 30,
                    seed: 0,
                    style_preset: null,
                    safety_check: false,
                    prompt: message!,
                };
                headers = {
                    'Content-Type': 'application/json',
                    Accept: 'image/jpeg',
                    Authorization: `Bearer ${useCredits ? process.env.FIREWORKS_API_KEY : fireworksAPIKey}`,
                };
            }
        } else if (model === 'stability-sd3-turbo') {
            formData = new FormData();
            if (img) {
                formData.append('mode', 'image-to-image');
                formData.append('image', img);
                formData.append("strength", "0.7");
            } else {
                formData.append('mode', 'text-to-image');
                formData.append('aspect_ratio', '1:1');
            }
            formData.append('prompt', message!);
            formData.append('output_format', 'png');
            formData.append('model', 'sd3-turbo');
            formData.append('isValidPrompt', 'true');

            apiUrl = 'https://api.stability.ai/v2beta/stable-image/generate/sd3';
            headers = {
                Accept: 'image/*',
                Authorization: `Bearer ${useCredits ? process.env.STABILITY_API_KEY : stabilityAPIKey}`,
            };
        } else if (model === 'playground-v2') {
            if (img) {
                formData = new FormData();
                formData.append('init_image', img);
                formData.append('prompt', message!);
                formData.append('init_image_mode', 'IMAGE_STRENGTH');
                formData.append('image_strength', '0.5');
                formData.append('cfg_scale', 7);
                formData.append('seed', 1);
                formData.append('steps', 30);
                formData.append('safety_check', false);

                apiUrl = 'https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/playground-v2-1024px-aesthetic/image_to_image';
                headers = {
                    Accept: 'image/jpeg',
                    Authorization: `Bearer ${useCredits ? process.env.FIREWORKS_API_KEY : fireworksAPIKey}`,
                };
            } else {
                apiUrl = 'https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/playground-v2-1024px-aesthetic';
                requestBody = {
                    cfg_scale: 7,
                    height: 1024,
                    width: 1024,
                    samples: 1,
                    steps: 30,
                    seed: 0,
                    style_preset: null,
                    safety_check: false,
                    prompt: message!,
                };
                headers = {
                    'Content-Type': 'application/json',
                    Accept: 'image/jpeg',
                    Authorization: `Bearer ${useCredits ? process.env.FIREWORKS_API_KEY : fireworksAPIKey}`,
                };
            }
        }

        if (!apiUrl) {
            return NextResponse.json({ error: "Invalid model type" }, { status: 400 });
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: (model !== 'stability-sd3-turbo' && !img) ? JSON.stringify(requestBody) : formData,
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Error from Image API: ${response.status} ${response.statusText}` }, { status: 500 });
        }

        let imageData: ArrayBuffer;

        if (model === 'dall-e') {
            const dalleResponse: DalleResponse = await response.json() as DalleResponse;
            const imageUrl = dalleResponse.data[0].url;
            imageData = await fetch(imageUrl).then(res => res.arrayBuffer());
        } else {
            imageData = await response.arrayBuffer();
        }

        const finalImage = Buffer.from(imageData);

        const fileName = `generated/${uid}/${Date.now()}.jpg`;
        const file = adminBucket.file(fileName);

        await file.save(finalImage, {
            contentType: 'image/jpeg',
        });

        const metadata = {
            metadata: {
                prompt: message!,
            },
        };

        await file.setMetadata(metadata);

        const [imageUrl] = await file.getSignedUrl({
            action: 'read',
            expires: '03-17-2125',
        });

        return NextResponse.json({ imageUrl }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error generating image:', error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
