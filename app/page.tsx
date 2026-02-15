import Header from "../components/common/Header";
import HeroSection from "../components/home/HeroSection";
import Decorations from "../components/home/Decorations";
import OnSaleSection from "../components/home/OnSaleSection";
import ProductGrid from "../components/home/ProductGrid";
import FairyLights from "../components/home/FairyLights";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#0b0202] via-[#0a0606] to-[#050505] text-white">
        <FairyLights />
        <HeroSection />
        <OnSaleSection />
        <ProductGrid title="New Arrivals" />
        <ProductGrid title="Classic Rock" />
      </main>
    </> 
  );
}
