import type { Transition } from "framer-motion";

export const motionSprings = {
  snappy: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 },
  smooth: { type: "spring", stiffness: 300, damping: 32, mass: 1.0 },
  bouncy: { type: "spring", stiffness: 450, damping: 22 },
  interactive: { type: "spring", stiffness: 500, damping: 35 },
} satisfies Record<string, Transition>;
