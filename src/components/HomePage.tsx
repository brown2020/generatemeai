"use client";

import AuthComponent from "@/components/AuthComponent";
import { motion } from "framer-motion";

interface HomePageProps {
  initialImages: string[];
}

export default function HomePage({ initialImages = [] }: HomePageProps) {
  return (
    <div className="relative flex flex-col h-full w-full justify-center items-center text-white overflow-hidden">
      {initialImages.length >= 5 && (
        <div className="absolute top-0 left-0 w-full h-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-2 z-0">
          {initialImages.map((image, index) => (
            <motion.div
              key={index}
              className="bg-cover bg-center rounded-lg shadow-lg"
              style={{
                backgroundImage: `url(${image})`,
                width: "100%",
                height: "0",
                paddingBottom: "100%",
                cursor: "pointer",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
              }}
              animate={{
                rotate: [0, 1, -1, 0],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }}
              whileTap={{ scale: 0.98 }}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col z-10 gap-5 px-4 py-4 md:px-9 md:py-9 text-center max-w-4xl bg-black/60 rounded-lg">
        <h2 className="text-3xl md:text-5xl font-semibold">
          Welcome to Generate.me
        </h2>

        <h2 className="text-xl md:text-2xl md:px-9">
          Sign in to use this image generation.
        </h2>

        <AuthComponent />
      </div>
    </div>
  );
}
