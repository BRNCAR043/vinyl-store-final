"use client";
import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../lib/AuthContext";
import { getWishlist, addToWishlist, removeFromWishlist, toggleWishlist } from "../../lib/wishlist";
import { useAuthModal } from "./AuthModal";

type Props = {
  vinylId: string;
};

export default function WishlistButton({ vinylId }: Props) {
  if (!vinylId) return null;
  const { user } = useAuthContext();
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const { open } = useAuthModal();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        if (user) {
          const items = await getWishlist(user.uid);
          if (!mounted) return;
          setInWishlist(items.includes(vinylId));
        } else {
          setInWishlist(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    // listen for external wishlist updates and reload
    function onExternalUpdate() {
      load();
    }
    window?.addEventListener?.("wishlist-updated", onExternalUpdate as EventListener);
    return () => {
      mounted = false;
      window?.removeEventListener?.("wishlist-updated", onExternalUpdate as EventListener);
    };
  }, [user, vinylId]);

  const handleClick = async (e?: React.MouseEvent) => {
    try { e?.stopPropagation(); } catch {}
    if (!user) {
      open();
      return;
    }

    setLoading(true);
    try {
      const res = await toggleWishlist(user.uid, vinylId);
      setInWishlist(res.added);
    } catch (err) {
      console.error("Wishlist toggle error", err);
    } finally {
      setLoading(false);
    }
  };

  const maroon = "#8a3b42";

  return (
    <button
      onClick={(e) => handleClick(e)}
      disabled={loading}
      aria-pressed={inWishlist}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      className="ml-3 inline-flex items-center justify-center rounded px-3 py-2 bg-[#ffeede] hover:opacity-95"
    >
      {loading ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="2" />
        </svg>
        ) : inWishlist ? (
        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21s-7.5-4.35-10-7.17C-0.43 10.76 2.5 6 6.5 6c2.24 0 3.5 1.5 5.5 3.5C13 7.5 14.27 6 16.5 6 20.5 6 23.43 10.76 22 13.83 19.5 16.65 12 21 12 21z" fill={maroon} />
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21s-7.5-4.35-10-7.17C-0.43 10.76 2.5 6 6.5 6c2.24 0 3.5 1.5 5.5 3.5C13 7.5 14.27 6 16.5 6 20.5 6 23.43 10.76 22 13.83 19.5 16.65 12 21 12 21z" stroke={maroon} strokeWidth={1.6} fill="none" />
        </svg>
      )}
    </button>
  );
}

