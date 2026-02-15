"use client";
import { useState } from "react";

export default function SearchBar() {
  const [q, setQ] = useState("");
  return (
    <div className="flex items-center bg-[#0b0808]/70 rounded-md px-3 py-2 border border-black/20">
      <svg className="w-5 h-5 text-gray-300 mr-2" viewBox="0 0 24 24" fill="none">
        <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
      </svg>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search records, artists..."
        className="bg-transparent outline-none placeholder:text-gray-400 text-sm text-white flex-1"
        aria-label="Search records"
      />
    </div>
  );
}
