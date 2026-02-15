// app/page.tsx
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/home/HeroSection";
import Decorations from "../components/home/Decorations";
import OnSaleSection from "../components/home/OnSaleSection";
import PosterRow from "../components/home/PosterRow";
import CrateFlipSection from "../components/home/CrateFlipSection";
import MostPopularSection from "../components/home/MostPopularSection";
import ProductGrid from "../components/home/ProductGrid";
import FairyLights from "../components/home/FairyLights";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#0b0202] via-[#0a0606] to-[#050505] text-white">
        <FairyLights />
        <HeroSection />
        <CrateFlipSection />
        <OnSaleSection />
        <PosterRow />
        <MostPopularSection />
        <PosterRow />
      </main>
      <Footer />
    </>
  );
}
