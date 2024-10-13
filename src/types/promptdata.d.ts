import { Timestamp } from "firebase/firestore";

export type PromptDataType = {
  style?: string;
  freestyle?: string;
  downloadUrl?: string;
  videoDownloadUrl?: string;
  prompt?: string;
  scriptPrompt?: string;
  timestamp?: Timestamp;
  id?: string;
  model: string;
  videoModel?: string;
  colorScheme?: string;
  lighting?: string;
  tags: string[];
  imageReference?: string;
  imageCategory?: string;
  audio?: string;
  animation?: string;
};
