"use client";
import React, { useEffect, useState } from "react";
import useCart from "../../lib/useCart";
import { useAuthContext } from "../../lib/AuthContext";
import { useRouter } from "next/navigation";
import { useAuthModal } from "./AuthModal";
import { getVinylById } from "../../lib/firestoreVinyls";
import type { Vinyl } from "../../types/vinyl";

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, loading, remove, update, clear } = useCart();
  const { user } = useAuthContext();
  const { open: openAuthModal } = useAuthModal();
  const router = useRouter();

  const [lookup, setLookup] = useState<Record<string, Vinyl | null>>({});

  useEffect(() => {
    let mounted = true;
    async function load() {
      const ids = items.map((i) => i.vinylId);
      const entries = await Promise.all(ids.map((id) => getVinylById(id)));
      if (!mounted) return;
      const map: Record<string, Vinyl | null> = {};
      ids.forEach((id, idx) => (map[id] = entries[idx]));
      console.debug("CartDrawer: set lookup", map);
      setLookup(map);
    }
    if (items.length > 0) load();
    return () => {
      mounted = false;
    };
  }, [items]);

  const total = items.reduce((s, i) => {
    const v = lookup[i.vinylId];
    const price = v ? (v.onSale && v.salePrice ? v.salePrice : v.price) : 0;
    return s + price * i.quantity;
  }, 0);

  console.debug("CartDrawer: render", { open, items, lookup, total });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="relative ml-auto w-full max-w-md bg-[#f6efe6] text-[#5a1518] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Your Cart</h3>
          <div className="flex items-center gap-2">
            <button type="button" onClick={async () => { await clear(); }} className="text-sm hover:underline">Clear</button>
            <button type="button" onClick={onClose} className="text-sm hover:underline">Close</button>
          </div>
        </div>

        {loading && <div>Loading…</div>}

        {!loading && items.length === 0 && <div className="py-6 text-sm">Your cart is empty.</div>}

        <ul className="space-y-3">
          {items.map((it) => {
            const v = lookup[it.vinylId];
            const title = v ? v.albumName : `Record ${it.vinylId}`;
            const img = v ? v.imageUrl : undefined;
            const price = v ? (v.onSale && v.salePrice ? v.salePrice : v.price) : 0;
            return (
              <li key={it.vinylId} className="flex items-center justify-between bg-white/80 p-3 rounded">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {img ? (
                      // @ts-ignore allow external URLs
                      <img src={img} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs">No image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm truncate">{title}</div>
                    <div className="text-xs text-gray-600">R {price.toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button onClick={() => update(it.vinylId, it.quantity - 1)} className="px-2 py-1 bg-[#8a3b42] text-white rounded">-</button>
                  <div className="px-2">{it.quantity}</div>
                  <button onClick={() => update(it.vinylId, it.quantity + 1)} className="px-2 py-1 bg-[#8a3b42] text-white rounded">+</button>
                  <button onClick={() => remove(it.vinylId)} className="px-2 py-1 bg-red-600 text-white rounded">Remove</button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium">Total</div>
            <div className="text-sm font-bold">R {total.toFixed(2)}</div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (!user) {
                  openAuthModal();
                } else {
                  try {
                    router.push("/checkout");
                  } catch (e) {
                    // fall back to simple navigation
                    window.location.href = "/checkout";
                  }
                }
              }}
              className="flex-1 px-4 py-2 rounded bg-[#5a1518] text-white"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
