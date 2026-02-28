"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type {
  CustomerAggregated,
  CountryRevenue,
  AgeDistribution,
  GenderDistribution,
  PurchaseFrequency,
} from "../../../types/customer-report";

type Props = {
  customers: CustomerAggregated[];
};

const formatCurrency = (v: number) =>
  `R${v.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const COLORS = ["#800000", "#1B4332", "#b45309", "#4a1942", "#0e4429", "#6b2121"];

const tooltipStyle = {
  backgroundColor: "#F5E6D3",
  border: "1px solid #800000",
  borderRadius: 8,
};

export default function CustomerCharts({ customers }: Props) {
  // 1. Revenue by Country
  const revenueByCountry: CountryRevenue[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of customers) {
      const country = c.country?.trim() || "Unknown";
      map.set(country, (map.get(country) || 0) + c.totalSpent);
    }
    return Array.from(map.entries())
      .map(([country, revenue]) => ({ country, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [customers]);

  // 2. Age Distribution
  const ageDistribution: AgeDistribution[] = useMemo(() => {
    const buckets: Record<string, number> = {
      "Under 18": 0,
      "18–25": 0,
      "26–35": 0,
      "36–50": 0,
      "50+": 0,
    };
    for (const c of customers) {
      if (c.age == null) continue;
      if (c.age < 18) buckets["Under 18"]++;
      else if (c.age <= 25) buckets["18–25"]++;
      else if (c.age <= 35) buckets["26–35"]++;
      else if (c.age <= 50) buckets["36–50"]++;
      else buckets["50+"]++;
    }
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [customers]);

  // 3. Gender Distribution
  const genderDistribution: GenderDistribution[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of customers) {
      const gender = c.gender?.trim() || "Not specified";
      map.set(gender, (map.get(gender) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([gender, count]) => ({ gender, count }))
      .sort((a, b) => b.count - a.count);
  }, [customers]);

  // 4. Purchase Frequency
  const purchaseFrequency: PurchaseFrequency[] = useMemo(() => {
    const buckets: Record<string, number> = {
      "1 order": 0,
      "2–3 orders": 0,
      "4+ orders": 0,
    };
    for (const c of customers) {
      if (c.totalOrders === 0) continue;
      if (c.totalOrders === 1) buckets["1 order"]++;
      else if (c.totalOrders <= 3) buckets["2–3 orders"]++;
      else buckets["4+ orders"]++;
    }
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [customers]);

  return (
    <section className="space-y-12">
      <h2 className="text-xl font-semibold text-[#F5E6D3]">
        Customer Analytics Charts
      </h2>

      {/* 1. Revenue by Country */}
      <div className="bg-[#F5E6D3] rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-black mb-4">
          Revenue by Country
        </h3>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart
            data={revenueByCountry}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#d6c4b0" />
            <XAxis
              dataKey="country"
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
              formatter={(value) => [
                formatCurrency(Number(value ?? 0)),
                "Revenue",
              ]}
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

      {/* 2. Customer Age Distribution */}
      <div className="bg-[#F5E6D3] rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-black mb-4">
          Customer Age Distribution
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={ageDistribution}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#d6c4b0" />
            <XAxis dataKey="range" stroke="#333" tick={{ fontSize: 12 }} />
            <YAxis stroke="#333" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar
              dataKey="count"
              name="Customers"
              fill="#800000"
              radius={[6, 6, 0, 0]}
              barSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Gender Distribution */}
      <div className="bg-[#F5E6D3] rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-black mb-4">
          Gender Distribution
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={genderDistribution}
              dataKey="count"
              nameKey="gender"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ name, percent }: { name?: string; percent?: number }) =>
                `${name ?? ""} (${((percent ?? 0) * 100).toFixed(1)}%)`
              }
              labelLine
            >
              {genderDistribution.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Customer Purchase Frequency */}
      <div className="bg-[#F5E6D3] rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-black mb-4">
          Customer Purchase Frequency
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={purchaseFrequency}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#d6c4b0" />
            <XAxis dataKey="range" stroke="#333" tick={{ fontSize: 12 }} />
            <YAxis stroke="#333" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar
              dataKey="count"
              name="Customers"
              fill="#1B4332"
              radius={[6, 6, 0, 0]}
              barSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
