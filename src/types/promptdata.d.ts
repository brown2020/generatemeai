import { Timestamp } from "firebase/firestore";

export type PromptDataType = {
  style?: string;
  freestyle?: string;
  downloadUrl?: string;
  prompt?: string;
  timestamp?: Timestamp;
  id?: string;
  model: string;
  colorScheme?: string;
  lighting?: string;
  tags: string[];
  imageReference?: string;
  imageCategory?: string;
};
