"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface ShowcaseImage {
  id: string;
  downloadUrl: string;
  caption?: string;
}

interface ImageShowcaseProps {
  images: ShowcaseImage[];
}

/**
 * Image showcase grid displaying sample generated images.
 */
export function ImageShowcase({ images }: ImageShowcaseProps) {
  if (!images || images.length === 0) {
    return null;
  }

  // Take up to 8 images for the showcase
  const showcaseImages = images.slice(0, 8);

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
            Created with Generate.me
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-gray-600"
          >
            Explore what our community has created
          </motion.p>
        </div>

        {/* Image grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {showcaseImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="aspect-square relative rounded-xl overflow-hidden bg-gray-200 group"
            >
              <Image
                src={image.downloadUrl}
                alt={image.caption || "AI generated image"}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ImageShowcase;
