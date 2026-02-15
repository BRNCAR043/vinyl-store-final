import ProductCard from "../ui/ProductCard";
import type { Vinyl } from "../../types/vinyl";

type Props = {
  products?: Vinyl[];
  title?: string;
};

export default function ProductGrid({ products = [], title }: Props) {
  const fallback: Vinyl[] = [
    { id: "a1", title: "Sample A", artist: "Artist A", price: 18.0, image: "/vinyl1.jpg" },
    { id: "a2", title: "Sample B", artist: "Artist B", price: 22.0, image: "/vinyl2.jpg" },
    { id: "a3", title: "Sample C", artist: "Artist C", price: 24.5, image: "/vinyl3.jpg" },
    { id: "a4", title: "Sample D", artist: "Artist D", price: 20.0, image: "/vinyl4.jpg" },
  ];

  const list = products.length ? products : fallback;

  return (
    <section className="py-12">
      {title && <h3 className="text-2xl font-semibold mb-6 text-[#ffeede]">{title}</h3>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
