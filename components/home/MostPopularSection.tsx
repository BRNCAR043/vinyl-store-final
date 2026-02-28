// components/home/MostPopularSection.tsx
import React from "react";
import ProductCard from "../ui/ProductCard";

type RecordItem = {
  albumName: string;
  artist: string;
  condition: string;
  releaseYear: number | string;
  price: number;
  salePrice?: number | null;
};

const POPULAR_RECORDS: RecordItem[] = [
  { albumName: "Classic Gold", artist: "Golden Era", condition: "NM", releaseYear: 1972, price: 60 },
  { albumName: "Electric Dreams", artist: "Synthwave", condition: "VG+", releaseYear: 1984, price: 48 },
  { albumName: "Groove Machine", artist: "Funkadelic", condition: "VG", releaseYear: 1990, price: 35 },
  { albumName: "Retro Nights", artist: "Disco Kings", condition: "Mint", releaseYear: 1978, price: 55 },
  { albumName: "Indie Spirit", artist: "The Outsiders", condition: "VG+", releaseYear: 2012, price: 38 },
  { albumName: "Jazz Vibes", artist: "Blue Notes", condition: "NM", releaseYear: 1965, price: 70 },
  { albumName: "Rock Legends", artist: "Stone Age", condition: "Good", releaseYear: 1980, price: 42 },
  { albumName: "Pop Parade", artist: "Chart Toppers", condition: "VG", releaseYear: 2001, price: 30 },
  { albumName: "Soulful Sunday", artist: "Soul Sisters", condition: "VG+", releaseYear: 1995, price: 40 },
];

export default function MostPopularSection() {
  const maxDisplay = 8;
  const displayRecords = POPULAR_RECORDS.slice(0, maxDisplay);
  const showViewMore = POPULAR_RECORDS.length > maxDisplay;
  const rows = [displayRecords.slice(0, 4), displayRecords.slice(4, 8)];

  return (
    <section className="py-2">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6">
          <h2 className="text-4xl md:text-5xl font-bold text-#ffeede font-anton mb-4">Most Popular</h2>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {rows[0].map((item, idx) => (
            <div key={idx} className="h-full">
              <ProductCard product={{ id: String(idx), albumName: item.albumName, artist: item.artist, condition: item.condition, year: item.releaseYear as any, price: item.price, salePrice: item.salePrice }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-6 mt-6">
          {rows[1].map((item, idx) => (
            <div key={idx} className="h-full">
              <ProductCard product={{ id: String(idx + 4), albumName: item.albumName, artist: item.artist, condition: item.condition, year: item.releaseYear as any, price: item.price, salePrice: item.salePrice }} />
            </div>
          ))}
          {showViewMore && (
            <div className="flex items-center justify-center h-full">
              <button className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-[#8a3b42] rounded-xl text-[#8a3b42] hover:bg-[#a94a56] hover:text-white transition-colors group">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-150 group-hover:stroke-white"><path d="M5 12h14M13 18l6-6-6-6"/></svg>
                <span className="mt-2 font-semibold">View More</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
