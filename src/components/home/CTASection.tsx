"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Button } from "@/components/ui";

interface CTASectionProps {
  isLoggedIn: boolean;
}

/**
 * Final call-to-action section with contrast background.
 */
export function CTASection({ isLoggedIn }: CTASectionProps) {
  return (
    <LazyMotion features={domAnimation}>
    <section className="py-24 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <m.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-white"
        >
          Ready to start creating?
        </m.h2>

        <m.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto"
        >
          {isLoggedIn
            ? "Jump back into your creative flow and generate something amazing."
            : "Join thousands of creators using AI to bring their ideas to life. Start for free today."}
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10"
        >
          <Link href="/generate">
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              {isLoggedIn ? "Go to Studio" : "Get Started Free"}
            </Button>
          </Link>
        </m.div>

        {!isLoggedIn && (
          <m.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-sm text-gray-500"
          >
            No credit card required. Cancel anytime.
          </m.p>
        )}
      </div>
    </section>
    </LazyMotion>
  );
}

export default CTASection;
