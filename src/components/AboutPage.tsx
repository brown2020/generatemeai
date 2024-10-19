"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function AboutPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className="flex flex-col h-full items-center px-6 py-12 justify-center w-full max-w-5xl mx-auto flex-1 gap-12 bg-gray-100">
      <div className="text-3xl font-bold text-center text-gray-800">
        About Generate.me
      </div>

      {/* About Section */}
      <div className="bg-white shadow-md p-8 rounded-lg">
        <p className="text-lg text-gray-700 leading-relaxed">
          Welcome to <strong>Generate.me</strong>, an innovative platform that
          brings your imagination to life through cutting-edge AI models.
          Whether you&apos;re an artist, a creator, or simply someone with a
          spark of inspiration, Generate.me empowers you to describe your vision
          and watch it materialize as stunning images. With multiple
          state-of-the-art AI engines like{" "}
          <strong>
            DALL-E, Stable Diffusion, Stability SD3-Turbo, Playground V2, and
            Vertex Imagen AI
          </strong>{" "}
          integrated into the platform, the possibilities are endless.
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
          <strong>add tags</strong>, <strong>search and filter</strong> your
          images, and <strong>regenerate</strong> them using the same or edited
          prompts. You can also make your images <strong>sharable</strong> and
          easily <strong>download</strong> or <strong>share</strong> them with
          your friends, community, or social media followers.
        </p>
        <p className="mt-4 text-lg text-gray-700">
          Whether you&apos;re experimenting with different styles, refining your
          ideas, or simply enjoying the process of creation, Generate.me is here
          to help you unleash your creative potential. Join the growing
          community of creators and start generating today!
        </p>
      </div>

      {/* Instructions Section */}
      <div className="bg-white shadow-md p-8 rounded-lg">
        <div className="text-3xl font-semibold text-gray-800 mb-6">
          How to Use Generate.me
        </div>
        <ol className="list-decimal list-inside space-y-3 text-gray-700 text-lg">
          <li>
            <strong>Describe Your Image:</strong> Start by typing a detailed
            description of the image you want to generate. The more specific you
            are, the better the AI can understand your vision.
          </li>
          <li>
            <strong>Choose Your Model:</strong> Select from a variety of
            advanced AI models including DALL-E, Stable Diffusion, Stability
            SD3-Turbo, Playground V2, or Vertex Imagen AI. Each model has its
            own strengths in terms of style and detail.
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
            saved to your profile. Here, you can add custom tags, search,
            filter, and edit or regenerate your images. You can also download
            your creations and make them sharable.
          </li>
          <li>
            <strong>Share Your Work:</strong> Share your art with the world! You
            can generate a sharable link or directly share to social media from
            within the platform.
          </li>
        </ol>
      </div>

      {/* FAQs Section */}
      <div className="bg-white shadow-md p-8 rounded-lg w-full">
        <div className="text-3xl font-semibold text-gray-800 mb-6">
          Frequently Asked Questions
        </div>
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div key={index} className="border-b border-gray-300 pb-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-medium text-lg text-gray-800">
                  {faq.question}
                </span>
                {openFAQ === index ? (
                  <ChevronUp className="text-gray-500" />
                ) : (
                  <ChevronDown className="text-gray-500" />
                )}
              </div>
              {openFAQ === index && (
                <div className="mt-3 text-gray-600 text-lg">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const faqData = [
  {
    question: "1. What is Generate.me?",
    answer:
      "Generate.me is a powerful AI-based platform that allows users to create images from text descriptions using a variety of cutting-edge AI models like DALL-E, Stable Diffusion, and others.",
  },
  {
    question: "2. How do I generate an image?",
    answer:
      'Simply describe the image you want to create, select an AI model, choose an artistic style, and click "Generate". The AI will then produce an image based on your input.',
  },
  {
    question: "3. Can I edit the images I’ve generated?",
    answer:
      "Yes! You can edit your prompt and regenerate an image using the same model, or try out different styles and AI models for new variations.",
  },
  {
    question: "4. What are tags and how do I use them?",
    answer:
      "Tags help you organize your generated images. You can add custom tags to each image, making it easier to search and filter through your creations later.",
  },
  {
    question: "5. How can I share my images?",
    answer:
      "Images can be shared by generating a shareable link or directly posting to your social media channels from within the platform.",
  },
  {
    question: "6. Can I download my images?",
    answer:
      "Yes, you can download any image you create in high resolution directly to your device.",
  },
  {
    question: "7. Are there any limitations to the models?",
    answer:
      "Each AI model has its own strengths and limitations. Some models may excel at realism while others are better at abstract or artistic styles. We recommend experimenting to find the best model for your needs.",
  },
  {
    question: "8. Is there a limit to the number of images I can generate?",
    answer:
      "Currently, we offer a set number of free generations per user. Additional image generations may require a subscription or credits, depending on your usage.",
  },
  {
    question: "9. Can I use my own API keys instead of buying credits?",
    answer:
      "Yes, you can use your own API keys! Just go to your profile, add your API keys, and select the option to use them instead of the platform’s default credit system.",
  },
];
