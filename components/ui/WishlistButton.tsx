"use client";
import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../lib/AuthContext";
import { getWishlist, addToWishlist, removeFromWishlist, toggleWishlist } from "../../lib/wishlist";
import { useAuthModal } from "./AuthModal";

type Props = {
  vinylId: string;
};

export default function WishlistButton({ vinylId }: Props) {
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
    return () => {
      mounted = false;
    };
  }, [user, vinylId]);

  const handleClick = async () => {
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

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`px-3 py-1 rounded ${inWishlist ? "bg-red-600" : "bg-gray-700"}`}
      >
        {loading ? "…" : inWishlist ? "Remove ♥" : "Add ♡"}
      </button>
    </>
  );
}

