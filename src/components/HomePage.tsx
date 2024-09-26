"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import { db } from "../firebase/firebaseClient";
import AuthComponent from "@/components/AuthComponent";
import { motion } from "framer-motion";

export default function HomePage() {
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imageQuery = query(
          collection(db, "publicImages"),
          orderBy("timestamp", "desc"),
          limit(30)
        );
        
        const imageSnapshot = await getDocs(imageQuery);
        const filteredImages = imageSnapshot.docs.filter(doc => {
          const data = doc.data();
          return !data.password || data.password === '';
        });
        
        const images = filteredImages.map((doc) => doc.data().downloadUrl as string);
        
        if(images.length >= 15) setBackgroundImages(images);
      } catch (error) {
        console.error("Error fetching images from Firestore:", error);
      }
    };

    fetchImages();
  }, []);

  const getDisplayedImages = () => {
    if (window.innerWidth < 400) return backgroundImages.slice(0, 5);
    if (window.innerWidth < 768) return backgroundImages.slice(0, 10);
    return backgroundImages.slice(0, 15);
  };

  const displayedImages = getDisplayedImages();

  return (
    <div className="relative flex flex-col h-full w-full justify-center items-center text-white overflow-hidden">
      {backgroundImages.length >= 5 && (
        <div className="absolute top-0 left-0 w-full h-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-2 z-0">
          {displayedImages.map((image, index) => (
            <motion.div
              key={index}
              className="bg-cover bg-center rounded-lg shadow-lg"
              style={{
                backgroundImage: `url(${image})`,
                width: '100%',
                height: '0',
                paddingBottom: '100%',
                cursor: 'pointer'
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
