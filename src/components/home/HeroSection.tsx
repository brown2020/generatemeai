"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import AuthComponent from "@/components/AuthComponent";

interface HeroSectionProps {
  isLoggedIn: boolean;
  displayName?: string;
}

/**
 * Hero section with value proposition and primary CTA.
 * Clean, minimal design with subtle gradient background.
 */
export function HeroSection({ isLoggedIn, displayName }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-gray-50" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gray-100/50 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Image Generation</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900"
          >
            {isLoggedIn ? (
              <>
                Welcome back,{" "}
                <span className="text-blue-600">
                  {displayName || "Creator"}
                </span>
              </>
            ) : (
              <>
                Turn your ideas into{" "}
                <span className="text-blue-600">stunning visuals</span>
              </>
            )}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            {isLoggedIn
              ? "Ready to create something amazing? Start generating images with our powerful AI models."
              : "Create beautiful AI-generated images with DALL-E, Stable Diffusion, Flux, and more. No design skills required."}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {isLoggedIn ? (
              <Link href="/generate">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Start Creating
                </Button>
              </Link>
            ) : (
              <>
                {/* Sign in / Sign up button */}
                <AuthComponent />
                <Link href="/about">
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Trust indicators */}
          {!isLoggedIn && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 text-sm text-gray-500"
            >
              No credit card required. 1000 free credits to start.
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
