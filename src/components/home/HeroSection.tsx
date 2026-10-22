"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { buttonClassName } from "@/components/ui";
import AuthComponent from "@/components/AuthComponent";
import { STARTING_CREDITS } from "@/utils/creditCost";

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
    <LazyMotion features={domAnimation}>
    <section className="relative overflow-hidden bg-white">
      {/* Subtle gradient background */}
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-white to-gray-50" />

      {/* Decorative elements */}
      <div aria-hidden="true" className="absolute top-20 left-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl" />
      <div aria-hidden="true" className="absolute bottom-10 right-10 w-96 h-96 bg-gray-100/50 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>AI-Powered Image Generation</span>
          </m.div>

          {/* Heading */}
          <m.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance text-gray-900"
          >
            {isLoggedIn ? (
              displayName ? (
                <>
                  Welcome back,{" "}
                  <span className="text-blue-600">{displayName}</span>
                </>
              ) : (
                <>
                  Welcome <span className="text-blue-600">back</span>
                </>
              )
            ) : (
              <>
                Turn your ideas into{" "}
                <span className="text-blue-600">stunning visuals</span>
              </>
            )}
          </m.h1>

          {/* Subheading */}
          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            {isLoggedIn
              ? "Describe an idea, pick a model and style, and get images in seconds."
              : "Create beautiful AI-generated images with OpenAI's GPT Image and dozens of artistic styles. No design skills required."}
          </m.p>

          {/* CTA Buttons */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {isLoggedIn ? (
              <Link href="/generate" className={buttonClassName({ size: "lg", className: "gap-2.5" })}>
                Start Creating
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            ) : (
              <>
                <AuthComponent />
                <Link href="/about" className={buttonClassName({ variant: "ghost", size: "lg" })}>
                  Learn More
                </Link>
              </>
            )}
          </m.div>

          {/* Trust indicators */}
          {!isLoggedIn && (
            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 text-sm text-gray-600"
            >
              No credit card required. {STARTING_CREDITS} free credits to start.
            </m.p>
          )}
        </div>
      </div>
    </section>
    </LazyMotion>
  );
}

export default HeroSection;
