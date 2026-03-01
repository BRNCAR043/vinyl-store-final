// components/home/PosterRow.tsx
"use client";
import React from "react";

const POSTERS = [
  "/poster1.png",
  "/poster2.png",
  "/poster3.png",
  "/poster4.png",
  "/poster5.png",
];

export default function PosterRow() {
  // More sporadic, less neat layout, spread out wide
  const posterStyles = [
    { rotate: '-7deg', translateY: '10px', z: 20, left: '9%' },
    { rotate: '2deg', translateY: '-8px', z: 22, left: '27%' },
    { rotate: '0deg', translateY: '18px', z: 18, left: '46%' },
    { rotate: '6deg', translateY: '-4px', z: 21, left: '64%' },
    { rotate: '-3deg', translateY: '12px', z: 19, left: '82%' },
  ];
  return (
    <div className="w-full relative flex justify-center mt-12 min-h-[180px] md:min-h-[280px] lg:min-h-[340px]">
      <div className="w-full max-w-7xl relative h-full">
        {POSTERS.map((src, i) => (
          <div
            key={src}
            className="absolute"
            style={{
              left: posterStyles[i].left,
              transform: `translateX(-50%) rotate(${posterStyles[i].rotate}) translateY(${posterStyles[i].translateY})`,
              zIndex: posterStyles[i].z,
              width: 'clamp(110px, 15vw, 200px)',
              height: 'clamp(140px, 22vw, 280px)',
            }}
          >
            <img
              src={src}
              alt={`Poster ${i + 1}`}
              className="w-full h-full object-cover rounded-lg shadow-xl border-4 border-[#f7efe6]"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
