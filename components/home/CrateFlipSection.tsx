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

const VISIBLE_STACK = 8;

export default function CrateFlipSection() {
  const [vinyls, setVinyls] = useState<Vinyl[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const router = useRouter();
  const { add } = useCart();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await getAllVinyls();
        const shuffled = all.sort(() => Math.random() - 0.5).slice(0, 20);
        if (mounted) setVinyls(shuffled);
      } catch (e) {
        console.error("Failed to load vinyls for crate", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

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

  if (vinyls.length === 0) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-[#f7efe6] mb-8">Dig Through the Crate</h2>
          <div className="text-gray-400">Loading records...</div>
        </div>
      </section>
    );
  }

  const currentVinyl = vinyls[currentIndex];
  const price = typeof currentVinyl?.price === "number" ? currentVinyl.price : 0;
  const salePrice = typeof currentVinyl?.salePrice === "number" ? currentVinyl.salePrice : undefined;

  return (
    <section className="py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-extrabold text-[#f7efe6] mb-4 text-center">
          Dig Through the Crate
        </h2>
        <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
          Click the front record to flip through — just like at your favorite record store
        </p>

        <div className="flex flex-col items-center">
          {/* Crate container */}
          <div 
            className="relative"
            style={{ 
              perspective: "1000px",
              perspectiveOrigin: "50% 60%",
            }}
          >
            {/* Wooden crate */}
            <div className="relative w-[380px] md:w-[450px] h-[500px] md:h-[580px]">
              
              {/* Crate back */}
              <div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[360px] md:w-[420px] h-[220px] md:h-[260px] rounded-b-xl"
                style={{
                  background: "linear-gradient(180deg, #4a3122 0%, #3d2517 100%)",
                  boxShadow: "inset 0 10px 30px rgba(0,0,0,0.5)",
                }}
              >
                {/* Wood grain */}
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-full h-[2px] opacity-20"
                    style={{ 
                      top: `${20 + i * 15}%`,
                      background: "linear-gradient(90deg, transparent 0%, #2a1810 50%, transparent 100%)",
                    }}
                  />
                ))}
              </div>

              {/* Crate left side */}
              <div 
                className="absolute bottom-0 left-[10px] md:left-[15px] w-[22px] md:w-[28px] h-[220px] md:h-[260px] rounded-bl-xl z-20"
                style={{
                  background: "linear-gradient(90deg, #7a5235 0%, #5c3d2e 100%)",
                }}
              />

              {/* Crate right side */}
              <div 
                className="absolute bottom-0 right-[10px] md:right-[15px] w-[22px] md:w-[28px] h-[220px] md:h-[260px] rounded-br-xl z-20"
                style={{
                  background: "linear-gradient(270deg, #7a5235 0%, #5c3d2e 100%)",
                }}
              />

              {/* Crate front lip */}
              <div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[380px] md:w-[450px] h-[45px] md:h-[55px] rounded-b-xl z-30"
                style={{
                  background: "linear-gradient(180deg, #8a6242 0%, #5c3d2e 100%)",
                  boxShadow: "0 5px 20px rgba(0,0,0,0.4)",
                }}
              >
                {/* Corner brackets */}
                <div className="absolute top-2 left-3 w-6 h-6 border-l-2 border-t-2 border-[#4a3525] opacity-60 rounded-tl-sm" />
                <div className="absolute top-2 right-3 w-6 h-6 border-r-2 border-t-2 border-[#4a3525] opacity-60 rounded-tr-sm" />
              </div>

              {/* Records container */}
              <div 
                className="absolute bottom-[50px] md:bottom-[60px] left-1/2 -translate-x-1/2"
                style={{ 
                  width: "320px",
                  height: "420px",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Background records - just showing top edges peeking up */}
                {visibleRecords.slice(1).reverse().map((vinyl, reverseIdx) => {
                  const stackIdx = visibleRecords.length - 1 - reverseIdx;
                  // How much of the top edge peeks above the front record
                  const peekHeight = 12 + (VISIBLE_STACK - stackIdx) * 8;
                  
                  return (
                    <div
                      key={vinyl.id || `bg-${currentIndex + stackIdx}`}
                      className="absolute left-1/2 -translate-x-1/2"
                      style={{
                        bottom: `${320 + peekHeight}px`,
                        width: "300px",
                        zIndex: stackIdx,
                      }}
                    >
                      {/* Top edge strip - this is what peeks up */}
                      <div 
                        className="w-full h-[14px] rounded-t-sm overflow-hidden relative"
                        style={{
                          background: "#1a1a1a",
                          boxShadow: "0 -2px 8px rgba(0,0,0,0.3)",
                        }}
                      >
                        {/* Album art peeking at top */}
                        {vinyl.imageUrl && (
                          <div className="absolute inset-0">
                            <Image
                              src={vinyl.imageUrl}
                              alt=""
                              fill
                              className="object-cover object-top"
                              sizes="300px"
                            />
                          </div>
                        )}
                        {/* Slight darkening */}
                        <div 
                          className="absolute inset-0"
                          style={{
                            background: `rgba(0,0,0,${0.2 + stackIdx * 0.08})`,
                          }}
                        />
                        {/* White edge highlight */}
                        <div 
                          className="absolute top-0 left-0 right-0 h-[3px]"
                          style={{
                            background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 100%)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Next record - always visible behind front, ready to show */}
                {visibleRecords[1] && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 bottom-0"
                    style={{
                      width: "300px",
                      height: "320px",
                      zIndex: 9,
                    }}
                  >
                    <div
                      className="w-full h-full rounded-md overflow-hidden relative"
                      style={{
                        background: "#1a1a1a",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                      }}
                    >
                      {visibleRecords[1].imageUrl ? (
                        <Image
                          src={visibleRecords[1].imageUrl}
                          alt={visibleRecords[1].albumName || "Album"}
                          fill
                          className="object-cover"
                          sizes="300px"
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
                  </div>
                )}

                {/* Front record - full album cover visible */}
                <motion.div
                  key={currentVinyl.id || `front-${currentIndex}`}
                  className="absolute left-1/2 -translate-x-1/2 bottom-0 cursor-pointer"
                  style={{
                    width: "300px",
                    height: "320px",
                    transformOrigin: "bottom center",
                    zIndex: 10,
                  }}
                  animate={
                    isFlipping
                      ? {
                          rotateX: -80,
                          y: 80,
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
                    {/* Record sleeve */}
                    <div
                      className="w-full h-full rounded-md overflow-hidden relative"
                      style={{
                        background: "#1a1a1a",
                        boxShadow: "0 15px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.08)",
                      }}
                    >
                      {/* Album art - full cover */}
                      <div className="absolute inset-0">
                        {currentVinyl.imageUrl ? (
                          <Image
                            src={currentVinyl.imageUrl}
                            alt={currentVinyl.albumName || "Album"}
                            fill
                            className="object-cover"
                            sizes="300px"
                            priority
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#3a3a3a] to-[#1a1a1a] flex items-center justify-center">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" />
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Gradient overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

                      {/* Tags */}
                      {currentVinyl.tags && currentVinyl.tags.length > 0 && (
                        <div className="absolute top-3 left-3 flex gap-2 z-10">
                          {currentVinyl.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-[#8a3b42] text-[#ffeede] text-xs font-semibold px-2 py-1 rounded-md shadow-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* View details button */}
                      <button
                        onClick={(e) => handleNavigate(currentVinyl, e)}
                        className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm z-10"
                      >
                        View Details
                      </button>

                      {/* Record info at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                        <h3 className="font-bold text-white text-xl mb-1 line-clamp-1">
                          {currentVinyl.albumName || "Unknown Album"}
                        </h3>
                        <p className="text-gray-300 text-sm mb-1">
                          {currentVinyl.artist || "Unknown Artist"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                          <span>{currentVinyl.condition || "VG+"}</span>
                          <span>•</span>
                          <span>{currentVinyl.year || "-"}</span>
                        </div>

                        {/* Price and actions */}
                        <div className="flex items-center justify-between">
                          <div>
                            {salePrice !== undefined && salePrice > 0 && salePrice < price ? (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 line-through text-sm">R {price.toFixed(0)}</span>
                                <span className="text-white font-bold text-xl">R {salePrice.toFixed(0)}</span>
                              </div>
                            ) : (
                              <span className="text-white font-bold text-xl">R {price.toFixed(0)}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {currentVinyl.id && <WishlistButton vinylId={currentVinyl.id} />}
                            <button
                              onClick={(e) => handleAddToCart(currentVinyl, e)}
                              className="inline-flex items-center gap-2 rounded px-3 py-2 bg-[#ffeede] hover:bg-white transition-colors"
                              aria-label="Add to cart"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a3b42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 6h15l-1.5 9h-11z" />
                                <circle cx="9" cy="20" r="1" />
                                <circle cx="18" cy="20" r="1" />
                              </svg>
                              <span className="text-[#8a3b42] font-semibold text-sm">Add</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Flip hint overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-black/40 backdrop-blur-sm rounded-full p-4">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M13 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </motion.div>
              </div>
            </div>
          </div>

          {/* Progress and navigation */}
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm font-medium">
                {currentIndex + 1} of {vinyls.length}
              </span>
              <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#8a3b42] rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / vinyls.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <button
                onClick={handleFlipBackward}
                disabled={currentIndex <= 0 || isFlipping}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-[#8a3b42] hover:bg-[#a94a56] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                aria-label="Previous record"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              
              <span className="text-gray-500 text-sm">Click record to flip</span>
              
              <button
                onClick={handleFlipForward}
                disabled={currentIndex >= vinyls.length - 1 || isFlipping}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-[#8a3b42] hover:bg-[#a94a56] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                aria-label="Next record"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
