"use client";

import React, { useEffect, useState, useMemo } from "react";
import { auth } from "../../../lib/firebase";
import type { MonthlyFinancialData, KpiData } from "../../../types/financial";
import Sidebar from "./Sidebar";
import KpiCard from "./KpiCard";
import FinancialCharts from "./FinancialCharts";
import FinancialTable from "./FinancialTable";

type OrderDoc = {
  createdAt: { seconds: number } | null;
  totalAmount: number;
  totalCost: number;
  totalProfit: number;
};

const formatCurrency = (v: number) =>
  `R${v.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function aggregateMonthlyData(orders: OrderDoc[]): MonthlyFinancialData[] {
  const map = new Map<string, { revenue: number; cost: number; profit: number }>();

  for (const order of orders) {
    if (!order.createdAt?.seconds) continue;
    const date = new Date(order.createdAt.seconds * 1000);

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const existing = map.get(monthKey) || { revenue: 0, cost: 0, profit: 0 };
    existing.revenue += order.totalAmount || 0;
    existing.cost += order.totalCost || 0;
    existing.profit += order.totalProfit || 0;
    map.set(monthKey, existing);
  }

  return Array.from(map.entries())
    .map(([month, vals]) => ({ month, ...vals }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function computeKpis(orders: OrderDoc[]): KpiData {
  let totalRevenue = 0;
  let totalCost = 0;
  let grossProfit = 0;

  for (const order of orders) {
    totalRevenue += order.totalAmount || 0;
    totalCost += order.totalCost || 0;
    grossProfit += order.totalProfit || 0;
  }

  const grossMarginPercent = totalRevenue === 0 ? 0 : (grossProfit / totalRevenue) * 100;
  const averageOrderValue = orders.length === 0 ? 0 : totalRevenue / orders.length;

  return { totalRevenue, totalCost, grossProfit, grossMarginPercent, averageOrderValue };
}

function marginColorClass(margin: number) {
  if (margin >= 40) return "text-[#1B4332]";
  if (margin >= 20) return "text-yellow-600";
  return "text-red-600";
}

export default function FinancialReportPage() {
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"financial" | "product" | "customer">("financial");

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        setError(null);

        const user = auth.currentUser;
        if (!user) {
          setError("You must be logged in.");
          return;
        }

        const token = await user.getIdToken();
        const res = await fetch("/api/admin/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Request failed (${res.status})`);
        }

        const data = await res.json();
        setOrders(data.orders ?? []);
      } catch (err: unknown) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to load financial data. Please check your permissions.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const monthlyData = useMemo(() => aggregateMonthlyData(orders), [orders]);
  const kpis = useMemo(() => computeKpis(orders), [orders]);

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 bg-[#5C1A1B] p-8 space-y-12 overflow-y-auto">
        <h1 className="text-3xl font-bold text-[#F5E6D3] tracking-wide">Financial Report</h1>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#F5E6D3] border-t-transparent rounded-full animate-spin" />
              <span className="text-[#F5E6D3]/80 text-sm">Loading financial data…</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/40 border border-red-400 text-red-200 rounded-xl px-6 py-4 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* KPI Cards */}
            <section>
              <h2 className="text-xl font-semibold text-[#F5E6D3] mb-4">Key Performance Indicators</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
                <KpiCard
                  label="Total Revenue"
                  value={formatCurrency(kpis.totalRevenue)}
                  colorClass="text-[#1B4332]"
                />
                <KpiCard
                  label="Total Cost of Sales"
                  value={formatCurrency(kpis.totalCost)}
                  colorClass="text-[#800000]"
                />
                <KpiCard
                  label="Gross Profit"
                  value={formatCurrency(kpis.grossProfit)}
                  colorClass={kpis.grossProfit >= 0 ? "text-[#1B4332]" : "text-[#800000]"}
                />
                <KpiCard
                  label="Gross Margin %"
                  value={`${kpis.grossMarginPercent.toFixed(1)}%`}
                  colorClass={marginColorClass(kpis.grossMarginPercent)}
                />
                <KpiCard
                  label="Avg Order Value"
                  value={formatCurrency(kpis.averageOrderValue)}
                  colorClass="text-black"
                />
              </div>
            </section>

            {/* Charts */}
            <section>
              <h2 className="text-xl font-semibold text-[#F5E6D3] mb-4">Financial Trends</h2>
              <FinancialCharts data={monthlyData} />
            </section>

            {/* Table */}
            <section>
              <FinancialTable data={monthlyData} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
