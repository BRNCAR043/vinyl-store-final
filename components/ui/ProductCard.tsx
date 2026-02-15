// Placeholder ProductCard for OnSaleSection (not admin)
type ProductCardProps = {
  albumName: string;
  artist: string;
  condition: string;
  releaseYear: number | string;
  price: number;
  salePrice?: number | null;
};

export default function ProductCard({ albumName, artist, condition, releaseYear, price, salePrice }: ProductCardProps) {
  // Defensive: fallback to 0 if price or salePrice are undefined/null
  const safePrice = typeof price === 'number' && !isNaN(price) ? price : 0;
  const safeSalePrice = typeof salePrice === 'number' && !isNaN(salePrice) ? salePrice : undefined;
  return (
    <div className="rounded-xl bg-white shadow p-4 flex flex-col items-center transition-transform duration-200 hover:scale-105">
      <div className="w-32 h-32 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400">Image</div>
      <h3 className="font-bold text-lg mb-1">{albumName}</h3>
      <p className="text-gray-600 text-sm mb-1">{artist}</p>
      <p className="text-gray-500 text-xs mb-1">{condition} • {releaseYear}</p>
      {safeSalePrice && safeSalePrice > 0 && safeSalePrice < safePrice ? (
        <div className="flex items-center gap-2">
          <span className="text-gray-400 line-through">R {safePrice.toFixed(2)}</span>
          <span className="text-emerald-700 font-bold">R {safeSalePrice.toFixed(2)}</span>
        </div>
      ) : (
        <span className="text-emerald-700 font-bold">R {safePrice.toFixed(2)}</span>
      )}
    </div>
  );
}


