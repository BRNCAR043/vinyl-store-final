"use client";

import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import CustomerKpiSection from "./CustomerKpiSection";
import TopCustomerGrid from "./TopCustomerGrid";
import CustomerCharts from "./CustomerCharts";
import CustomerTable from "./CustomerTable";
import {
  fetchAllCustomers,
  fetchAllCustomerOrders,
  aggregateCustomerData,
} from "../../../lib/customerAnalytics";
import type {
  CustomerAggregated,
  CustomerKpiData,
} from "../../../types/customer-report";

function computeCustomerKpis(
  customers: CustomerAggregated[]
): CustomerKpiData {
  const withOrders = customers.filter((c) => c.totalOrders > 0);

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const averageCLV = totalCustomers === 0 ? 0 : totalRevenue / totalCustomers;

  let topSpendingCustomer: CustomerAggregated | null = null;
  for (const c of customers) {
    if (
      !topSpendingCustomer ||
      c.totalSpent > topSpendingCustomer.totalSpent
    ) {
      topSpendingCustomer = c;
    }
  }

  const returning = withOrders.filter((c) => c.totalOrders > 1).length;
  const returningCustomersPercent =
    withOrders.length === 0 ? 0 : (returning / withOrders.length) * 100;

  // Most common country
  const countryMap = new Map<string, number>();
  for (const c of customers) {
    const country = c.country?.trim() || "Unknown";
    countryMap.set(country, (countryMap.get(country) || 0) + 1);
  }
  let mostCommonCountry = "—";
  let maxCountryCount = 0;
  for (const [country, count] of countryMap) {
    if (count > maxCountryCount) {
      maxCountryCount = count;
      mostCommonCountry = country;
    }
  }

  return {
    totalCustomers,
    totalRevenue,
    averageCLV,
    topSpendingCustomer,
    returningCustomersPercent,
    mostCommonCountry,
  };
}

export default function CustomerReportPage() {
  const [customers, setCustomers] = useState<CustomerAggregated[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "financial" | "product" | "customer"
  >("customer");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [rawCustomers, rawOrders] = await Promise.all([
          fetchAllCustomers(),
          fetchAllCustomerOrders(),
        ]);

        const aggregated = aggregateCustomerData(rawCustomers, rawOrders);
        setCustomers(aggregated);
      } catch (err: unknown) {
        console.error("Failed to fetch customer data:", err);
        setError(
          "Failed to load customer data. Please check your permissions and try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const kpis = useMemo(() => computeCustomerKpis(customers), [customers]);

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 bg-[#5C1A1B] p-8 space-y-16 overflow-y-auto">
        <h1 className="text-3xl font-bold text-[#F5E6D3] tracking-wide">
          Customer Report
        </h1>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#F5E6D3] border-t-transparent rounded-full animate-spin" />
              <span className="text-[#F5E6D3]/80 text-sm">
                Loading customer data…
              </span>
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
            <CustomerKpiSection kpis={kpis} />
            <TopCustomerGrid customers={customers} />
            <CustomerCharts customers={customers} />
            <CustomerTable customers={customers} />
          </>
        )}
      </main>
    </div>
  );
}
