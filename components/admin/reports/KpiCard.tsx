"use client";

import React from "react";

type KpiCardProps = {
  label: string;
  value: string;
  colorClass?: string;
};

export default function KpiCard({ label, value, colorClass = "text-black" }: KpiCardProps) {
  return (
    <div className="rounded-2xl bg-[#F5E6D3] p-6 shadow-md flex flex-col gap-2">
      <span className="text-sm font-medium text-black/70 tracking-wide uppercase">
        {label}
      </span>
      <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
    </div>
  );
}
