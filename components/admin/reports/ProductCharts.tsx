"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ProductDoc, GenreRevenue } from "../../../types/product-report";

type Props = {
  products: ProductDoc[];
};

const formatCurrency = (v: number) =>
  `R${v.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function ProductCharts({ products }: Props) {
  // Top 10 by totalSold for horizontal bar chart
  const top10BySold = useMemo(
    () =>
      [...products]
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 10)
        .map((p) => ({
          name: p.albumName.length > 20 ? p.albumName.slice(0, 18) + "…" : p.albumName,
          totalSold: p.totalSold,
        })),
    [products]
  );

  // Revenue grouped by genre
  const revenueByGenre: GenreRevenue[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      const genre = p.genres?.trim() || "Unknown";
      map.set(genre, (map.get(genre) || 0) + p.totalRevenue);
    }
    return Array.from(map.entries())
      .map(([genre, revenue]) => ({ genre, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [products]);

  // Views vs Units Sold — top 10 products
  const viewsVsSold = useMemo(
    () =>
      [...products]
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 10)
        .map((p) => ({
          name: p.albumName.length > 18 ? p.albumName.slice(0, 16) + "…" : p.albumName,
          views: p.totalViews,
          sold: p.totalSold,
        })),
    [products]
  );

  const tooltipStyle = {
    backgroundColor: "#F5E6D3",
    border: "1px solid #800000",
    borderRadius: 8,
  };

  return (
    <section className="space-y-12">
      <h2 className="text-xl font-semibold text-[#F5E6D3]">Product Analytics Charts</h2>

      {/* 1. Horizontal Bar — Top 10 Albums by Units Sold */}
      <div className="bg-[#F5E6D3] rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-black mb-4">
          Top 10 Albums by Units Sold
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={top10BySold}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#d6c4b0" />
            <XAxis type="number" stroke="#333" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="name"
              type="category"
              width={160}
              stroke="#333"
              tick={{ fontSize: 11 }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar
              dataKey="totalSold"
              name="Units Sold"
              fill="#800000"
              radius={[0, 6, 6, 0]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Revenue by Genre */}
      <div className="bg-[#F5E6D3] rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-black mb-4">Revenue by Genre</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={revenueByGenre}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#d6c4b0" />
            <XAxis
              dataKey="genre"
              stroke="#333"
              tick={{ fontSize: 11 }}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="#333"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value ?? 0)), "Revenue"]}
              contentStyle={tooltipStyle}
            />
            <Legend />
            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="#1B4332"
              radius={[6, 6, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Views vs Units Sold */}
      <div className="bg-[#F5E6D3] rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-black mb-4">
          Views vs Units Sold (Top 10)
        </h3>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart
            data={viewsVsSold}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#d6c4b0" />
            <XAxis
              dataKey="name"
              stroke="#333"
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={70}
            />
            <YAxis stroke="#333" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar
              dataKey="views"
              name="Views"
              fill="#800000"
              radius={[6, 6, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="sold"
              name="Units Sold"
              fill="#1B4332"
              radius={[6, 6, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
