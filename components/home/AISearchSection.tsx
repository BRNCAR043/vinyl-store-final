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
    <section className="py-20 px-4 md:px-8 lg:px-16 fade-in-section">
      <div className="max-w-7xl mx-auto">
        {/* Section Title — vintage record store sign */}
        <div className="text-center mb-10">
          <p className="text-[#c9a86c] uppercase tracking-[0.3em] text-xs font-semibold mb-3 font-lora">AI-Powered Discovery</p>
          <h2 className="text-4xl md:text-5xl font-bold section-heading heading-glow font-playfair mb-3">
            Discover Your Perfect Vinyl
          </h2>
          <div className="w-16 h-0.5 bg-[#c9a86c]/40 mx-auto mb-4" />
          <p className="text-[#b8a08a] text-lg font-lora italic max-w-lg mx-auto">
            Tell us what you&apos;re in the mood for, or upload an image to find matching records
          </p>
        </div>

        {/* Search Bar — vintage card catalogue style */}
        <div className="flex flex-col gap-4 justify-center items-center mb-14 max-w-2xl mx-auto">
          <div className="w-full rounded-xl p-6 relative"
            style={{
              background: 'linear-gradient(135deg, #2a1a12 0%, #1e120c 100%)',
              border: '1px solid rgba(201,168,108,0.15)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            {/* Text Input Row */}
            <div className="w-full flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., 'I want something to make me dance'"
                className="w-full px-5 py-3.5 rounded-lg text-base bg-[#f5e6d3] text-[#2a1a12] placeholder-[#8a7a6a] border border-[#c9a86c]/30 focus:border-[#c9a86c] focus:ring-2 focus:ring-[#c9a86c]/20 focus:outline-none transition-all font-lora"
              />

              {/* Image Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-3.5 rounded-lg bg-[#f5e6d3] text-[#7a2e35] hover:bg-[#e8d5b8] border border-[#c9a86c]/30 transition-all duration-200 hover:border-[#c9a86c]/50"
                title="Upload an image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                className="w-full sm:w-auto px-7 py-3.5 rounded-lg text-base font-bold bg-[#7a2e35] text-[#f5e6d3] hover:bg-[#8a3b42] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap font-playfair tracking-wide"
                style={{ boxShadow: '0 2px 8px rgba(122,46,53,0.3)' }}
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
              <div className="relative inline-block mt-4">
                <img
                  src={imagePreview}
                  alt="Search image"
                  className="h-24 w-24 object-cover rounded-lg border-2 border-[#c9a86c]/40"
                />
                <button
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-[#7a2e35] text-[#f5e6d3] rounded-full p-1 hover:bg-[#8a3b42]"
                  title="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <p className="text-center text-sm text-[#b8a08a] mt-1 font-lora">Image ready</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Label */}
        {hasSearched && !isLoading && (
          <p className="text-center text-[#f5e6d3] mb-8 text-lg font-semibold font-playfair">
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
            <p className="text-[#8a7a6a] text-lg font-lora italic">No vinyls to display</p>
          </div>
        )}
      </div>
    </section>
  );
}
