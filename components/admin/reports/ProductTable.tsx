"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { FaSort, FaSortUp, FaSortDown, FaSearch } from "react-icons/fa";
import type { ProductDoc, ProductSortKey, ProductSortConfig } from "../../../types/product-report";

type Props = {
  products: ProductDoc[];
};

const formatCurrency = (v: number) =>
  `R${v.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function conversionRate(sold: number, views: number): number {
  return views === 0 ? 0 : (sold / views) * 100;
}

const PAGE_SIZE = 10;

export default function ProductTable({ products }: Props) {
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<ProductSortConfig>({
    key: "totalSold",
    direction: "desc",
  });
  const [page, setPage] = useState(0);

  // Unique genres for dropdown
  const genres = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.genres?.trim()) set.add(p.genres.trim());
    }
    return Array.from(set).sort();
  }, [products]);

  // Filter
  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.albumName.toLowerCase().includes(q) ||
          p.artist.toLowerCase().includes(q)
      );
    }
    if (genreFilter !== "all") {
      list = list.filter((p) => p.genres?.trim() === genreFilter);
    }
    return list;
  }, [products, search, genreFilter]);

  // Sort
  const sortedProducts = useMemo((): ProductDoc[] => {
    const list = [...filtered];
    list.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;
      if (sortConfig.key === "conversion") {
        aVal = conversionRate(a.totalSold, a.totalViews);
        bVal = conversionRate(b.totalSold, b.totalViews);
      } else if (sortConfig.key === "albumName" || sortConfig.key === "artist" || sortConfig.key === "genres") {
        aVal = (a[sortConfig.key] || "").toString().toLowerCase();
        bVal = (b[sortConfig.key] || "").toString().toLowerCase();
      } else {
        aVal = (a[sortConfig.key] as number) || 0;
        bVal = (b[sortConfig.key] as number) || 0;
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

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));
  const paginated = sortedProducts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => setPage(0), [search, genreFilter]);

  const handleSort = (key: ProductSortKey) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "desc" };
    });
  };

  const SortIcon = ({ column }: { column: ProductSortKey }) => {
    if (sortConfig.key !== column)
      return <FaSort className="inline ml-1 opacity-40" size={11} />;
    return sortConfig.direction === "asc" ? (
      <FaSortUp className="inline ml-1" size={11} />
    ) : (
      <FaSortDown className="inline ml-1" size={11} />
    );
  };

  type Column = { key: ProductSortKey | "cover"; label: string; sortable: boolean };
  const columns: Column[] = [
    { key: "cover", label: "", sortable: false },
    { key: "albumName", label: "Album", sortable: true },
    { key: "artist", label: "Artist", sortable: true },
    { key: "genres", label: "Genre", sortable: true },
    { key: "totalViews", label: "Views", sortable: true },
    { key: "totalSold", label: "Units Sold", sortable: true },
    { key: "totalRevenue", label: "Revenue", sortable: true },
    { key: "conversion", label: "Conversion %", sortable: true },
  ];

  return (
    <section>
      <h2 className="text-xl font-semibold text-[#F5E6D3] mb-4">
        Product Performance Table
      </h2>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={14} />
          <input
            type="text"
            placeholder="Search album or artist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#F5E6D3] text-black text-sm border border-[#d6c4b0] focus:outline-none focus:ring-2 focus:ring-[#800000] placeholder:text-black/40"
          />
        </div>
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="bg-[#F5E6D3] text-black rounded-lg px-3 py-2.5 text-sm font-medium border border-[#d6c4b0] focus:outline-none focus:ring-2 focus:ring-[#800000]"
        >
          <option value="all">All Genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
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
                      col.sortable && col.key !== "cover"
                        ? handleSort(col.key as ProductSortKey)
                        : undefined
                    }
                    className={`px-4 py-3 text-left font-semibold whitespace-nowrap ${
                      col.sortable ? "cursor-pointer select-none hover:bg-[#7a3039]" : ""
                    } ${col.key === "cover" ? "w-14" : ""}`}
                  >
                    {col.label}
                    {col.sortable && col.key !== "cover" && (
                      <SortIcon column={col.key as ProductSortKey} />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[#F5E6D3]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-black/60">
                    No products found.
                  </td>
                </tr>
              ) : (
                paginated.map((p, idx) => {
                  const cr = conversionRate(p.totalSold, p.totalViews);
                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-[#e8d5c0] transition-colors hover:bg-[#ecdcc8] ${
                        idx % 2 === 0 ? "bg-[#F5E6D3]" : "bg-[#EEDFcf]"
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.albumName}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-[#d6c4b0] flex items-center justify-center text-lg">
                            🎵
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-black truncate max-w-[180px]">
                        {p.albumName}
                      </td>
                      <td className="px-4 py-2.5 text-black/80 truncate max-w-[150px]">
                        {p.artist}
                      </td>
                      <td className="px-4 py-2.5 text-black/70">{p.genres || "—"}</td>
                      <td className="px-4 py-2.5 text-black">
                        {p.totalViews.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-[#1B4332]">
                        {p.totalSold.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-[#800000]">
                        {formatCurrency(p.totalRevenue)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`font-semibold ${
                            cr >= 5 ? "text-[#1B4332]" : "text-[#800000]"
                          }`}
                        >
                          {cr.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-[#F5E6D3]/70">
            Page {page + 1} of {totalPages} ({sortedProducts.length} products)
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
