"use client";
import React, { useEffect, useState } from "react";
import type { Vinyl } from "../../types/vinyl";
import useCart from "../../lib/useCart";
import { useAuthContext } from "../../lib/AuthContext";
import { getWishlist, toggleWishlist } from "../../lib/wishlist";
import { useAuthModal } from "./AuthModal";
import { getVinylById } from "../../lib/firestoreVinyls";
import { incrementProductView } from "../../lib/productAnalytics";

export default function ProductPageClient({ vinyl, id }: { vinyl: Vinyl | null; id: string }) {
  const [quantity, setQuantity] = useState(1);
  const [currentVinyl, setCurrentVinyl] = useState<Vinyl | null>(vinyl);
  const [loadingVinyl, setLoadingVinyl] = useState(false);
  const { add } = useCart();
  const { user } = useAuthContext();
  const { open: openAuth } = useAuthModal();
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadWishlist() {
      if (!user) { setInWishlist(false); return; }
      try {
        const items = await getWishlist(user.uid);
        if (!mounted) return;
        setInWishlist(items.includes(id));
      } catch (err) {
        console.error("wishlist load", err);
      }
    }
    loadWishlist();
    return () => { mounted = false; };
  }, [user, id]);

  // Track product view once on mount
  useEffect(() => {
    if (id) incrementProductView(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    let mounted = true;
    async function loadVinyl() {
      if (currentVinyl) return;
      setLoadingVinyl(true);
      try {
        const v = await getVinylById(id);
        if (!mounted) return;
        setCurrentVinyl(v);
      } catch (err) {
        console.error("client fetch vinyl failed", err);
      } finally {
        if (mounted) setLoadingVinyl(false);
      }
    }
    loadVinyl();
    return () => { mounted = false; };
  }, [id, currentVinyl]);

  const handleAdd = async () => {
    await add(id, quantity);
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      openAuth();
      return;
    }
    try {
      const res = await toggleWishlist(user.uid, id);
      setInWishlist(res.added);
      try { window.dispatchEvent(new CustomEvent("wishlist-updated")); } catch {}
    } catch (err) {
      console.error("toggle wishlist", err);
    }
  };

  if (loadingVinyl) return <main className="min-h-screen bg-black text-white py-8"><div className="max-w-6xl mx-auto px-6 py-8 bg-[#f6efe6] text-[#5a1518] rounded">Loading…</div></main>;
  if (!currentVinyl) return <main className="min-h-screen bg-black text-white py-8"><div className="max-w-6xl mx-auto px-6 py-8 bg-[#f6efe6] text-[#5a1518] rounded">Product not found.</div></main>;

  const price = currentVinyl.onSale && currentVinyl.salePrice ? currentVinyl.salePrice : currentVinyl.price || 0;

  return (
    <main className="min-h-screen bg-black text-white py-8">
      <div className="max-w-6xl mx-auto px-6 py-8 bg-[#f6efe6] text-[#5a1518] rounded-lg">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <div className="w-full bg-gray-200 rounded overflow-hidden">
              {currentVinyl.imageUrl ? (
                // @ts-ignore allow external
                <img src={currentVinyl.imageUrl} alt={currentVinyl.albumName} className="w-full h-[480px] object-cover" />
              ) : (
                <div className="w-full h-[480px] bg-gray-300 flex items-center justify-center">No image</div>
              )}
            </div>
          </div>

          <div className="md:w-1/2 flex flex-col justify-start">
            <h1 className="text-3xl font-bold text-[#5a1518]">{currentVinyl.albumName}</h1>
            <p className="text-sm text-[#3b2f27] mb-4">{currentVinyl.artist}</p>
            {currentVinyl.tags && Array.isArray(currentVinyl.tags) && currentVinyl.tags.length > 0 && (
              <div className="flex gap-2 mb-4">
                {currentVinyl.tags.map((t) => (
                  <span key={t} className="text-xs bg-[#e9dfd4] text-[#5a1518] px-2 py-1 rounded-full">{t}</span>
                ))}
              </div>
            )}
            <div className="text-2xl font-bold text-[#5a1518] mb-6">R {Number(price).toFixed(2)}</div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-[#dacdbf] rounded">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 bg-[#8a3b42] text-white hover:bg-[#a94a56] transition-colors duration-150">-</button>
                <div className="px-4 py-2">{quantity}</div>
                <button onClick={() => setQuantity((q) => q + 1)} className="px-3 py-2 bg-[#8a3b42] text-white hover:bg-[#a94a56] transition-colors duration-150">+</button>
              </div>

              <button onClick={handleAdd} className="flex items-center gap-2 px-5 py-3 rounded bg-[#8a3b42] text-white hover:bg-[#a94a56] min-w-[140px] justify-center transition-colors duration-150">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6h15l-1.5 9h-11z" />
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="18" cy="20" r="1" />
                </svg>
                <span className="font-semibold">Add</span>
              </button>

              <button onClick={handleToggleWishlist} className="flex items-center gap-2 px-5 py-3 rounded bg-[#5a1518] text-[#f6efe6] hover:bg-[#6e1e22] min-w-[140px] justify-center transition-colors duration-150">
                {inWishlist ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7.5-4.35-10-7.17C-0.43 10.76 2.5 6 6.5 6c2.24 0 3.5 1.5 5.5 3.5C13 7.5 14.27 6 16.5 6 20.5 6 23.43 10.76 22 13.83 19.5 16.65 12 21 12 21z" fill="#f6efe6"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7.5-4.35-10-7.17C-0.43 10.76 2.5 6 6.5 6c2.24 0 3.5 1.5 5.5 3.5C13 7.5 14.27 6 16.5 6 20.5 6 23.43 10.76 22 13.83 19.5 16.65 12 21 12 21z" stroke="#f6efe6" strokeWidth="1.6" fill="none"/></svg>
                )}
                <span className="font-medium">Wishlist</span>
              </button>
            </div>

            <div className="text-sm text-[#3b2f27]">
              <div><strong>Condition:</strong> {currentVinyl.condition || "--"}</div>
              <div><strong>Year:</strong> {currentVinyl.year || "-"}</div>
              <div><strong>Genres:</strong> {Array.isArray(currentVinyl.genres) ? currentVinyl.genres.join(", ") : currentVinyl.genres}</div>
            </div>

            <div className="mt-6 text-sm text-[#3b2f27]">
              <h4 className="font-semibold mb-2">Description</h4>
              <p>{currentVinyl.description || "No description available."}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
