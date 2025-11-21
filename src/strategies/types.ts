export interface StrategyContext {
  message: string;
  img: File | null;
  apiKey: string;
  useCredits: boolean;
}

export type GenerationStrategy = (
  context: StrategyContext
) => Promise<ArrayBuffer | Buffer>;

export interface DalleResponse {
  data: {
    url: string;
  }[];
}

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

export enum AspectRatio {
  ASPECT_10_16 = "ASPECT_10_16",
  ASPECT_16_10 = "ASPECT_16_10",
  ASPECT_16_9 = "ASPECT_16_9",
  ASPECT_1_1 = "ASPECT_1_1",
  ASPECT_1_3 = "ASPECT_1_3",
  ASPECT_2_3 = "ASPECT_2_3",
  ASPECT_3_1 = "ASPECT_3_1",
  ASPECT_3_2 = "ASPECT_3_2",
  ASPECT_3_4 = "ASPECT_3_4",
  ASPECT_4_3 = "ASPECT_4_3",
  ASPECT_9_16 = "ASPECT_9_16",
}

