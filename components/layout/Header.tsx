// components/common/Header.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-[#8a3b42] border-b border-black/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 md:h-28">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="Home" className="flex items-center">
              <Image src="/logo.png" alt="Logo" width={96} height={96} priority className="object-contain" />
            </Link>

            <nav aria-label="Primary" className="hidden md:flex items-center gap-4 ml-6">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-1 rounded-full bg-[#f6efe6] text-[#5a1518] text-sm font-semibold transition-transform hover:scale-[1.02] hover:brightness-95"
              >
                Home
              </Link>
              <Link
                href="/vinyl"
                className="inline-flex items-center px-4 py-1 rounded-full bg-[#f6efe6] text-[#5a1518] text-sm font-semibold transition-transform hover:scale-[1.02] hover:brightness-95"
              >
                Vinyls
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-4 py-1 rounded-full bg-[#f6efe6] text-[#5a1518] text-sm font-semibold transition-transform hover:scale-[1.02] hover:brightness-95"
              >
                About
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center px-4 py-1 rounded-full bg-[#f6efe6] text-[#5a1518] text-sm font-semibold transition-transform hover:scale-[1.02] hover:brightness-95"
              >
                Admin
              </Link>
            </nav>
          </div>

          {/* Right: Search + Help + Account + Cart */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <form role="search" className="flex items-center">
              <label htmlFor="site-search" className="sr-only">
                Search records
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-[#5a1518]" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                  </svg>
                </span>
                <input
                  id="site-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search records…"
                  className="w-48 pl-10 pr-3 py-2 rounded-full bg-[#f6efe6] text-[#0b0b0b] text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7b0017]/40"
                  aria-label="Search records"
                />
              </div>
            </form>

            <button
              aria-label="Help"
              type="button"
              className="inline-flex items-center justify-center p-0 h-9 w-9 rounded-full bg-[#f6efe6] text-[#5a1518] transition hover:scale-[1.02] leading-none"
            >
              <span className="text-sm font-semibold leading-none">?</span>
            </button>

            <button
              aria-label="Account"
              type="button"
              className="inline-flex items-center justify-center p-0 h-9 w-9 rounded-full bg-[#f6efe6] text-[#5a1518] transition hover:scale-[1.02] leading-none"
            >
              <svg className="h-4 w-4 block" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
                <path stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" d="M4 20a8 8 0 0116 0" />
              </svg>
            </button>

            <Link
              href="/cart"
              aria-label="Cart"
              className="inline-flex items-center justify-center p-0 h-9 w-9 rounded-full bg-[#f6efe6] text-[#5a1518] transition hover:scale-[1.02] leading-none"
            >
              <svg className="h-4 w-4 block" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l3-8H6.4" />
                <circle cx="9" cy="20" r="1" fill="currentColor" />
                <circle cx="18" cy="20" r="1" fill="currentColor" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
