"use client";

import React, { useState, useMemo, useEffect } from "react";
import { FaSort, FaSortUp, FaSortDown, FaSearch } from "react-icons/fa";
import type {
  CustomerAggregated,
  CustomerSortKey,
  CustomerSortConfig,
} from "../../../types/customer-report";

type Props = {
  customers: CustomerAggregated[];
};

const formatCurrency = (v: number) =>
  `R${v.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const PAGE_SIZE = 10;

export default function CustomerTable({ customers }: Props) {
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<CustomerSortConfig>({
    key: "totalSpent",
    direction: "desc",
  });
  const [page, setPage] = useState(0);

  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const c of customers) {
      if (c.country?.trim()) set.add(c.country.trim());
    }
    return Array.from(set).sort();
  }, [customers]);

  const filtered = useMemo(() => {
    let list = [...customers];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q)
      );
    }
    if (countryFilter !== "all") {
      list = list.filter((c) => c.country?.trim() === countryFilter);
    }
    return list;
  }, [customers, search, countryFilter]);

  const sortedCustomers = useMemo((): CustomerAggregated[] => {
    const list = [...filtered];
    list.sort((a, b) => {
      let aVal: number | string | Date | null;
      let bVal: number | string | Date | null;

      switch (sortConfig.key) {
        case "name":
        case "email":
        case "country":
        case "gender":
          aVal = (a[sortConfig.key] || "").toLowerCase();
          bVal = (b[sortConfig.key] || "").toLowerCase();
          break;
        case "lastPurchaseDate":
          aVal = a.lastPurchaseDate;
          bVal = b.lastPurchaseDate;
          break;
        case "age":
          aVal = a.age ?? -1;
          bVal = b.age ?? -1;
          break;
        default:
          aVal = (a[sortConfig.key] as number) || 0;
          bVal = (b[sortConfig.key] as number) || 0;
      }

      if (sortConfig.key === "lastPurchaseDate") {
        const aTime = aVal instanceof Date ? aVal.getTime() : 0;
        const bTime = bVal instanceof Date ? bVal.getTime() : 0;
        return sortConfig.direction === "asc" ? aTime - bTime : bTime - aTime;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortConfig.direction === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return list;
  }, [filtered, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedCustomers.length / PAGE_SIZE));
  const paginated = sortedCustomers.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );

  useEffect(() => setPage(0), [search, countryFilter]);

  const handleSort = (key: CustomerSortKey) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "desc" };
    });
  };

  const SortIcon = ({ column }: { column: CustomerSortKey }) => {
    if (sortConfig.key !== column)
      return <FaSort className="inline ml-1 opacity-40" size={11} />;
    return sortConfig.direction === "asc" ? (
      <FaSortUp className="inline ml-1" size={11} />
    ) : (
      <FaSortDown className="inline ml-1" size={11} />
    );
  };

  type Column = {
    key: CustomerSortKey;
    label: string;
    sortable: boolean;
  };

  const columns: Column[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "country", label: "Country", sortable: true },
    { key: "age", label: "Age", sortable: true },
    { key: "gender", label: "Gender", sortable: true },
    { key: "totalOrders", label: "Total Orders", sortable: true },
    { key: "totalSpent", label: "Total Spent", sortable: true },
    { key: "averageOrderValue", label: "Avg Order Value", sortable: true },
    { key: "lastPurchaseDate", label: "Last Purchase", sortable: true },
  ];

  return (
    <section>
      <h2 className="text-xl font-semibold text-[#F5E6D3] mb-4">
        Customer Details Table
      </h2>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <FaSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
            size={14}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#F5E6D3] text-black text-sm border border-[#d6c4b0] focus:outline-none focus:ring-2 focus:ring-[#800000] placeholder:text-black/40"
          />
        </div>
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="bg-[#F5E6D3] text-black rounded-lg px-3 py-2.5 text-sm font-medium border border-[#d6c4b0] focus:outline-none focus:ring-2 focus:ring-[#800000]"
        >
          <option value="all">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#8a3b42] text-[#F5E6D3]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() =>
                      col.sortable ? handleSort(col.key) : undefined
                    }
                    className={`px-4 py-3 text-left font-semibold whitespace-nowrap ${
                      col.sortable
                        ? "cursor-pointer select-none hover:bg-[#7a3039]"
                        : ""
                    }`}
                  >
                    {col.label}
                    {col.sortable && <SortIcon column={col.key} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[#F5E6D3]">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-10 text-center text-black/60"
                  >
                    No customers found.
                  </td>
                </tr>
              ) : (
                paginated.map((c, idx) => (
                  <tr
                    key={c.id}
                    className={`border-b border-[#e8d5c0] transition-colors hover:bg-[#ecdcc8] ${
                      idx % 2 === 0 ? "bg-[#F5E6D3]" : "bg-[#EEDFcf]"
                    }`}
                  >
                    <td className="px-4 py-2.5 font-semibold text-black truncate max-w-[160px]">
                      {c.name || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-black/80 truncate max-w-[200px]">
                      {c.email || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-black/70">
                      {c.country || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-black">
                      {c.age != null ? c.age : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-black/70">
                      {c.gender || "—"}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-[#1B4332]">
                      {c.totalOrders}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-[#800000]">
                      {formatCurrency(c.totalSpent)}
                    </td>
                    <td className="px-4 py-2.5 text-black font-medium">
                      {formatCurrency(c.averageOrderValue)}
                    </td>
                    <td className="px-4 py-2.5 text-black/70 whitespace-nowrap">
                      {formatDate(c.lastPurchaseDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-[#F5E6D3]/70">
            Page {page + 1} of {totalPages} ({sortedCustomers.length} customers)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-1.5 rounded-lg bg-[#F5E6D3] text-black text-sm font-medium disabled:opacity-40 hover:bg-[#ecdcc8] transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-1.5 rounded-lg bg-[#F5E6D3] text-black text-sm font-medium disabled:opacity-40 hover:bg-[#ecdcc8] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
