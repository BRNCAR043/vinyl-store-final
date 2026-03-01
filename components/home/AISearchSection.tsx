"use client";

import { useState, useEffect, useRef } from "react";
import ProductCard from "../ui/ProductCard";
import type { Vinyl } from "../../types/vinyl";
import { getAllVinyls } from "../../lib/firestoreVinyls";

export default function AISearchSection() {
  const [query, setQuery] = useState("");
  const [vinyls, setVinyls] = useState<Vinyl[]>([]);
  const [displayedVinyls, setDisplayedVinyls] = useState<Vinyl[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<"text" | "image">("text");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all vinyls on mount and show 8 random ones
  useEffect(() => {
    async function loadVinyls() {
      try {
        const allVinyls = await getAllVinyls();
        setVinyls(allVinyls);
        // Show 8 random vinyls initially
        const shuffled = [...allVinyls].sort(() => Math.random() - 0.5);
        setDisplayedVinyls(shuffled.slice(0, 8));
      } catch (error) {
        console.error("Failed to load vinyls:", error);
      }
    }
    loadVinyls();
  }, []);

  // Handle paste event for images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            handleImageFile(file);
          }
          break;
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      setSearchType("image");
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setSearchType("text");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSearch = async () => {
    if ((!query.trim() && !imagePreview) || vinyls.length === 0) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          vinyls,
          image: imagePreview,
        }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      
      // Map indices back to vinyl objects
      if (data.indices && Array.isArray(data.indices)) {
        const results = data.indices
          .filter((i: number) => i >= 0 && i < vinyls.length)
          .map((i: number) => vinyls[i]);
        setDisplayedVinyls(results);
      } else {
        // Fallback to random
        const shuffled = [...vinyls].sort(() => Math.random() - 0.5);
        setDisplayedVinyls(shuffled.slice(0, 8));
      }
    } catch (error) {
      console.error("Search error:", error);
      // On error, show random vinyls
      const shuffled = [...vinyls].sort(() => Math.random() - 0.5);
      setDisplayedVinyls(shuffled.slice(0, 8));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-#ffeede font-anton">
          Discover Your Perfect Vinyl
        </h2>
        <p className="text-center text-gray-300 mb-8 text-lg">
          Tell us what you&apos;re in the mood for, or upload an image to find matching records
        </p>

        {/* Search Bar */}
        <div className="flex flex-col gap-4 justify-center items-center mb-12 max-w-2xl mx-auto">
          {/* Text Input Row */}
          <div className="w-full flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., 'I want something to make me dance'"
              className="w-full px-6 py-4 rounded-lg text-lg bg-[#ffeede] text-[#2d1f1f] placeholder-[#8a6b6b] border-2 border-[#8a3b42]/30 focus:border-[#8a3b42] focus:outline-none transition-colors"
            />
            
            {/* Image Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-4 rounded-lg bg-[#ffeede] text-[#8a3b42] hover:bg-[#f5e0cf] border-2 border-[#8a3b42]/30 transition-colors"
              title="Upload an image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={isLoading || (!query.trim() && !imagePreview)}
              className="w-full sm:w-auto px-8 py-4 rounded-lg text-lg font-bold bg-[#8a3b42] text-[#ffeede] hover:bg-[#6e2f35] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Searching...
                </span>
              ) : (
                "Find My Vinyl"
              )}
            </button>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Search image"
                className="h-24 w-24 object-cover rounded-lg border-2 border-[#8a3b42]"
              />
              <button
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-[#8a3b42] text-white rounded-full p-1 hover:bg-[#6e2f35]"
                title="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <p className="text-center text-sm text-gray-400 mt-1">Image ready</p>
            </div>
          )}
        </div>

        {/* Results Label */}
        {hasSearched && !isLoading && (
          <p className="text-center text-[#ffeede] mb-6 text-lg font-semibold">
            {displayedVinyls.length > 0
              ? `Found ${displayedVinyls.length} vinyls${imagePreview ? " matching your image" : query ? ` matching "${query}"` : ""}`
              : "No vinyls found. Try a different search!"}
          </p>
        )}

        {/* Vinyl Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedVinyls.map((vinyl) => (
            <ProductCard key={vinyl.id} product={vinyl} />
          ))}
        </div>

        {/* Empty State */}
        {displayedVinyls.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No vinyls to display</p>
          </div>
        )}
      </div>
    </section>
  );
}
