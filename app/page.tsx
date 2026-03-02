// app/page.tsx
// Home page: assembles a collection of presentational sections that make up the
// storefront landing page (hero, search, curated sections, decorations).
// This file is intentionally light-weight and composes smaller components.
import HeroSection from "../components/home/HeroSection";
import AISearchSection from "../components/home/AISearchSection";
import OnSaleSection from "../components/home/OnSaleSection";
import PosterRow from "../components/home/PosterRow";
import CrateFlipSection from "../components/home/CrateFlipSection";
import BrandNewSection from "../components/home/BrandNewSection";
import FairyLights from "../components/home/FairyLights";

function RusticDivider() {
  return <div className="rustic-divider my-4" />;
}

export default function Home() {
  return (
    <main className="grain-overlay warm-vignette min-h-screen bg-gradient-to-b from-[#1a0f0a] via-[#120a07] to-[#0d0806] text-[#f5e6d3]">
      <div className="min-h-screen relative">
        <FairyLights />
        <HeroSection />
        <RusticDivider />
        <AISearchSection />
        <RusticDivider />
        <CrateFlipSection />
        <RusticDivider />
        <OnSaleSection />
        <PosterRow />
        <RusticDivider />
        <BrandNewSection />
      </div>
    </main>
  );
}
