"use client";

import React from "react";
import KpiCard from "./KpiCard";
import type { CustomerKpiData } from "../../../types/customer-report";

type Props = {
  kpis: CustomerKpiData;
};

const formatCurrency = (v: number) =>
  `R${v.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CustomerKpiSection({ kpis }: Props) {
  const {
    totalCustomers,
    totalRevenue,
    averageCLV,
    topSpendingCustomer,
    returningCustomersPercent,
    mostCommonCountry,
  } = kpis;

  return (
    <section>
      <h2 className="text-xl font-semibold text-[#F5E6D3] mb-4">
        Key Performance Indicators
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <KpiCard
          label="Total Customers"
          value={totalCustomers.toLocaleString()}
          colorClass="text-[#1B4332]"
        />
        <KpiCard
          label="Total Revenue from Customers"
          value={formatCurrency(totalRevenue)}
          colorClass="text-[#1B4332]"
        />
        <KpiCard
          label="Average CLV"
          value={formatCurrency(averageCLV)}
          colorClass={averageCLV > 0 ? "text-[#1B4332]" : "text-[#800000]"}
        />
        <KpiCard
          label="Top Spending Customer"
          value={
            topSpendingCustomer
              ? `${topSpendingCustomer.name || "Unknown"} (${formatCurrency(topSpendingCustomer.totalSpent)})`
              : "—"
          }
          colorClass="text-[#1B4332]"
        />
        <KpiCard
          label="Returning Customers %"
          value={`${returningCustomersPercent.toFixed(1)}%`}
          colorClass={
            returningCustomersPercent >= 30
              ? "text-[#1B4332]"
              : "text-[#800000]"
          }
        />
        <KpiCard
          label="Most Common Country"
          value={mostCommonCountry || "—"}
          colorClass="text-[#1B4332]"
        />
      </div>
    </section>
  );
}
