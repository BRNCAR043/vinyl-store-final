"use client";

import React from "react";
import type { CustomerAggregated } from "../../../types/customer-report";

type Props = {
  customers: CustomerAggregated[];
};

const formatCurrency = (v: number) =>
  `R${v.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function TopCustomerGrid({ customers }: Props) {
  const top5 = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  if (top5.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold text-[#F5E6D3] mb-6">
        Top 5 Customers by Spending
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {top5.map((customer, index) => (
          <div
            key={customer.id}
            className="group relative bg-[#F5E6D3] rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
           

            {/* Avatar */}
            <div className="flex items-center justify-center pt-6 pb-2">
              <div className="w-16 h-16 rounded-full bg-[#8a3b42] flex items-center justify-center text-[#F5E6D3] text-2xl font-bold shadow-md">
                {(customer.name || "?").charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Info */}
            <div className="p-4 space-y-2 text-center">
              <h3 className="text-sm font-bold text-black truncate">
                {customer.name || "Unknown"}
              </h3>
              <p className="text-xs text-black/60 truncate">
                {customer.country || "Unknown"}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#d6c4b0] text-xs">
                <div>
                  <span className="font-semibold text-[#1B4332]">
                    {customer.totalOrders}
                  </span>{" "}
                  <span className="text-black/50">orders</span>
                </div>
                <div>
                  <span className="font-semibold text-[#800000]">
                    {formatCurrency(customer.totalSpent)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-black/50">
                Avg Order:{" "}
                <span className="font-semibold text-black">
                  {formatCurrency(customer.averageOrderValue)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
