// components/home/FairyLights.tsx
"use client";
import React from "react";

export default function FairyLights(): React.ReactElement {
  const bulbs = new Array(18).fill(null);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 z-40 pointer-events-none fairy-wrap"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative w-full">
          {/* curved wire */}
          <svg
            className="absolute left-0 right-0 top-0 w-full h-8"
            viewBox="0 0 1200 40"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,20 C200,2 400,38 600,20 C800,2 1000,38 1200,20"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          <ul className="relative z-10 mt-4 flex justify-between items-start w-full">
            {bulbs.map((_, i) => (
              <li
                key={i}
                className={`flex flex-col items-center gap-1 pointer-events-none bulb bulb-${i + 1}`}
              >
                <span className="block h-4 w-px bg-white/80 rounded-sm" />
                <span className="block bulb-dot w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-yellow-200" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style jsx>{`
        .fairy-wrap { top: 64px; }
        @media (min-width: 768px) { .fairy-wrap { top: 72px; } }

        .bulb-dot {
          box-shadow: 0 0 6px rgba(255, 240, 170, 0.9),
            0 0 20px rgba(255, 235, 150, 0.28);
          transform-origin: center;
          opacity: 0.9;
          animation: twinkle 3.2s ease-in-out infinite;
          transition: filter 180ms ease;
        }

        /* staggered delays via nth-child to avoid manual classes */
        ul > li:nth-child(odd) .bulb-dot { animation-delay: 0.12s; }
        ul > li:nth-child(2n) .bulb-dot { animation-delay: 0.36s; }
        ul > li:nth-child(3n) .bulb-dot { animation-delay: 0.64s; }
        ul > li:nth-child(4n) .bulb-dot { animation-delay: 0.92s; }
        ul > li:nth-child(5n) .bulb-dot { animation-delay: 1.2s; }

        @keyframes twinkle {
          0% {
            opacity: 0.6;
            transform: translateY(0) scale(0.94);
            filter: brightness(0.9) blur(0px);
          }
          35% {
            opacity: 1;
            transform: translateY(-3px) scale(1.18);
            filter: brightness(1.22) blur(0.25px);
          }
          70% {
            opacity: 0.78;
            transform: translateY(-1px) scale(0.98);
            filter: brightness(0.98) blur(0px);
          }
          100% {
            opacity: 0.85;
            transform: translateY(0) scale(1);
            filter: brightness(1) blur(0px);
          }
        }

        /* slight vertical offset variations so string looks natural */
        ul > li:nth-child(4n+1) span:first-child { height: 5rem; background-color: rgba(255,255,255,0.8); }
        ul > li:nth-child(4n+2) span:first-child { height: 3.5rem; background-color: rgba(255,255,255,0.8); }
        ul > li:nth-child(4n+3) span:first-child { height: 4.25rem; background-color: rgba(255,255,255,0.8); }
        ul > li:nth-child(4n+4) span:first-child { height: 3rem; background-color: rgba(255,255,255,0.8); }

        :global(.pointer-events-none) { pointer-events: none; }

        @media (prefers-reduced-motion: reduce) {
          .bulb-dot { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}
