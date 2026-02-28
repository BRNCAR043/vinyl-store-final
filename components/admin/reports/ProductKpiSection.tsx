"use client";

import React from "react";
import ProductKpiCard from "./ProductKpiCard";
import type { ProductKpiData } from "../../../types/product-report";

type Props = {
  kpis: ProductKpiData;
};

const formatCurrency = (v: number) =>
  `R${v.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function ProductKpiSection({ kpis }: Props) {
  const {
    topSellingAlbum,
    highestRevenueAlbum,
    mostViewedAlbum,
    bestPerformingGenre,
    overallConversionRate,
    totalRevenueAll,
  } = kpis;

  return (
    <section>
      <h2 className="text-xl font-semibold text-[#F5E6D3] mb-4">
        Key Performance Indicators
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <ProductKpiCard
          label="Top Selling Album"
          value={topSellingAlbum ? `${topSellingAlbum.albumName} (${topSellingAlbum.totalSold} sold)` : "—"}
          colorClass="text-[#1B4332]"
          imageUrl={topSellingAlbum?.imageUrl}
          albumName={topSellingAlbum?.albumName}
        />
        <ProductKpiCard
          label="Highest Revenue Album"
          value={
            highestRevenueAlbum
              ? `${highestRevenueAlbum.albumName} (${formatCurrency(highestRevenueAlbum.totalRevenue)})`
              : "—"
          }
          colorClass="text-[#1B4332]"
          imageUrl={highestRevenueAlbum?.imageUrl}
          albumName={highestRevenueAlbum?.albumName}
        />
        <ProductKpiCard
          label="Most Viewed Album"
          value={
            mostViewedAlbum
              ? `${mostViewedAlbum.albumName} (${mostViewedAlbum.totalViews.toLocaleString()} views)`
              : "—"
          }
          colorClass="text-[#1B4332]"
          imageUrl={mostViewedAlbum?.imageUrl}
          albumName={mostViewedAlbum?.albumName}
        />
        <ProductKpiCard
          label="Best Performing Genre"
          value={bestPerformingGenre || "—"}
          colorClass="text-[#1B4332]"
        />
        <ProductKpiCard
          label="Overall Conversion Rate"
          value={`${overallConversionRate.toFixed(2)}%`}
          colorClass={overallConversionRate >= 5 ? "text-[#1B4332]" : "text-[#800000]"}
        />
        <ProductKpiCard
          label="Total Revenue (All Products)"
          value={formatCurrency(totalRevenueAll)}
          colorClass="text-[#1B4332]"
        />
      </div>
    </section>
  );
}
