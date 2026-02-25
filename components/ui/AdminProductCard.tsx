// components/ui/AdminProductCard.tsx
import VinylForm from "./VinylForm";
import React, { useState } from "react";
import type { Vinyl } from "../../types/vinyl";

type AdminProductCardProps = {
  product: Vinyl;
  onDelete?: () => void;
  onEdit?: (vinyl: Vinyl) => void;
  onUpdated?: () => void;
};

export default function AdminProductCard({ product, onDelete = () => {}, onEdit = () => {}, onUpdated = () => {} }: AdminProductCardProps) {
  const { albumName, artist, price, salePrice, imageUrl, cost, tags } = product;
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  return (
    <>
      <article className="flex flex-col rounded-2xl bg-[#f7efe6] shadow-md overflow-hidden h-full transition-transform duration-200 hover:scale-105">
        <div className="w-full aspect-square bg-gray-200 flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt={albumName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-gray-900 font-semibold text-lg mb-1">{albumName ?? "Untitled"}</h3>
          <p className="text-gray-700 text-sm mb-2">{artist ?? "Unknown Artist"}</p>
          {tags && Array.isArray(tags) && tags.length > 0 && (
            <div className="flex gap-2 mb-2">
              {tags.map((t) => (
                <span key={t} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">{t}</span>
              ))}
            </div>
          )}
          {salePrice && salePrice > 0 && salePrice < price ? (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-gray-500 line-through text-base">R {price?.toFixed(2) ?? "0.00"}</span>
              <span className="text-emerald-800 font-bold text-lg">R {Number(salePrice).toFixed(2)}</span>
            </div>
          ) : (
            <span className="text-emerald-800 font-bold text-lg mb-4">R {price?.toFixed(2) ?? "0.00"}</span>
          )}
          {cost != null && (
            <p className="text-gray-500 text-sm mt-1 mb-4">Cost: R {Number(cost).toFixed(2)}</p>
          )}
          <div className="flex gap-2 mt-auto">
            <button className="bg-emerald-800 text-white px-4 py-2 rounded font-semibold hover:bg-emerald-700" onClick={() => setShowEdit(true)}>Edit</button>
            <button className="bg-[#8a3b42] text-white px-4 py-2 rounded font-semibold hover:bg-[#a94a56]" onClick={() => setShowDelete(true)}>Delete</button>
          </div>
        </div>
      </article>
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full relative text-[#5a1518]">
            <button className="absolute top-4 right-4 text-[#8a3b42] font-bold text-xl hover:text-[#a94a56]" onClick={() => setShowDelete(false)}>×</button>
            <h2 className="text-lg font-semibold mb-4">Delete Record?</h2>
            <p className="mb-6">Are you sure you want to delete <span className="font-bold">{albumName}</span> by <span className="font-bold">{artist}</span>?</p>
            <div className="flex gap-4">
              <button className="bg-[#8a3b42] text-white px-4 py-2 rounded font-semibold hover:bg-[#a94a56]" onClick={() => { onDelete(); setShowDelete(false); }}>Delete</button>
              <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-400" onClick={() => setShowDelete(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative text-[#5a1518]">
            <button className="absolute top-4 right-4 text-[#8a3b42] font-bold text-xl hover:text-[#a94a56]" onClick={() => setShowEdit(false)}>×</button>
            <VinylForm
              key={product.id + "-" + (product.cost ?? "") + "-" + (Array.isArray(product.tags) ? product.tags.join(",") : (product.tags as any) || "")}
              initial={product}
              onSubmit={async (vinyl) => {
                try {
                  const { updateVinyl } = await import("../../lib/firestoreVinyls");
                  if (product.id) {
                    await updateVinyl(product.id, vinyl as any);
                  }
                  setShowEdit(false);
                  if (onUpdated) onUpdated();
                } catch (err) {
                  console.error("update from card failed", err);
                }
              }}
              submitLabel="Update Vinyl"
            />
          </div>
        </div>
      )}
    </>
  );
}
