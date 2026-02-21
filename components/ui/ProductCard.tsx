"use client";
// Placeholder ProductCard for OnSaleSection (not admin)
import Image from "next/image";
import type { Vinyl } from "../../types/vinyl";
import WishlistButton from "./WishlistButton";
import useCart from "../../lib/useCart";
import { useRouter } from "next/navigation";

type Props = {
  product: Vinyl;
};

export default function ProductCard({ product }: Props) {
  const { add } = useCart();
  const albumName = product.albumName || product.title || "Unknown";
  const artist = product.artist || "Unknown artist";
  const condition = product.condition || "--";
  const releaseYear = product.year || (product as any).releaseYear || "-";
  const price = typeof product.price === "number" && !isNaN(product.price) ? product.price : 0;
  const salePrice = typeof product.salePrice === "number" && !isNaN(product.salePrice) ? product.salePrice : undefined;

  const router = useRouter();
  const href = product.id ? `/vinyl/${product.id}` : null;

  function navigateTo(e?: React.MouseEvent) {
    try { e?.stopPropagation(); } catch {}
    if (!href) return;
    console.debug("navigating to", href);
    router.push(href);
  }

  const content = (
    <div className="w-full flex flex-col items-start">
      <div className="w-full aspect-square mb-3 relative bg-gray-800 rounded overflow-hidden">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={albumName} fill style={{ objectFit: "cover" }} className="rounded" />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-300">No image</div>
        )}
        <div className="absolute top-2 right-2">
          <WishlistButton vinylId={product.id!} />
        </div>
      </div>
      <h3 className="font-bold text-lg mb-1 text-white" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{albumName}</h3>
      <p className="text-gray-200 text-sm mb-1 truncate w-full">{artist}</p>
      <p className="text-gray-200 text-xs mb-1">{condition} • {releaseYear}</p>
    </div>
  );

  return (
    <div className="rounded-xl bg-[#8a3b42] p-4 flex flex-col items-start text-white transition-transform duration-200 hover:scale-105 min-h-[360px] relative transform scale-95 hover:scale-100">
      {href ? (
        <div onClick={navigateTo} role="link" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") navigateTo(); }} className="w-full block cursor-pointer">
          {content}
        </div>
      ) : content}

      <div className="w-full mt-2 flex items-center justify-between">
        <div>
          {salePrice !== undefined && salePrice > 0 && salePrice < price ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-300 line-through">R {price.toFixed(2)}</span>
              <span className="text-white font-bold">R {salePrice.toFixed(2)}</span>
            </div>
          ) : (
            <span className="text-white font-bold">R {price.toFixed(2)}</span>
          )}
        </div>
        <div>
          <button
            aria-label="Add to cart"
            onClick={(e) => { e.stopPropagation(); add(product.id!, 1); }}
            className="ml-3 inline-flex items-center gap-2 rounded px-3 py-2 bg-[#ffeede] hover:opacity-95">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#8a3b42]" stroke="#8a3b42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6h15l-1.5 9h-11z" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            <span className="text-[#8a3b42] font-semibold">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}


