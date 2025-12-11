"use client";

import AuthComponent from "@/components/AuthComponent";
import { motion } from "framer-motion";
import { useAuthState } from "@/zustand/selectors";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HomePageProps {
  initialImages: string[];
}

export default function HomePage({ initialImages = [] }: HomePageProps) {
  const { uid, authDisplayName, authReady } = useAuthState();

  return (
    <div className="relative flex flex-col h-full w-full justify-center items-center text-white overflow-hidden bg-gray-950">
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

      <div className="flex flex-col z-10 gap-6 px-6 py-8 md:px-12 md:py-12 text-center max-w-4xl bg-black/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10">
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Generate.me
        </h1>

        {authReady && uid ? (
          <div className="flex flex-col gap-6 items-center">
            <h2 className="text-xl md:text-3xl font-medium text-gray-200">
              Welcome back,{" "}
              <span className="text-white font-bold">
                {authDisplayName || "Creator"}
              </span>
              !
            </h2>
            <p className="text-gray-300 max-w-lg text-lg">
              Ready to transform your ideas into stunning visuals?
            </p>
            <Link
              href="/generate"
              className="btn-primary text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              Start Generating <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl md:text-4xl font-semibold text-white">
              Turn your ideas into reality
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-2">
              Sign in to start creating amazing AI-generated images.
            </p>
            <AuthComponent />
          </div>
        )}
      </div>
    </div>
  );
}
