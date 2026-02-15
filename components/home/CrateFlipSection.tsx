// components/home/CrateFlipSection.tsx
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const CRATES = [
  [
    { album: "Midnight Groove", artist: "The Night Owls" },
    { album: "Sunset Drive", artist: "Velvet Roads" },
    { album: "Echoes", artist: "Aurora Lane" },
    { album: "Rusted Strings", artist: "The Fretters" },
    { album: "Velour Days", artist: "Tape Deck" },
  ],
  [
    { album: "Blue Moon", artist: "Ceramic Hands" },
    { album: "Northern Lights", artist: "Aurora Lane" },
    { album: "Classic Rock", artist: "Stone Age" },
    { album: "Mint Condition", artist: "Vinyl Lovers" },
    { album: "Fairy Lights", artist: "Dreamscape" },
  ],
  [
    { album: "On Sale", artist: "Discount Crew" },
    { album: "Mint", artist: "Fresh Press" },
    { album: "VG+", artist: "Collector's Choice" },
    { album: "Sunrise", artist: "Morning Glory" },
    { album: "Nightfall", artist: "The Nightfalls" },
  ],
];

export default function CrateFlipSection() {
  const [selected, setSelected] = useState(Array(CRATES.length).fill(-1));
  const [removed, setRemoved] = useState(Array(CRATES.length).fill([]));

  // Refresh crate when all records are gone
  React.useEffect(() => {
    CRATES.forEach((crate, crateIdx) => {
      if (removed[crateIdx].length === crate.length && crate.length > 0) {
        setTimeout(() => {
          setRemoved(rem => rem.map((arr, i) => i === crateIdx ? [] : arr));
          setSelected(sel => sel.map((v, i) => i === crateIdx ? -1 : v));
        }, 700);
      }
    });
  }, [removed]);

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading above crate */}
        <h2 className="text-3xl font-extrabold font-semibold text-[#f7efe6] mb-16 relative z-20 text-center">Flip through the crates!</h2>
        <div className="flex flex-col md:flex-row gap-30 py-10">
          {CRATES.map((crate, crateIdx) => (
            <div
              key={crateIdx}
              className="flex-1 flex flex-col items-center min-w-[220px]"
            >
              {/* Crate visual container */}
              <div className="relative w-full h-[340px] md:h-[400px] flex flex-col justify-end">
                {/* Crate background with sides */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 md:w-96 h-36 md:h-44 bg-[#7a5c5c] rounded-b-3xl border-t-4 border-[#a97c50] shadow-xl z-10" />
                {/* Crate sides */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 md:w-96 h-36 md:h-44 flex z-20 pointer-events-none">
                  <div className="w-6 md:w-8 h-full bg-[#a97c50] rounded-bl-3xl border-r-2 border-[#7a5c5c]" />
                  <div className="flex-1" />
                  <div className="w-6 md:w-8 h-full bg-[#a97c50] rounded-br-3xl border-l-2 border-[#7a5c5c]" />
                </div>
                {/* Crate top lip */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 md:w-96 h-6 bg-[#a97c50] rounded-b-xl z-30" />
                {crate.map((record, recIdx) => {
                  // If record is removed, don't render
                  if (removed[crateIdx].includes(recIdx)) return null;
                  const isSelected = selected[crateIdx] === recIdx;
                  return (
                    <motion.div
                      key={recIdx}
                      className={`absolute left-1/2 -translate-x-1/2 w-64 md:w-80 h-64 md:h-80 bg-[#f7efe6] rounded-xl shadow-md flex flex-col items-center justify-between border border-[#e5d3c6] ${
                        recIdx !== 0 ? `-translate-y-[${recIdx * 40}px]` : ""
                      } ${isSelected ? "z-50" : ""}`}
                      style={{
                        zIndex: crate.length - recIdx,
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Flip record: ${record.album}`}
                      onClick={() => {
                        setSelected(sel => sel.map((v, i) => i === crateIdx ? recIdx : v));
                        setTimeout(() => {
                          setRemoved(rem => rem.map((arr, i) => i === crateIdx ? [...arr, recIdx] : arr));
                        }, 500);
                      }}
                      animate={isSelected ? {
                        y: [-(recIdx * 40), 60],
                        rotateX: [0, 90],
                        opacity: [1, 0],
                        transition: { duration: 0.5, ease: "easeInOut" }
                      } : {
                        y: -(recIdx * 40),
                        rotateX: 0,
                        opacity: 1,
                        transition: { delay: recIdx * 0.06 }
                      }}
                    >
                      {/* Record info always visible */}
                      <div className="w-full px-3 pt-3 text-xs text-[#3a2323] font-semibold truncate text-center">
                        {record.album}
                      </div>
                      <div className="w-full px-3 pb-2 text-[11px] text-[#7a5c5c] font-medium truncate text-center">
                        {record.artist}
                      </div>
                    </motion.div>
                  );
                })}
                {/* Add button on crate, centered */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
                  <button
                    aria-label="Add to cart"
                    className="bg-[#8a3b42] text-white font-semibold rounded-full px-6 py-3 flex items-center gap-2 shadow-sm transition-transform transition-colors duration-150 hover:scale-105 hover:bg-[#a94a56] focus:outline-none"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="10" cy="20" r="1" fill="#fff" />
                      <circle cx="18" cy="20" r="1" fill="#fff" />
                    </svg>
                    <span className="text-sm font-semibold">Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
