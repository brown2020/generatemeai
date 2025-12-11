import { Variants, Transition } from "framer-motion";

/**
 * Animation variants for homepage image grid.
 */
export const homeImageAnimation: Variants = {
  initial: {
    rotate: 0,
    scale: 1,
  },
  animate: {
    rotate: [0, 1, -1, 0],
    scale: [1, 1.02, 1],
  },
};

/**
 * Transition config for homepage image animation.
 */
export const homeImageTransition: Transition = {
  duration: 2,
  repeat: Infinity,
  repeatType: "loop",
  ease: "easeInOut",
};

/**
 * Hover animation for homepage images.
 */
export const homeImageHover = {
  scale: 1.05,
  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
};

/**
 * Tap animation for homepage images.
 */
export const homeImageTap = {
  scale: 0.98,
};

/**
 * D-ID animation options for video generation.
 */
export const animations = [
  { id: 1, label: "Nostalgia", value: "nostalgia" },
  { id: 2, label: "Fun", value: "fun" },
  { id: 3, label: "Dance", value: "dance" },
  { id: 4, label: "Classic", value: "classic" },
  { id: 5, label: "Stitch", value: "stitch" },
];
