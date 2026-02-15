// components/ui/ProductCard.tsx
"use client";
import React, { useState } from "react";
import type { Vinyl } from "../../types/vinyl";

type ProductCardProps =
  | {
      product: Vinyl;
    }
  | {
      albumName?: string;
      artist?: string;
      condition?: string;
      releaseYear?: number | string;
      price?: number;
      salePrice?: number | null;
    };

export default function ProductCard(props: ProductCardProps) {
  const [isLiked, setLiked] = useState(false);
  const albumName = "albumName" in props ? props.albumName : props.product?.title;
  const artist = "artist" in props ? props.artist : props.product?.artist;
  const condition = "condition" in props ? props.condition : "VG";
  const releaseYear = "releaseYear" in props ? props.releaseYear : "—";
  const price = "price" in props ? props.price ?? 0 : props.product?.price ?? 0;
  const salePrice = "salePrice" in props ? props.salePrice ?? null : null;

  return (
    <article className="flex flex-col rounded-2xl bg-[#f7efe6] shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 overflow-hidden h-full">
      <div className="relative">
        <div className="w-full aspect-square bg-gray-800/80 flex items-center justify-center text-gray-200 text-sm font-semibold">
          Album Art
        </div>

        <div className="absolute top-4 right-4">
          <button
            type="button"
            aria-pressed={isLiked}
            onClick={() => setLiked((s) => !s)}
            className="bg-[#f7efe6] p-2 rounded-full shadow-md flex items-center justify-center focus:outline-none transition-transform transition-colors duration-150 hover:bg-[#f2d6d6] hover:scale-110"
          >
            {isLiked ? (
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1 4.5 2.09C12.09 5 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#9b1d1d" stroke="#9b1d1d" strokeWidth="1.2"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1 4.5 2.09C12.09 5 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="#9b1d1d" strokeWidth="1.2"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div>
          <h3 className="text-gray-900 font-semibold text-lg">{albumName ?? "Untitled"}</h3>
          <p className="text-gray-700 text-sm mt-1">{artist ?? "Unknown Artist"}</p>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <span className="px-2 py-1 bg-white/60 rounded-md font-medium text-gray-800">{condition}</span>
          <span className="text-gray-600">{releaseYear}</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            {salePrice ? (
              <>
                <span className="text-sm text-gray-500 line-through">${price.toFixed(2)}</span>
                <span className="text-rose-800 font-bold text-lg">${salePrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-emerald-800 font-bold text-lg">${price.toFixed(2)}</span>
            )}
          </div>

          <button
            aria-label="Add to cart"
            className="ml-4 bg-[#8a3b42] text-white font-semibold rounded-full px-4 py-2 flex items-center gap-2 shadow-sm transition-transform transition-colors duration-150 hover:scale-105 hover:bg-[#a94a56] focus:outline-none"
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
    </article>
  );
}


