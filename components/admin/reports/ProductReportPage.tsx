"use client";

import React, { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Sidebar from "./Sidebar";
import ProductKpiSection from "./ProductKpiSection";
import TopAlbumGrid from "./TopAlbumGrid";
import ProductCharts from "./ProductCharts";
import ProductTable from "./ProductTable";
import type { ProductDoc, ProductKpiData } from "../../../types/product-report";

function computeProductKpis(products: ProductDoc[]): ProductKpiData {
  if (products.length === 0) {
    return {
      topSellingAlbum: null,
      highestRevenueAlbum: null,
      mostViewedAlbum: null,
      bestPerformingGenre: "—",
      overallConversionRate: 0,
      totalRevenueAll: 0,
    };
  }

  let topSellingAlbum = products[0];
  let highestRevenueAlbum = products[0];
  let mostViewedAlbum = products[0];
  let totalSoldSum = 0;
  let totalViewsSum = 0;
  let totalRevenueAll = 0;

  const genreRevenueMap = new Map<string, number>();

  for (const p of products) {
    if (p.totalSold > topSellingAlbum.totalSold) topSellingAlbum = p;
    if (p.totalRevenue > highestRevenueAlbum.totalRevenue) highestRevenueAlbum = p;
    if (p.totalViews > mostViewedAlbum.totalViews) mostViewedAlbum = p;

    totalSoldSum += p.totalSold;
    totalViewsSum += p.totalViews;
    totalRevenueAll += p.totalRevenue;

    const genre = p.genres?.trim() || "Unknown";
    genreRevenueMap.set(genre, (genreRevenueMap.get(genre) || 0) + p.totalRevenue);
  }

  let bestPerformingGenre = "Unknown";
  let maxGenreRevenue = 0;
  for (const [genre, rev] of genreRevenueMap) {
    if (rev > maxGenreRevenue) {
      maxGenreRevenue = rev;
      bestPerformingGenre = genre;
    }
  }

  const overallConversionRate =
    totalViewsSum === 0 ? 0 : (totalSoldSum / totalViewsSum) * 100;

  return {
    topSellingAlbum,
    highestRevenueAlbum,
    mostViewedAlbum,
    bestPerformingGenre,
    overallConversionRate,
    totalRevenueAll,
  };
}

export default function ProductReportPage() {
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"financial" | "product" | "customer">("product");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        const snapshot = await getDocs(collection(db, "vinyls"));
        const docs: ProductDoc[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            albumName: data.albumName ?? "",
            artist: data.artist ?? "",
            year: data.year ?? "",
            price: data.price ?? 0,
            cost: data.cost,
            salePrice: data.salePrice,
            onSale: data.onSale,
            genres: data.genres ?? "",
            description: data.description,
            imageUrl: data.imageUrl,
            totalSold: data.totalSold ?? 0,
            totalRevenue: data.totalRevenue ?? 0,
            totalViews: data.totalViews ?? 0,
          };
        });

        setProducts(docs);
      } catch (err: unknown) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load product data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const kpis = useMemo(() => computeProductKpis(products), [products]);

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 bg-[#5C1A1B] p-8 space-y-16 overflow-y-auto">
        <h1 className="text-3xl font-bold text-[#F5E6D3] tracking-wide">
          Product Report
        </h1>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#F5E6D3] border-t-transparent rounded-full animate-spin" />
              <span className="text-[#F5E6D3]/80 text-sm">
                Loading product data…
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 border border-red-400 text-red-200 rounded-xl px-6 py-4 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            <ProductKpiSection kpis={kpis} />
            <TopAlbumGrid products={products} />
            <ProductCharts products={products} />
            <ProductTable products={products} />
          </>
        )}
      </main>
    </div>
  );
}
