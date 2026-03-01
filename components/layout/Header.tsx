// components/common/Header.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import type { AuthUser } from "../../lib/auth";
import { useAuthModal } from "../ui/AuthModal";
import { useAuthContext } from "../../lib/AuthContext";
import useCart from "../../lib/useCart";
import CartDrawer from "../ui/CartDrawer";
import { getAllVinyls } from "../../lib/firestoreVinyls";
import type { Vinyl } from "../../types/vinyl";

export default function Header() {
  const [query, setQuery] = useState("");
  const { open } = useAuthModal();
  const { user, signOut, isAdmin } = useAuthContext();
  const { items } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // --- live search state ---
  const [allVinyls, setAllVinyls] = useState<Vinyl[]>([]);
  const [searchResults, setSearchResults] = useState<Vinyl[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch vinyls once on mount for client-side filtering
  useEffect(() => {
    getAllVinyls().then(setAllVinyls).catch(console.error);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        searchRef.current && !searchRef.current.contains(e.target as Node) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node) && !mobileSearchRef.current) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // Debounced search filter
  const handleSearchChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!value.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }
      debounceRef.current = setTimeout(() => {
        const q = value.toLowerCase();
        const matches = allVinyls.filter(
          (v) =>
            v.albumName?.toLowerCase().includes(q) ||
            v.artist?.toLowerCase().includes(q)
        );
        setSearchResults(matches.slice(0, 8));
        setShowDropdown(matches.length > 0);
      }, 200);
    },
    [allVinyls]
  );

  useEffect(() => {
    function onCartOpen() {
      setCartOpen(true);
    }
    window.addEventListener("cart:open", onCartOpen as EventListener);
    return () => window.removeEventListener("cart:open", onCartOpen as EventListener);
  }, []);

  const totalCount = items.reduce((s, i) => s + i.quantity, 0);
  const [navAccountOpen, setNavAccountOpen] = useState(false);
  const navCloseTimeout = useRef<number | null>(null);

  const scheduleNavClose = (delay = 200) => {
    if (navCloseTimeout.current) window.clearTimeout(navCloseTimeout.current);
    navCloseTimeout.current = window.setTimeout(() => setNavAccountOpen(false), delay);
  };
  const cancelNavClose = () => {
    if (navCloseTimeout.current) {
      window.clearTimeout(navCloseTimeout.current);
      navCloseTimeout.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (navCloseTimeout.current) window.clearTimeout(navCloseTimeout.current);
    };
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-[#8a3b42] border-b border-black/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-28">
          {/* Left: Hamburger (mobile) + Logo + Navigation (desktop) */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Hamburger button - mobile only */}
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded text-[#f6efe6] hover:bg-[#a94a56] transition-colors"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <Link href="/" aria-label="Home" className="flex items-center logo-link">
              <Image
                src="/logo.png"
                alt="Logo"
                width={96}
                height={96}
                priority
                className="object-contain transition-transform w-12 h-12 md:w-24 md:h-24"
              />
            </Link>

            {/* Desktop navigation */}
            <nav aria-label="Primary" className="hidden md:flex items-center gap-4 ml-6">
              <Link href="/" className="inline-flex items-center px-4 py-1 rounded-full bg-[#f6efe6] text-[#5a1518] text-sm font-semibold transition-transform hover:scale-[1.02] hover:brightness-95">Home</Link>
              <Link href="/vinyl" className="inline-flex items-center px-4 py-1 rounded-full bg-[#f6efe6] text-[#5a1518] text-sm font-semibold transition-transform hover:scale-[1.02] hover:brightness-95">Vinyls</Link>
              <Link href="/about" className="inline-flex items-center px-4 py-1 rounded-full bg-[#f6efe6] text-[#5a1518] text-sm font-semibold transition-transform hover:scale-[1.02] hover:brightness-95">About</Link>
              {isAdmin && (
                <Link href="/admin" className="inline-flex items-center px-4 py-1 rounded-full bg-[#f6efe6] text-[#5a1518] text-sm font-semibold transition-transform hover:scale-[1.02] hover:brightness-95">Admin</Link>
              )}
              {isAdmin && (
                <Link href="/admin/reports/financial" className="inline-flex items-center px-4 py-1 rounded-full bg-[#f6efe6] text-[#5a1518] text-sm font-semibold transition-transform hover:scale-[1.02] hover:brightness-95">Reports</Link>
              )}
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={navAccountOpen}
                  aria-haspopup="menu"
                  onClick={() => setNavAccountOpen((s) => !s)}
                  onMouseEnter={() => { cancelNavClose(); setNavAccountOpen(true); }}
                  className="inline-flex items-center px-4 py-1 rounded-full bg-[#f6efe6] text-[#5a1518] text-sm font-semibold transition-transform hover:scale-[1.02] hover:brightness-95"
                >Account</button>
                <div
                  className={`${navAccountOpen ? "" : "hidden"} absolute left-0 mt-2 w-44 bg-[#f6efe6] text-[#5a1518] rounded shadow-lg p-2 z-20`}
                  onMouseEnter={() => cancelNavClose()}
                  onMouseLeave={() => scheduleNavClose()}
                >
                  <Link href="/account" onClick={() => setNavAccountOpen(false)} className="block px-3 py-2 text-sm hover:bg-[#f0e6d9] rounded">My account</Link>
                  <Link href="/account?tab=orders" onClick={() => setNavAccountOpen(false)} className="block px-3 py-2 text-sm hover:bg-[#f0e6d9] rounded">My orders</Link>
                  <Link href="/account?tab=wishlist" onClick={() => setNavAccountOpen(false)} className="block px-3 py-2 text-sm hover:bg-[#f0e6d9] rounded">My wishlist</Link>
                </div>
              </div>
            </nav>
          </div>

          {/* Right: Search + Help + Account + Cart */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Mobile search toggle */}
            <button
              type="button"
              aria-label="Search"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden inline-flex items-center justify-center p-0 h-9 w-9 rounded-full bg-[#f6efe6] text-[#5a1518] transition hover:scale-[1.02] leading-none"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
              </svg>
            </button>

            {/* Desktop search */}
            <div ref={searchRef} className="relative hidden md:block">
              <form role="search" className="flex items-center" onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="site-search" className="sr-only">Search records</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-[#5a1518]" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                    </svg>
                  </span>
                  <input
                    id="site-search"
                    value={query}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                    placeholder="Search records..."
                    className="w-48 pl-10 pr-3 py-2 rounded-full bg-[#f6efe6] text-[#0b0b0b] text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7b0017]/40"
                    aria-label="Search records"
                    autoComplete="off"
                  />
                </div>
              </form>

              {/* Desktop search results dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-[#f6efe6] rounded-lg shadow-xl border border-black/10 overflow-hidden z-50">
                  {searchResults.map((v) => (
                    <Link
                      key={v.id}
                      href={`/vinyl/${v.id}`}
                      onClick={() => { setShowDropdown(false); setQuery(""); }}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-[#f0e6d9] transition-colors"
                    >
                      {v.imageUrl ? (
                        <Image src={v.imageUrl} alt={v.albumName} width={40} height={40} className="rounded object-cover w-10 h-10 flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-[#d4c5b2] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-[#5a1518]/40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 3a2 2 0 11-2 2 2 2 0 012-2z"/></svg>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#5a1518] truncate">{v.albumName}</div>
                        <div className="text-xs text-gray-600 truncate">{v.artist}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/about" aria-label="Help" className="hidden sm:inline-flex items-center justify-center p-0 h-9 w-9 rounded-full bg-[#f6efe6] text-[#5a1518] transition hover:scale-[1.02] leading-none">
              <span className="text-sm font-semibold leading-none">?</span>
            </Link>

            <div className="relative">
              {user ? (
                <UserMenu signOut={signOut} user={user} />
              ) : (
                <button
                  aria-label="Account"
                  type="button"
                  onClick={() => open()}
                  className="inline-flex items-center justify-center p-0 h-9 w-9 rounded-full bg-[#f6efe6] text-[#5a1518] transition hover:scale-[1.02] leading-none"
                >
                  <svg className="h-4 w-4 block" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
                    <path stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" d="M4 20a8 8 0 0116 0" />
                  </svg>
                </button>
              )}
            </div>

            <button
              aria-label="Cart"
              onClick={() => setCartOpen(true)}
              className="relative inline-flex items-center justify-center p-0 h-9 w-9 rounded-full bg-[#f6efe6] text-[#5a1518] transition hover:scale-[1.02] leading-none"
            >
              <svg className="h-4 w-4 block" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l3-8H6.4" />
                <circle cx="9" cy="20" r="1" fill="currentColor" />
                <circle cx="18" cy="20" r="1" fill="currentColor" />
              </svg>
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-[#5a1518] rounded-full text-xs w-5 h-5 flex items-center justify-center">{totalCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search bar - slides down below header */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-[#8a3b42] border-t border-black/10 px-4 pb-3">
          <div ref={mobileSearchRef} className="relative">
            <form role="search" className="flex items-center" onSubmit={(e) => e.preventDefault()}>
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-[#5a1518]" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                  </svg>
                </span>
                <input
                  value={query}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                  placeholder="Search records..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-full bg-[#f6efe6] text-[#0b0b0b] text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7b0017]/40"
                  aria-label="Search records"
                  autoComplete="off"
                  autoFocus
                />
              </div>
            </form>

            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#f6efe6] rounded-lg shadow-xl border border-black/10 overflow-hidden z-50">
                {searchResults.map((v) => (
                  <Link
                    key={v.id}
                    href={`/vinyl/${v.id}`}
                    onClick={() => { setShowDropdown(false); setQuery(""); setMobileSearchOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-[#f0e6d9] transition-colors"
                  >
                    {v.imageUrl ? (
                      <Image src={v.imageUrl} alt={v.albumName} width={40} height={40} className="rounded object-cover w-10 h-10 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-[#d4c5b2] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-[#5a1518]/40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 3a2 2 0 11-2 2 2 2 0 012-2z"/></svg>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#5a1518] truncate">{v.albumName}</div>
                      <div className="text-xs text-gray-600 truncate">{v.artist}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ top: "64px" }}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={closeMobileMenu} />

          {/* Slide-in menu */}
          <nav
            aria-label="Mobile navigation"
            className="relative w-72 max-w-[80vw] h-full bg-[#8a3b42] shadow-xl overflow-y-auto"
          >
            <div className="p-5 space-y-1">
              {user && (
                <div className="flex items-center gap-3 pb-4 mb-3 border-b border-white/20">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold text-white">
                    {(user.displayName ?? user.email ?? "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm text-white font-semibold">{user.displayName ?? "User"}</div>
                    <div className="text-xs text-white/60 truncate max-w-[160px]">{user.email}</div>
                  </div>
                </div>
              )}

              <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>
                <span className="font-medium">Home</span>
              </Link>

              <Link href="/vinyl" onClick={closeMobileMenu} className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
                <span className="font-medium">Vinyls</span>
              </Link>

              <Link href="/about" onClick={closeMobileMenu} className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="font-medium">About</span>
              </Link>

              <div className="border-t border-white/20 my-3" />

              <Link href="/account" onClick={closeMobileMenu} className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="font-medium">My Account</span>
              </Link>

              <Link href="/account?tab=orders" onClick={closeMobileMenu} className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <span className="font-medium">My Orders</span>
              </Link>

              <Link href="/account?tab=wishlist" onClick={closeMobileMenu} className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                <span className="font-medium">My Wishlist</span>
              </Link>

              {isAdmin && (
                <>
                  <div className="border-t border-white/20 my-3" />
                  <Link href="/admin" onClick={closeMobileMenu} className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/10 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="font-medium">Admin</span>
                  </Link>
                  <Link href="/admin/reports/financial" onClick={closeMobileMenu} className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/10 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    <span className="font-medium">Reports</span>
                  </Link>
                </>
              )}

              {user && (
                <>
                  <div className="border-t border-white/20 my-3" />
                  <button
                    onClick={async () => { closeMobileMenu(); await signOut(); }}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/10 transition-colors w-full text-left"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              )}

              {!user && (
                <>
                  <div className="border-t border-white/20 my-3" />
                  <button
                    onClick={() => { closeMobileMenu(); open(); }}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/10 transition-colors w-full text-left"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                    <span className="font-medium">Sign In</span>
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}

function UserMenu({ user, signOut }: { user: AuthUser; signOut: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const userCloseTimeout = useRef<number | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    return () => {
      if (userCloseTimeout.current) window.clearTimeout(userCloseTimeout.current);
    };
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await signOut();
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Account"
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center justify-center p-0 h-9 w-9 rounded-full bg-[#f6efe6] text-[#5a1518] transition hover:scale-[1.02] leading-none"
      >
        <svg className="h-4 w-4 block" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
          <path stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" d="M4 20a8 8 0 0116 0" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 bg-[#f6efe6] text-[#5a1518] rounded shadow-lg p-3 z-10"
          onMouseEnter={() => {
            if (userCloseTimeout.current) {
              window.clearTimeout(userCloseTimeout.current);
              userCloseTimeout.current = null;
            }
            setOpen(true);
          }}
          onMouseLeave={() => {
            if (userCloseTimeout.current) window.clearTimeout(userCloseTimeout.current);
            userCloseTimeout.current = window.setTimeout(() => setOpen(false), 200);
          }}
        >
          <div className="text-sm font-semibold">{user.displayName ?? "Account"}</div>
          {user.email && <div className="text-xs text-gray-600 truncate">{user.email}</div>}
          <div className="mt-3 space-y-1">
            <Link href="/account" onClick={() => setOpen(false)} className="block px-2 py-1 text-sm hover:bg-[#f0e6d9] rounded">My account</Link>
            <Link href="/account?tab=orders" onClick={() => setOpen(false)} className="block px-2 py-1 text-sm hover:bg-[#f0e6d9] rounded">My orders</Link>
            <Link href="/account?tab=wishlist" onClick={() => setOpen(false)} className="block px-2 py-1 text-sm hover:bg-[#f0e6d9] rounded">My wishlist</Link>
          </div>
          <div className="mt-3">
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 rounded bg-[#5a1518] hover:bg-[#451014] text-white text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
