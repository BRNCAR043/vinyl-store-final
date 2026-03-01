"use client";

import React from "react";
import Image from "next/image";
import type { ProductDoc } from "../../../types/product-report";

type Props = {
  products: ProductDoc[];
};

const formatCurrency = (v: number) =>
  `R${v.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function conversion(sold: number, views: number): string {
  if (views === 0) return "0.00";
  return ((sold / views) * 100).toFixed(2);
}

export default function TopAlbumGrid({ products }: Props) {
  const top5 = [...products]
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  if (top5.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold text-[#F5E6D3] mb-6">Top 5 Best Selling Albums</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {top5.map((product, index) => (
          <div
            key={product.id}
            className="group relative bg-[#F5E6D3] rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            {/* Badge removed */}

            {/* Album Cover */}
            <div className="aspect-square w-full overflow-hidden">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.albumName}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-[#d6c4b0] flex items-center justify-center">
                  <span className="text-4xl">🎵</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-1.5">
              <h3 className="text-sm font-bold text-black truncate">
                {product.albumName}
              </h3>
              <p className="text-xs text-black/60 truncate">{product.artist}</p>

              <div className="flex items-center justify-between pt-2 border-t border-[#d6c4b0]">
                <div className="text-xs">
                  <span className="font-semibold text-[#1B4332]">
                    {product.totalSold}
                  </span>{" "}
                  <span className="text-black/50">sold</span>
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-[#800000]">
                    {formatCurrency(product.totalRevenue)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-black/50">
                Conversion:{" "}
                <span className="font-semibold text-black">
                  {conversion(product.totalSold, product.totalViews)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
