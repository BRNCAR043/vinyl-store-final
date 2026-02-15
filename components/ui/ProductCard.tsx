import Image from "next/image";
import type { Vinyl } from "../../types/vinyl";

type Props = {
  product: Vinyl;
};

export default function ProductCard({ product }: Props) {
  const sale = Math.random() > 0.6 ? Math.round((product.price * 0.8 + Number.EPSILON) * 100) / 100 : null;

  return (
    <article className="group relative bg-[#070606] rounded-lg overflow-hidden shadow-xl transform transition hover:scale-[1.03]">
      <div className="relative h-48 bg-[#111010] flex items-center justify-center">
        <Image src={product.image} alt={product.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
      </div>
      <div className="p-4">
        <h4 className="text-sm font-semibold text-[#ffeede]">{product.title}</h4>
        <p className="text-xs text-gray-300 mt-1">{product.artist}</p>
        <div className="mt-3 flex items-baseline gap-3">
          {sale ? (
            <>
              <span className="text-sm font-bold text-[#ffd6b3]">${sale.toFixed(2)}</span>
              <span className="text-xs line-through text-gray-500">${product.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-[#ffd6b3]">${product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none group-hover:shadow-[0_8px_40px_rgba(255,140,70,0.08)] transition"></div>
    </article>
  );
}
