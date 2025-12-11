import { Timestamp } from "firebase/firestore";
import { GenerationParams } from "./generation";

/**
 * Represents the complete data structure for a generated image.
 * Extends base GenerationParams with display and sharing properties.
 */
export interface ImageData extends Partial<GenerationParams> {
  id: string;
  downloadUrl: string;
  videoDownloadUrl?: string;

  // Display/sharing
  caption?: string;
  backgroundColor?: string;
  isSharable?: boolean;
  password?: string;

  // Video-specific
  videoModel?: string;
  audio?: string;
  scriptPrompt?: string;
  animation?: string;

  // Metadata
  timestamp?: Timestamp;
}

/**
 * Represents a minimal image data structure for list views.
 */
export interface ImageListItem {
  id: string;
  downloadUrl?: string;
  caption?: string;
  freestyle?: string;
  tags?: string[];
  backgroundColor?: string;
  videoDownloadUrl?: string;
  timestamp?: Timestamp;
}

/**
 * Props for image-related components that receive image data.
 */
export interface ImagePageProps {
  id: string;
}

/**
 * Type guard to check if image data has video content.
 */
export const hasVideo = (image: ImageData): boolean => {
  return !!image.videoDownloadUrl;
};

/**
 * Type guard to check if image is password protected.
 */
export const isPasswordProtected = (image: ImageData): boolean => {
  return !!image.password && image.password.length > 0;
};
