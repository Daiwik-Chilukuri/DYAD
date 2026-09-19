export const motionSprings = {
  // Snappy for buttons, icons, chips, and small feedback
  snappy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  },
  // Smooth for large drawers, sliding dossier panel, dialog entries
  smooth: {
    type: "spring" as const,
    stiffness: 300,
    damping: 32,
    mass: 1.0,
  },
  // Bouncy for success checkmarks, radar pings, highlight pulses
  bouncy: {
    type: "spring" as const,
    stiffness: 450,
    damping: 22,
  },
} as const;
