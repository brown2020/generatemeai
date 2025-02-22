import { Timestamp } from "firebase/firestore";

export interface PromptDataType {
  style: string;
  freestyle: string;
  downloadUrl?: string;
  prompt?: string;
  model: string;
  colorScheme: string;
  lighting: string;
  perspective: string;
  composition: string;
  medium: string;
  mood: string;
  tags: string[];
  imageCategory?: string;
  imageReference?: string;
  id?: string;
  timestamp?: Timestamp;
} 