import { dalleStrategy } from "./dalle";
import {
  fireworksStrategy,
  playgroundV2Strategy,
  playgroundV25Strategy,
} from "./fireworks";
import { stabilityStrategy } from "./stability";
import { replicateStrategy } from "./replicate";
import { ideogramStrategy } from "./ideogram";
import { GenerationStrategy } from "./types";

export const strategies: Record<string, GenerationStrategy> = {
  "dall-e": dalleStrategy,
  "stable-diffusion-xl": fireworksStrategy,
  "stability-sd3-turbo": stabilityStrategy,
  "playground-v2": playgroundV2Strategy,
  "playground-v2-5": playgroundV25Strategy,
  "flux-schnell": replicateStrategy,
  "ideogram-ai": ideogramStrategy,
};

