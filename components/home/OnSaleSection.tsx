import FilterSidebar from "../ui/FilterSidebar";
import ProductGrid from "./ProductGrid";
import type { Vinyl } from "../../types/vinyl";

const sample: Vinyl[] = [
  { id: "1", title: "Abbey Road", artist: "The Beatles", price: 29.99, image: "/vinyl1.jpg" },
  { id: "2", title: "Dark Side of the Moon", artist: "Pink Floyd", price: 24.99, image: "/vinyl2.jpg" },
  { id: "3", title: "Nevermind", artist: "Nirvana", price: 22.0, image: "/vinyl3.jpg" },
  { id: "4", title: "Rumours", artist: "Fleetwood Mac", price: 19.99, image: "/vinyl4.jpg" },
  { id: "5", title: "Led Zeppelin IV", artist: "Led Zeppelin", price: 27.5, image: "/vinyl5.jpg" },
  { id: "6", title: "OK Computer", artist: "Radiohead", price: 21.0, image: "/vinyl6.jpg" },
];

export default function OnSaleSection() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <aside className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-4 text-[#ffeede]">On Sale</h2>
          <FilterSidebar />
        </aside>
        <div className="lg:col-span-2">
          <ProductGrid products={sample} />
        </div>
      </div>
    </section>
  );
}
