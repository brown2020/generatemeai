"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function AboutPage() {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const toggleFAQ = (question: string) => {
    setOpenFAQ((prev) => (prev === question ? null : question));
  };

  return (
    <div className="w-full flex-1 bg-gray-50">
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-center text-balance text-gray-900">
        About Generate.me
      </h1>

      {/* About Section */}
      <div className="bg-white shadow-xs border border-gray-200 p-6 sm:p-8 rounded-xl">
        <p className="text-lg text-gray-700 leading-relaxed">
          Welcome to <strong>Generate.me</strong>, an innovative platform that
          brings your imagination to life through cutting-edge AI models.
          Whether you&apos;re an artist, a creator, or simply someone with a
          spark of inspiration, Generate.me empowers you to describe your vision
          and watch it materialize as stunning images, powered by
          OpenAI&apos;s <strong>GPT Image</strong> model.
        </p>
        <p className="mt-4 text-lg text-gray-700">
          <span className="font-bold">Explore Artistic Styles:</span>{" "}
          Generate.me offers a diverse range of artistic styles to suit your
          creative needs, from <strong>Ancient Egyptian art</strong> to{" "}
          <strong>Renaissance masterpieces</strong>. Let your creativity flow as
          you blend historical and modern artistic movements to create truly
          unique visuals.
        </p>
        <p className="mt-4 text-lg text-gray-700">
          <span className="font-bold">Customizable and Shareable:</span> Every
          image you generate is stored on your profile, where you can{" "}
          <strong>add tags</strong>, <strong>filter</strong> your images, and
          manage image details. You can also make your images{" "}
          <strong>shareable</strong> and easily <strong>download</strong> or{" "}
          <strong>share</strong> them with your friends, community, or social
          media followers.
        </p>
        <p className="mt-4 text-lg text-gray-700">
          Whether you&apos;re experimenting with different styles, refining your
          ideas, or simply enjoying the process of creation, Generate.me is here
          to help you unleash your creative potential. Join the growing
          community of creators and start generating today!
        </p>
      </div>

      {/* Instructions Section */}
      <div className="bg-white shadow-xs border border-gray-200 p-6 sm:p-8 rounded-xl">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          How to Use Generate.me
        </h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-700 text-lg">
          <li>
            <strong>Describe Your Image:</strong> Start by typing a detailed
            description of the image you want to generate. The more specific you
            are, the better the AI can understand your vision.
          </li>
          <li>
            <strong>Set the Format:</strong> Pick an aspect ratio and how
            many images you want from GPT Image in one run.
          </li>
          <li>
            <strong>Select Artistic Style:</strong> Add an artistic flair by
            choosing from different styles such as Ancient Egyptian, Prehistoric
            Art, Renaissance Art, and more. This step allows you to tailor your
            image to your preferred aesthetic.
          </li>
          <li>
            <strong>Generate Your Image:</strong> Once you&apos;re happy with
            your description and selections, hit the &apos;Generate&apos;
            button. The AI will process your request and create a unique image
            based on your input.
          </li>
          <li>
            <strong>Manage Your Images:</strong> All images you generate will be
            saved to your profile. Here, you can add custom tags, filter your
            gallery, download your creations, and make them shareable.
          </li>
          <li>
            <strong>Share Your Work:</strong> Share your art with the world! You
            can generate a sharable link or directly share to social media from
            within the platform.
          </li>
        </ol>
      </div>

      {/* FAQs Section */}
      <div className="bg-white shadow-xs border border-gray-200 p-6 sm:p-8 rounded-xl w-full">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqData.map((faq) => (
            <div key={faq.question} className="border-b border-gray-300 pb-4">
              <button
                type="button"
                className="flex w-full justify-between items-center gap-4 rounded-sm text-left"
                onClick={() => toggleFAQ(faq.question)}
                aria-expanded={openFAQ === faq.question}
              >
                <span className="font-medium text-lg text-gray-800">
                  {faq.question}
                </span>
                {openFAQ === faq.question ? (
                  <ChevronUp className="shrink-0 text-gray-500" />
                ) : (
                  <ChevronDown className="shrink-0 text-gray-500" />
                )}
              </button>
              {openFAQ === faq.question && (
                <div className="mt-3 text-gray-600 text-lg">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}

const faqData = [
  {
    question: "What is Generate.me?",
    answer:
      "Generate.me is a powerful AI-based platform that allows users to create images from text descriptions using OpenAI's GPT Image model.",
  },
  {
    question: "How do I generate an image?",
    answer:
      'Simply describe the image you want to create, choose an artistic style, and click "Generate". The AI will then produce an image based on your input.',
  },
  {
    question: "Can I manage the images I've generated?",
    answer:
      "Yes. You can update tags, captions, background colors, sharing settings, and downloads from the image detail page.",
  },
  {
    question: "What are tags and how do I use them?",
    answer:
      "Tags help you organize your generated images. You can add custom tags to each image, making it easier to filter through your creations later.",
  },
  {
    question: "How can I share my images?",
    answer:
      "Images can be shared by generating a shareable link or directly posting to your social media channels from within the platform.",
  },
  {
    question: "Can I download my images?",
    answer:
      "Yes, you can download any image you create in high resolution directly to your device.",
  },
  {
    question: "Which AI model does Generate.me use?",
    answer:
      "Images are generated with OpenAI's GPT Image model. It handles both realistic and stylized prompts, so try different artistic styles and settings to steer the result.",
  },
  {
    question: "Is there a limit to the number of images I can generate?",
    answer:
      "Image and video generation can use platform credits, or you can bring your own provider API keys and pay providers directly.",
  },
  {
    question: "Can I use my own API keys instead of buying credits?",
    answer:
      "Yes, you can use your own API keys! Just go to your profile, add your API keys, and select the option to use them instead of the platform’s default credit system.",
  },
];
