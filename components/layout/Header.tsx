// components/common/Header.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import type { AuthUser } from "../../lib/auth";
import { useAuthModal } from "../ui/AuthModal";
import { useAuthContext } from "../../lib/AuthContext";
import useCart from "../../lib/useCart";
import CartDrawer from "../ui/CartDrawer";

export default function Header() {
  const [query, setQuery] = useState("");
  const { open } = useAuthModal();
  const { user, signOut, isAdmin } = useAuthContext();
  const { items } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
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

  return (
    <header className="sticky top-0 z-50 bg-[#8a3b42] border-b border-black/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 md:h-28">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="Home" className="flex items-center logo-link">
              <Image
                src="/logo.png"
                alt="Logo"
                width={96}
                height={96}
                priority
                className="object-contain transition-transform"
              />
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
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center px-4 py-1 rounded-full bg-[#f6efe6] text-[#5a1518] text-sm font-semibold transition-transform hover:scale-[1.02] hover:brightness-95"
                >
                  Admin
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin/reports/financial"
                  className="inline-flex items-center px-4 py-1 rounded-full bg-[#f6efe6] text-[#5a1518] text-sm font-semibold transition-transform hover:scale-[1.02] hover:brightness-95"
                >
                  Reports
                </Link>
              )}
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={navAccountOpen}
                  aria-haspopup="menu"
                  onClick={() => setNavAccountOpen((s) => !s)}
                  onMouseEnter={() => {
                    cancelNavClose();
                    setNavAccountOpen(true);
                  }}
                  className="inline-flex items-center px-4 py-1 rounded-full bg-[#f6efe6] text-[#5a1518] text-sm font-semibold transition-transform hover:scale-[1.02] hover:brightness-95"
                >
                  Account
                </button>
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
