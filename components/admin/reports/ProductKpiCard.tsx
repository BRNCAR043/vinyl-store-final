"use client";

import React from "react";
import Image from "next/image";

type ProductKpiCardProps = {
  label: string;
  value: string;
  colorClass?: string;
  imageUrl?: string;
  albumName?: string;
};

export default function ProductKpiCard({
  label,
  value,
  colorClass = "text-black",
  imageUrl,
  albumName,
}: ProductKpiCardProps) {
  return (
    <div className="rounded-2xl bg-[#F5E6D3] p-5 shadow-md flex items-center gap-4 transition-transform hover:scale-[1.02]">
      {imageUrl && (
        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow-sm">
          <Image
            src={imageUrl}
            alt={albumName || "Album cover"}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-1 min-w-0">
        <span className={`text-xl font-bold truncate ${colorClass}`}>{value}</span>
        <span className="text-xs font-medium text-black/60 tracking-wide uppercase">
          {label}
        </span>
      </div>
    </div>
  );
}
