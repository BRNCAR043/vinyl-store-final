// components/home/OnSaleSection.tsx
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

const MOCK_RECORDS: RecordItem[] = [
  { albumName: "Blue palm ceramic plate", artist: "Ceramic Hands", condition: "VG+", releaseYear: 2019, price: 36, salePrice: 29 },
  { albumName: "Midnight Echoes", artist: "The Nightfalls", condition: "Mint", releaseYear: 1979, price: 45, salePrice: 34 },
  { albumName: "Sunset Drives", artist: "Velvet Roads", condition: "VG", releaseYear: 1995, price: 28, salePrice: 22 },
  { albumName: "Rusted Strings", artist: "The Fretters", condition: "Good", releaseYear: 1986, price: 32, salePrice: 25 },
  { albumName: "Northern Lights", artist: "Aurora Lane", condition: "NM", releaseYear: 2004, price: 50, salePrice: 42 },
  { albumName: "Velour Days", artist: "Tape Deck", condition: "VG+", releaseYear: 2011, price: 27 },
];
export default function OnSaleSection() {
  // Show 8 records max, then a View More card
  const maxDisplay = 8;
  const displayRecords = MOCK_RECORDS.slice(0, maxDisplay);
  const showViewMore = MOCK_RECORDS.length > maxDisplay;
  // Split into two rows of 4
  const rows = [displayRecords.slice(0, 4), displayRecords.slice(4, 8)];

  return (
    <section className="py-2">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold font-semibold text-[#f7efe6]">On Sale</h2>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {rows[0].map((item, idx) => (
            <div key={idx} className="h-full">
              <ProductCard {...item} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-6 mt-6">
          {rows[1].map((item, idx) => (
            <div key={idx} className="h-full">
              <ProductCard {...item} />
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
