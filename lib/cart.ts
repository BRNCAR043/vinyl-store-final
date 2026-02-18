import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export type CartItem = {
  vinylId: string;
  quantity: number;
};

const cartDoc = (uid: string) => doc(db, "carts", uid);

export async function getCart(uid: string): Promise<CartItem[]> {
  if (!uid) return [];
  const ref = cartDoc(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  const data = snap.data() as { items?: CartItem[] };
  return data.items ?? [];
}

export async function setCart(uid: string, items: CartItem[]): Promise<void> {
  if (!uid) throw new Error("AUTH_REQUIRED");
  const ref = cartDoc(uid);
  await setDoc(ref, { items });
}

export async function addItem(uid: string, item: CartItem): Promise<void> {
  if (!uid) throw new Error("AUTH_REQUIRED");
  const items = await getCart(uid);
  const idx = items.findIndex((i) => i.vinylId === item.vinylId);
  if (idx >= 0) {
    items[idx].quantity += item.quantity;
  } else {
    items.push(item);
  }
  await setCart(uid, items);
}

export async function removeItem(uid: string, vinylId: string): Promise<void> {
  if (!uid) throw new Error("AUTH_REQUIRED");
  const items = await getCart(uid);
  const next = items.filter((i) => i.vinylId !== vinylId);
  await setCart(uid, next);
}

export async function updateQuantity(uid: string, vinylId: string, quantity: number): Promise<void> {
  if (!uid) throw new Error("AUTH_REQUIRED");
  const items = await getCart(uid);
  const idx = items.findIndex((i) => i.vinylId === vinylId);
  if (idx >= 0) {
    if (quantity <= 0) {
      items.splice(idx, 1);
    } else {
      items[idx].quantity = quantity;
    }
    await setCart(uid, items);
  }
}

export async function mergeGuestCart(uid: string, guestItems: CartItem[]): Promise<void> {
  if (!uid) throw new Error("AUTH_REQUIRED");
  const existing = await getCart(uid);
  const map = new Map<string, number>();
  existing.forEach((i) => map.set(i.vinylId, i.quantity));
  guestItems.forEach((g) => {
    const prev = map.get(g.vinylId) ?? 0;
    map.set(g.vinylId, prev + g.quantity);
  });
  const merged: CartItem[] = Array.from(map.entries()).map(([vinylId, quantity]) => ({ vinylId, quantity }));
  await setCart(uid, merged);
}

export default { getCart, setCart, addItem, removeItem, updateQuantity, mergeGuestCart };
