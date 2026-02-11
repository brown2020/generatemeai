export interface StrategyContext {
  message: string;
  img: File | null;
  apiKey: string;
  useCredits: boolean;
  aspectRatio?: string;
  negativePrompt?: string;
  imageCount?: number;
}

export type GenerationStrategy = (
  context: StrategyContext
) => Promise<ArrayBuffer | Buffer | Array<ArrayBuffer | Buffer>>;

export interface IdeogramResponse {
  created: string;
  data: {
    is_image_safe: boolean;
    prompt: string;
    resolution: string;
    seed: number;
    style_type: string;
    url: string;
  }[];
}
