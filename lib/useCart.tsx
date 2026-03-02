//This is the react hook that stores the cart, 
// exposes helper functions and allows components to access cart

"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuthContext } from "./AuthContext";
import type { CartItem } from "./cart";
import * as cartApi from "./cart";

const LOCAL_KEY = "guest_cart_v1";

function readLocalCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch (err) {
    console.warn("readLocalCart error", err);
    return [];
  }
}

function writeLocalCart(items: CartItem[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("writeLocalCart error", err);
  }
}

export default function useCart() {
  const { user } = useAuthContext();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // load on mount and when user changes
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        if (user) {
          // when user logs in, merge any guest cart
          const guest = readLocalCart();
          if (guest.length > 0) {
            await cartApi.mergeGuestCart(user.uid, guest);
            // clear guest cart
            writeLocalCart([]);
          }
          const remote = await cartApi.getCart(user.uid);
          if (!mounted) return;
          console.debug("useCart: loaded remote cart", remote);
          setItems(remote);
        } else {
          // guest: load from localStorage
          const local = readLocalCart();
          if (!mounted) return;
          setItems(local);
        }
      } catch (err) {
        console.error("useCart load error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();

    // listen for external cart updates (other hook instances)
    function onExternalUpdate() {
      // simply reload from source
      load();
    }
    window.addEventListener("cart:updated", onExternalUpdate as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener("cart:updated", onExternalUpdate as EventListener);
    };
  }, [user]);

  const syncLocal = useCallback((next: CartItem[]) => {
    setItems(next);
    writeLocalCart(next);
  }, []);

  const add = useCallback(
    async (vinylId: string, quantity = 1) => {
      setLoading(true);
      try {
        if (user) {
          await cartApi.addItem(user.uid, { vinylId, quantity });
          const updated = await cartApi.getCart(user.uid);
          setItems(updated);
            // Open the cart drawer when an item is added
            try {
              window.dispatchEvent(new CustomEvent("cart:open", { detail: { vinylId } }));
              // notify other hook instances to reload
              window.dispatchEvent(new CustomEvent("cart:updated"));
              console.debug("useCart: dispatched cart:open and cart:updated for", vinylId);
            } catch (e) {
              // ignore in non-browser environments
            }
        } else {
          const cur = readLocalCart();
          const idx = cur.findIndex((c) => c.vinylId === vinylId);
          if (idx >= 0) cur[idx].quantity += quantity;
          else cur.push({ vinylId, quantity });
          syncLocal(cur);
            try {
              window.dispatchEvent(new CustomEvent("cart:open", { detail: { vinylId } }));
              window.dispatchEvent(new CustomEvent("cart:updated"));
              console.debug("useCart: dispatched cart:open and cart:updated (guest) for", vinylId);
            } catch (e) {
              /* ignore */
            }
        }
      } catch (err) {
        console.error("cart add error", err);
      } finally {
        setLoading(false);
      }
    },
    [user, syncLocal]
  );

  const remove = useCallback(
    async (vinylId: string) => {
      setLoading(true);
      try {
        if (user) {
          await cartApi.removeItem(user.uid, vinylId);
          const updated = await cartApi.getCart(user.uid);
          setItems(updated);
          try { window.dispatchEvent(new CustomEvent("cart:updated")); } catch {}
        } else {
          const cur = readLocalCart().filter((c) => c.vinylId !== vinylId);
          syncLocal(cur);
          try { window.dispatchEvent(new CustomEvent("cart:updated")); } catch {}
        }
      } catch (err) {
        console.error("cart remove error", err);
      } finally {
        setLoading(false);
      }
    },
    [user, syncLocal]
  );

  const update = useCallback(
    async (vinylId: string, quantity: number) => {
      setLoading(true);
      try {
        if (user) {
          await cartApi.updateQuantity(user.uid, vinylId, quantity);
          const updated = await cartApi.getCart(user.uid);
          setItems(updated);
          try { window.dispatchEvent(new CustomEvent("cart:updated")); } catch {}
        } else {
          const cur = readLocalCart();
          const idx = cur.findIndex((c) => c.vinylId === vinylId);
          if (idx >= 0) {
            if (quantity <= 0) cur.splice(idx, 1);
            else cur[idx].quantity = quantity;
          }
          syncLocal(cur);
          try { window.dispatchEvent(new CustomEvent("cart:updated")); } catch {}
        }
      } catch (err) {
        console.error("cart update error", err);
      } finally {
        setLoading(false);
      }
    },
    [user, syncLocal]
  );

  const clear = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        await cartApi.setCart(user.uid, []);
        setItems([]);
        try { window.dispatchEvent(new CustomEvent("cart:updated")); } catch {}
      } else {
        writeLocalCart([]);
        setItems([]);
        try { window.dispatchEvent(new CustomEvent("cart:updated")); } catch {}
      }
    } catch (err) {
      console.error("cart clear error", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    items,
    loading,
    add,
    remove,
    update,
    clear,
  } as const;
}
