"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { MonthlyFinancialData } from "../../../types/financial";

type FinancialChartsProps = {
  data: MonthlyFinancialData[];
};

const formatCurrency = (v: number) =>
  `R${v.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function FinancialCharts({ data }: FinancialChartsProps) {
  return (
    <div className="space-y-12 mt-12">
      {/* Revenue vs Cost Line Chart */}
      <div className="bg-[#F5E6D3] rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-black mb-4">Revenue vs Cost Over Time</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d6c4b0" />
            <XAxis dataKey="month" stroke="#333" tick={{ fontSize: 12 }} />
            <YAxis stroke="#333" tick={{ fontSize: 12 }} tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value ?? 0)), undefined]}
              contentStyle={{ backgroundColor: "#F5E6D3", border: "1px solid #800000", borderRadius: 8 }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#1B4332"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#1B4332" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="cost"
              name="Cost"
              stroke="#800000"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#800000" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Profit Bar Chart */}
      <div className="bg-[#F5E6D3] rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-black mb-4">Monthly Profit</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d6c4b0" />
            <XAxis dataKey="month" stroke="#333" tick={{ fontSize: 12 }} />
            <YAxis stroke="#333" tick={{ fontSize: 12 }} tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value ?? 0)), "Profit"]}
              contentStyle={{ backgroundColor: "#F5E6D3", border: "1px solid #800000", borderRadius: 8 }}
            />
            <Bar dataKey="profit" name="Profit" radius={[6, 6, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.profit >= 0 ? "#1B4332" : "#800000"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
