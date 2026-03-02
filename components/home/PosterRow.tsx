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
  const posterStyles = [
    { rotate: '-7deg', translateY: '10px', z: 20, left: '9%' },
    { rotate: '2deg', translateY: '-8px', z: 22, left: '27%' },
    { rotate: '0deg', translateY: '18px', z: 18, left: '46%' },
    { rotate: '6deg', translateY: '-4px', z: 21, left: '64%' },
    { rotate: '-3deg', translateY: '12px', z: 19, left: '82%' },
  ];

  return (
    <div className="w-full relative mt-16 mb-8 fade-in-section">
      {/* Subtle section label */}
      <p className="text-center text-[#c9a86c]/50 uppercase tracking-[0.4em] text-[10px] font-semibold mb-6 font-lora">On the Wall</p>
      
      <div className="relative flex justify-center min-h-[180px] md:min-h-[280px] lg:min-h-[340px]">
        <div className="w-full max-w-7xl relative h-full">
          {POSTERS.map((src, i) => (
            <div
              key={src}
              className="absolute group"
              style={{
                left: posterStyles[i].left,
                transform: `translateX(-50%) rotate(${posterStyles[i].rotate}) translateY(${posterStyles[i].translateY})`,
                zIndex: posterStyles[i].z,
                width: 'clamp(110px, 15vw, 200px)',
                height: 'clamp(140px, 22vw, 280px)',
              }}
            >
              {/* Tape/pin effect at top */}
              <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-3 rounded-b-sm z-10"
                style={{
                  background: 'linear-gradient(180deg, rgba(201,168,108,0.6) 0%, rgba(201,168,108,0.35) 100%)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              />
              <img
                src={src}
                alt={`Poster ${i + 1}`}
                className="w-full h-full object-cover rounded shadow-xl transition-transform duration-500 group-hover:scale-[1.03]"
                style={{
                  border: '3px solid #f5e6d3',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,108,0.1)',
                  filter: 'sepia(0.08) saturate(0.95)',
                }}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
