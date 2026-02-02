"use client";

import { motion } from "framer-motion";
import {
  Palette,
  Zap,
  Sparkles,
  Video,
  Download,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Multiple AI Models",
    description:
      "Access DALL-E, Stable Diffusion, Flux, Ideogram, and more. Choose the perfect model for your creative vision.",
  },
  {
    icon: Sparkles,
    title: "Art Styles & Presets",
    description:
      "Explore dozens of art styles, color schemes, and lighting presets to achieve your desired aesthetic.",
  },
  {
    icon: Zap,
    title: "Fast Generation",
    description:
      "Generate high-quality images in seconds with our optimized infrastructure and efficient models.",
  },
  {
    icon: Video,
    title: "Video Creation",
    description:
      "Transform your images into talking avatars and animated videos with D-ID and Runway ML.",
  },
  {
    icon: Download,
    title: "Easy Export",
    description:
      "Download your creations in high resolution. Share directly to social media or save to your gallery.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your images are private by default. Control sharing settings and protect with passwords.",
  },
];

/**
 * Features grid showcasing key platform capabilities.
 */
export function FeaturesGrid() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-900"
          >
            Everything you need to create
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-gray-600"
          >
            Powerful tools and flexible options to bring your imagination to life
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-6">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesGrid;
