import { Timestamp } from "firebase/firestore";
import { model } from "./model";

/**
 * Base generation parameters shared across image types.
 */
export interface ImageGenerationParams {
  freestyle?: string;
  style?: string;
  model?: model;
  colorScheme?: string;
  lighting?: string;
  perspective?: string;
  composition?: string;
  medium?: string;
  mood?: string;
  imageCategory?: string;
  prompt?: string;
}

/**
 * Represents the complete data structure for a generated image.
 * Used in ImagePage, ImageSelector, and related components.
 */
export interface ImageData extends ImageGenerationParams {
  id: string;
  downloadUrl: string;
  videoDownloadUrl?: string;

  // Media-specific
  imageReference?: string;
  videoModel?: string;
  audio?: string;
  scriptPrompt?: string;
  animation?: string;

  // Display/sharing
  caption?: string;
  tags?: string[];
  backgroundColor?: string;
  isSharable?: boolean;
  password?: string;

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
