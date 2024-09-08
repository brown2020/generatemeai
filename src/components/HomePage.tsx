"use client";

import AuthComponent from "@/components/AuthComponent";

export default function HomePage() {
  return (
    <div className="flex flex-col h-full w-full justify-center items-center text-white">
      <div
        style={{
          backgroundImage: `url("/assets/bg_sidebar_intro.jpg")`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          position: "absolute",
          height: "100%",
          width: "100%",
          top: 0,
          left: 0,
        }}
      />

      <div className="flex flex-col z-10 gap-5 px-4 py-4 md:px-9 md:py-9 text-center max-w-4xl bg-black/60 rounded-lg">
        <h2 className="text-3xl md:text-5xl font-semibold">
          Welcome to Generate.me
        </h2>

        <h2 className="text-xl md:text-2xl md:px-9">
          Sign in to use this image generation demo.
        </h2>

        <AuthComponent />
      </div>
    </div>
  );
}
