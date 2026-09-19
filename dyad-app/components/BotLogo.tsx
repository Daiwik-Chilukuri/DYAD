'use client';

import React from 'react';

interface BotLogoProps {
  className?: string;
  isActive?: boolean;
}

export function BotLogo({ className = 'size-6', isActive = false }: BotLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img
        src="/bot-icon-transparent.png"
        alt="Autonomous Swarm Intelligence"
        className={`w-full h-full object-contain transition-all duration-200 ${
          isActive
            ? 'filter drop-shadow-[0_0_8px_rgba(10,177,186,0.6)] scale-105 opacity-100'
            : 'opacity-75 hover:opacity-100'
        }`}
      />
    </div>
  );
}

export default BotLogo;
