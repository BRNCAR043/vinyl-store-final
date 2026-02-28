"use client";

import React from "react";
import { FaChartLine, FaBoxOpen, FaUsers } from "react-icons/fa";

type Tab = "financial" | "product" | "customer";

type SidebarProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "financial", label: "Financial Report", icon: <FaChartLine size={18} /> },
  { key: "product", label: "Product Report", icon: <FaBoxOpen size={18} /> },
  { key: "customer", label: "Customer Report", icon: <FaUsers size={18} /> },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen bg-[#F5E6D3] border-r border-[#d6c4b0] flex flex-col py-8 px-4 gap-2 shrink-0">
      <h2 className="text-lg font-bold text-black mb-6 px-3 tracking-wide">
        Admin Reports
      </h2>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all w-full ${
              isActive
                ? "bg-[#8a3b42] text-[#F5E6D3] shadow-md font-semibold"
                : "text-black hover:bg-[#e8d5c0]"
            }`}
          >
            <span className={isActive ? "text-[#F5E6D3]" : "text-[#800000]"}>
              {tab.icon}
            </span>
            <span className="text-sm">{tab.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
