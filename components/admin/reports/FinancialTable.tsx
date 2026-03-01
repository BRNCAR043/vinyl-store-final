"use client";

import React, { useState, useMemo } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import type { MonthlyFinancialData, SortConfig, SortDirection, FilterRange } from "../../../types/financial";

type FinancialTableProps = {
  data: MonthlyFinancialData[];
};

const formatCurrency = (v: number) =>
  `R${v.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const computeMargin = (profit: number, revenue: number) =>
  revenue === 0 ? 0 : (profit / revenue) * 100;

const marginColorClass = (margin: number) => {
  if (margin >= 40) return "text-[#1B4332]";
  if (margin >= 20) return "text-yellow-600";
  return "text-red-600";
};

export default function FinancialTable({ data }: FinancialTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "month", direction: "desc" });
  const [filterRange, setFilterRange] = useState<FilterRange>("12");

  const filteredData = useMemo(() => {
    const months = parseInt(filterRange, 10);
    const sorted = [...data].sort((a, b) => b.month.localeCompare(a.month));
    return sorted.slice(0, months);
  }, [data, filterRange]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      const aNum = typeof aVal === "number" ? aVal : 0;
      const bNum = typeof bVal === "number" ? bVal : 0;
      return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
    });
    return sorted;
  }, [filteredData, sortConfig]);

  const handleSort = (key: keyof MonthlyFinancialData) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        const nextDir: SortDirection = prev.direction === "asc" ? "desc" : "asc";
        return { key, direction: nextDir };
      }
      return { key, direction: "asc" };
    });
  };

  const SortIcon = ({ column }: { column: keyof MonthlyFinancialData }) => {
    if (sortConfig.key !== column) return <FaSort className="inline ml-1 opacity-40" size={12} />;
    return sortConfig.direction === "asc" ? (
      <FaSortUp className="inline ml-1" size={12} />
    ) : (
      <FaSortDown className="inline ml-1" size={12} />
    );
  };

  const columns: { key: keyof MonthlyFinancialData | "margin"; label: string }[] = [
    { key: "month", label: "Month" },
    { key: "revenue", label: "Revenue" },
    { key: "cost", label: "Cost" },
    { key: "profit", label: "Profit" },
    { key: "margin", label: "Gross Margin %" },
  ];

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#F5E6D3]">Monthly Breakdown</h3>
        <select
          value={filterRange}
          onChange={(e) => setFilterRange(e.target.value as FilterRange)}
          className="bg-[#F5E6D3] text-black rounded-lg px-3 py-2 text-sm font-medium border border-[#d6c4b0] focus:outline-none focus:ring-2 focus:ring-[#800000]"
        >
          <option value="3">Last 3 months</option>
          <option value="6">Last 6 months</option>
          <option value="12">Last 12 months</option>
        </select>
      </div>
      <div className="rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#8a3b42] text-[#F5E6D3]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.key !== "margin" && handleSort(col.key as keyof MonthlyFinancialData)}
                    className={`px-5 py-3 text-left font-semibold whitespace-nowrap ${
                      col.key !== "margin" ? "cursor-pointer select-none hover:bg-[#7a3039]" : ""
                    }`}
                  >
                    {col.label}
                    {col.key !== "margin" && <SortIcon column={col.key as keyof MonthlyFinancialData} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[#F5E6D3]">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-black/60">
                    No data available
                  </td>
                </tr>
              ) : (
                sortedData.map((row, idx) => {
                  const margin = computeMargin(row.profit, row.revenue);
                  return (
                    <tr
                      key={row.month}
                      className={`border-b border-[#d6c4b0] transition-colors hover:bg-[#e8d5c0] ${
                        idx % 2 === 0 ? "bg-[#F5E6D3]" : "bg-[#efe0d0]"
                      }`}
                    >
                      <td className="px-5 py-3 text-black font-medium">{row.month}</td>
                      <td className="px-5 py-3 text-[#1B4332] font-semibold">
                        {formatCurrency(row.revenue)}
                      </td>
                      <td className="px-5 py-3 text-[#800000] font-semibold">
                        {formatCurrency(row.cost)}
                      </td>
                      <td
                        className={`px-5 py-3 font-semibold ${
                          row.profit >= 0 ? "text-[#1B4332]" : "text-[#800000]"
                        }`}
                      >
                        {formatCurrency(row.profit)}
                      </td>
                      <td className={`px-5 py-3 font-semibold ${marginColorClass(margin)}`}>
                        {margin.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
