"use client";

import { useAuthState } from "@/zustand/selectors";
import {
  HeroSection,
  FeaturesGrid,
  HowItWorks,
  ImageShowcase,
  CTASection,
} from "@/components/home";

interface ShowcaseImage {
  id: string;
  downloadUrl: string;
  caption?: string;
}

interface HomePageProps {
  /** Array of image URLs for backwards compatibility, or full image objects */
  initialImages: string[] | ShowcaseImage[];
}

/**
 * Landing page component with modern minimal design.
 *
 * Displays a full landing experience for guests and a streamlined
 * welcome for authenticated users.
 */
export default function HomePage({ initialImages = [] }: HomePageProps) {
  const { uid, authDisplayName, authReady } = useAuthState();

  const isLoggedIn = authReady && !!uid;

  // Normalize images to ShowcaseImage format
  const showcaseImages: ShowcaseImage[] = initialImages.map((img, index) => {
    if (typeof img === "string") {
      return { id: `img-${index}`, downloadUrl: img };
    }
    return img;
  });

  return (
    <div className="min-h-full bg-white">
      {/* Hero Section */}
      <HeroSection isLoggedIn={isLoggedIn} displayName={authDisplayName} />

      {/* Features - show for guests, hide for logged in users */}
      {!isLoggedIn && <FeaturesGrid />}

      {/* How it Works - show for guests */}
      {!isLoggedIn && <HowItWorks />}

      {/* Image Showcase - show if we have images */}
      {showcaseImages.length > 0 && (
        <ImageShowcase images={showcaseImages} />
      )}

      {/* Final CTA */}
      <CTASection isLoggedIn={isLoggedIn} />
    </div>
  );
}
