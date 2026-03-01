import { Suspense } from "react";
import VinylPageContent from "./VinylPageContent";

export default function VinylPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <VinylPageContent />
    </Suspense>
  );
}
