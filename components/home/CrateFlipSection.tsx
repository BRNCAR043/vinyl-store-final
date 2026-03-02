// components/home/CrateFlipSection.tsx
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getAllVinyls } from "../../lib/firestoreVinyls";
import useCart from "../../lib/useCart";
import WishlistButton from "../ui/WishlistButton";
import type { Vinyl } from "../../types/vinyl";

const VISIBLE_STACK = 6;

type DecadeConfig = {
  label: string;
  startYear: number;
  endYear: number;
};

const DECADES: DecadeConfig[] = [
  { label: "70s", startYear: 1970, endYear: 1979 },
  { label: "80s", startYear: 1980, endYear: 1989 },
  { label: "90s", startYear: 1990, endYear: 1999 },
];

// Individual crate component
function VinylCrate({ 
  vinyls, 
  label 
}: { 
  vinyls: Vinyl[]; 
  label: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const router = useRouter();
  const { add } = useCart();

  const handleFlipForward = () => {
    if (isFlipping || currentIndex >= vinyls.length - 1) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, vinyls.length - 1));
      setIsFlipping(false);
    }, 500);
  };

  const handleFlipBackward = () => {
    if (isFlipping || currentIndex <= 0) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const handleAddToCart = (vinyl: Vinyl, e: React.MouseEvent) => {
    e.stopPropagation();
    if (vinyl.id) add(vinyl.id, 1);
  };

  const handleNavigate = (vinyl: Vinyl, e: React.MouseEvent) => {
    e.stopPropagation();
    if (vinyl.id) router.push(`/vinyl/${vinyl.id}`);
  };

  const visibleRecords = vinyls.slice(currentIndex, currentIndex + VISIBLE_STACK);
  const currentVinyl = vinyls[currentIndex];

  if (!currentVinyl) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-[280px] h-[400px] flex items-center justify-center">
          {/* Empty crate */}
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[260px] h-[180px] rounded-b-xl"
            style={{
              background: "linear-gradient(180deg, #4a3122 0%, #3d2517 100%)",
              boxShadow: "inset 0 10px 30px rgba(0,0,0,0.5)",
            }}
          />
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[280px] h-[40px] rounded-b-xl z-30 flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg, #8a6242 0%, #5c3d2e 100%)",
            }}
          >
            <span className="text-[#f5e6d3] font-bold text-lg tracking-wider">{label}</span>
          </div>
          <p className="text-gray-500 text-sm">No records</p>
        </div>
      </div>
    );
  }

  const price = typeof currentVinyl.price === "number" ? currentVinyl.price : 0;
  const salePrice = typeof currentVinyl.salePrice === "number" ? currentVinyl.salePrice : undefined;

  return (
    <div className="flex flex-col items-center">
      {/* Crate container */}
      <div 
        className="relative"
        style={{ 
          perspective: "1000px",
          perspectiveOrigin: "50% 60%",
        }}
      >
        {/* Wooden crate - scaled down for 3 in a row */}
        <div className="relative w-[280px] h-[420px]">
          
          {/* Crate back */}
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[260px] h-[180px] rounded-b-xl"
            style={{
              background: "linear-gradient(180deg, #4a3122 0%, #3d2517 100%)",
              boxShadow: "inset 0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            {/* Wood grain */}
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-full h-[2px] opacity-20"
                style={{ 
                  top: `${20 + i * 18}%`,
                  background: "linear-gradient(90deg, transparent 0%, #2a1810 50%, transparent 100%)",
                }}
              />
            ))}
          </div>

          {/* Crate left side */}
          <div 
            className="absolute bottom-0 left-[10px] w-[18px] h-[180px] rounded-bl-xl z-20"
            style={{
              background: "linear-gradient(90deg, #7a5235 0%, #5c3d2e 100%)",
            }}
          />

          {/* Crate right side */}
          <div 
            className="absolute bottom-0 right-[10px] w-[18px] h-[180px] rounded-br-xl z-20"
            style={{
              background: "linear-gradient(270deg, #7a5235 0%, #5c3d2e 100%)",
            }}
          />

          {/* Crate front lip with LABEL */}
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[280px] h-[40px] rounded-b-xl z-30 flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg, #8a6242 0%, #5c3d2e 100%)",
              boxShadow: "0 5px 20px rgba(0,0,0,0.4)",
            }}
          >
            {/* Corner brackets */}
            <div className="absolute top-1.5 left-2 w-4 h-4 border-l-2 border-t-2 border-[#4a3525] opacity-60 rounded-tl-sm" />
            <div className="absolute top-1.5 right-2 w-4 h-4 border-r-2 border-t-2 border-[#4a3525] opacity-60 rounded-tr-sm" />
            
            {/* Label */}
            <div 
              className="px-4 py-1 rounded"
              style={{
                background: "linear-gradient(180deg, #f5e6d3 0%, #e8d5c0 100%)",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              <span className="text-[#3d2517] font-bold text-lg tracking-wider">{label}</span>
            </div>
          </div>

          {/* Records container */}
          <div 
            className="absolute bottom-[45px] left-1/2 -translate-x-1/2"
            style={{ 
              width: "240px",
              height: "360px",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Background records - top edges peeking up */}
            {visibleRecords.slice(1).reverse().map((vinyl, reverseIdx) => {
              const stackIdx = visibleRecords.length - 1 - reverseIdx;
              const peekHeight = 8 + (VISIBLE_STACK - stackIdx) * 6;
              
              return (
                <div
                  key={vinyl.id || `bg-${currentIndex + stackIdx}`}
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    bottom: `${260 + peekHeight}px`,
                    width: "220px",
                    zIndex: stackIdx,
                  }}
                >
                  <div 
                    className="w-full h-[12px] rounded-t-sm overflow-hidden relative"
                    style={{
                      background: "#1a1a1a",
                      boxShadow: "0 -2px 6px rgba(0,0,0,0.3)",
                    }}
                  >
                    {vinyl.imageUrl && (
                      <div className="absolute inset-0">
                        <Image
                          src={vinyl.imageUrl}
                          alt=""
                          fill
                          className="object-cover object-top"
                          sizes="220px"
                        />
                      </div>
                    )}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: `rgba(0,0,0,${0.2 + stackIdx * 0.1})`,
                      }}
                    />
                    <div 
                      className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{
                        background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)",
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Next record - always visible behind front */}
            {visibleRecords[1] && (
              <div
                className="absolute left-1/2 -translate-x-1/2 bottom-0"
                style={{
                  width: "220px",
                  height: "260px",
                  zIndex: 9,
                }}
              >
                <div
                  className="w-full h-full rounded-md overflow-hidden relative"
                  style={{
                    background: "#1a1a1a",
                    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  {visibleRecords[1].imageUrl ? (
                    <Image
                      src={visibleRecords[1].imageUrl}
                      alt={visibleRecords[1].albumName || "Album"}
                      fill
                      className="object-cover"
                      sizes="220px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#3a3a3a] to-[#1a1a1a] flex items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Front record */}
            <motion.div
              key={currentVinyl.id || `front-${currentIndex}`}
              className="absolute left-1/2 -translate-x-1/2 bottom-0 cursor-pointer"
              style={{
                width: "220px",
                height: "260px",
                transformOrigin: "bottom center",
                zIndex: 10,
              }}
              animate={
                isFlipping
                  ? {
                      rotateX: -80,
                      y: 60,
                      opacity: 0,
                      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                    }
                  : {
                      rotateX: 0,
                      y: 0,
                      opacity: 1,
                      transition: { duration: 0.25 },
                    }
              }
              onClick={handleFlipForward}
            >
              <div
                className="w-full h-full rounded-md overflow-hidden relative"
                style={{
                  background: "#1a1a1a",
                  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.08)",
                }}
              >
                {/* Album art */}
                <div className="absolute inset-0">
                  {currentVinyl.imageUrl ? (
                    <Image
                      src={currentVinyl.imageUrl}
                      alt={currentVinyl.albumName || "Album"}
                      fill
                      className="object-cover"
                      sizes="220px"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#3a3a3a] to-[#1a1a1a] flex items-center justify-center">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

                {/* Tags */}
                {currentVinyl.tags && currentVinyl.tags.length > 0 && (
                  <div className="absolute top-2 left-2 flex gap-1 z-10">
                    {currentVinyl.tags.slice(0, 1).map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-[#8a3b42] text-[#ffeede] text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* View details */}
                <button
                  onClick={(e) => handleNavigate(currentVinyl, e)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[10px] px-2 py-1 rounded-full transition-colors backdrop-blur-sm z-10"
                >
                  View
                </button>

                {/* Record info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                  <h3 className="font-bold text-white text-sm mb-0.5 line-clamp-1">
                    {currentVinyl.albumName || "Unknown Album"}
                  </h3>
                  <p className="text-gray-300 text-xs mb-1 line-clamp-1">
                    {currentVinyl.artist || "Unknown Artist"}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2">
                    <span>{currentVinyl.year || "-"}</span>
                    <span>•</span>
                    <span>{currentVinyl.condition || "VG+"}</span>
                  </div>

                  {/* Price and actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      {salePrice !== undefined && salePrice > 0 && salePrice < price ? (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400 line-through text-[10px]">R{price.toFixed(0)}</span>
                          <span className="text-white font-bold text-sm">R{salePrice.toFixed(0)}</span>
                        </div>
                      ) : (
                        <span className="text-white font-bold text-sm">R{price.toFixed(0)}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {currentVinyl.id && (
                        <div className="scale-75 origin-right">
                          <WishlistButton vinylId={currentVinyl.id} compact />
                        </div>
                      )}
                      <button
                        onClick={(e) => handleAddToCart(currentVinyl, e)}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 bg-[#ffeede] hover:bg-white transition-colors"
                        aria-label="Add to cart"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a3b42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 6h15l-1.5 9h-11z" />
                          <circle cx="9" cy="20" r="1" />
                          <circle cx="18" cy="20" r="1" />
                        </svg>
                        <span className="text-[#8a3b42] font-semibold text-[10px]">Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Flip hint */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full p-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={handleFlipBackward}
          disabled={currentIndex <= 0 || isFlipping}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#8a3b42] hover:bg-[#a94a56] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Previous"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        
        <span className="text-gray-500 text-xs min-w-[50px] text-center">
          {currentIndex + 1} / {vinyls.length}
        </span>
        
        <button
          onClick={handleFlipForward}
          disabled={currentIndex >= vinyls.length - 1 || isFlipping}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#8a3b42] hover:bg-[#a94a56] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Next"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Main section with 3 crates
export default function CrateFlipSection() {
  const [allVinyls, setAllVinyls] = useState<Vinyl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await getAllVinyls();
        if (mounted) {
          setAllVinyls(all);
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to load vinyls for crates", e);
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Filter vinyls by decade
  const getVinylsForDecade = (startYear: number, endYear: number): Vinyl[] => {
    return allVinyls.filter((vinyl) => {
      const year = typeof vinyl.year === "number" 
        ? vinyl.year 
        : typeof vinyl.year === "string" 
          ? parseInt(vinyl.year, 10) 
          : null;
      
      if (year === null || isNaN(year)) return false;
      return year >= startYear && year <= endYear;
    }).sort(() => Math.random() - 0.5); // Shuffle
  };

  if (loading) {
    return (
      <section className="py-20 fade-in-section">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[#c9a86c] uppercase tracking-[0.3em] text-xs font-semibold mb-3 font-lora">Browse by Era</p>
          <h2 className="text-4xl md:text-5xl font-bold section-heading heading-glow font-playfair mb-4">Dig Through the Decades</h2>
          <div className="text-[#8a7a6a] font-lora italic">Loading records...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 overflow-hidden fade-in-section">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-[#c9a86c] uppercase tracking-[0.3em] text-xs font-semibold mb-3 font-lora">Browse by Era</p>
          <h2 className="text-4xl md:text-5xl font-bold section-heading heading-glow font-playfair mb-3">
            Dig Through the Decades
          </h2>
          <div className="w-16 h-0.5 bg-[#c9a86c]/40 mx-auto mb-4" />
          <p className="text-[#b8a08a] text-lg max-w-2xl mx-auto font-lora italic">
            Explore vinyl from different eras — click records to flip through each crate
          </p>
        </div>

        {/* Three crates in a row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
          {DECADES.map((decade) => (
            <VinylCrate
              key={decade.label}
              label={decade.label}
              vinyls={getVinylsForDecade(decade.startYear, decade.endYear)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
