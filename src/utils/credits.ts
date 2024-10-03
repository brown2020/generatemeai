import { model } from "@/types/model";

const parseEnvVarToNumber = (envVar: string | undefined, fallback: number): number => {
    return envVar ? parseInt(envVar, 10) : fallback;
};

export const creditsToMinus = (model: model): number => {
    if (model === 'dall-e') {
        return parseEnvVarToNumber(process.env.NEXT_PUBLIC_CREDITS_PER_DALL_E_IMAGE, 4);
    } else if (model == 'stable-diffusion-xl') {
        return parseEnvVarToNumber(process.env.NEXT_PUBLIC_CREDITS_PER_STABLE_DIFFUSION_XL_IMAGE, 4);
    } else if (model == 'stability-sd3-turbo') {
        return parseEnvVarToNumber(process.env.NEXT_PUBLIC_CREDITS_PER_STABILITY_SD3_TURBO_IMAGE, 4);
    } else if (model == 'playground-v2') {
        return parseEnvVarToNumber(process.env.NEXT_PUBLIC_CREDITS_PER_PLAYGROUND_V2_IMAGE, 4);
    } else if (model == 'bria.ai') {
        return parseEnvVarToNumber(process.env.NEXT_PUBLIC_CREDITS_PER_BRIA_IMAGE, 4);
    }

    return 4;
};
