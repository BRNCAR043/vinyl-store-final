// app/page.tsx
import HeroSection from "../components/home/HeroSection";
import AISearchSection from "../components/home/AISearchSection";
import Decorations from "../components/home/Decorations";
import OnSaleSection from "../components/home/OnSaleSection";
import PosterRow from "../components/home/PosterRow";
import CrateFlipSection from "../components/home/CrateFlipSection";
import MostPopularSection from "../components/home/MostPopularSection";
import BrandNewSection from "../components/home/BrandNewSection";
import ProductGrid from "../components/home/ProductGrid";
import FairyLights from "../components/home/FairyLights";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b0202] via-[#0a0606] to-[#050505] text-white">
      <div className="min-h-screen">
        <FairyLights />
        <HeroSection />
        <AISearchSection />
        <CrateFlipSection />
        <OnSaleSection />
        <BrandNewSection />
        <PosterRow />
        <MostPopularSection />
        <PosterRow />
      </div>
    </main>
  );
}
