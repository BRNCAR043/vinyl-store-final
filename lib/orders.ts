import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  collectionGroup,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import type { CartItem } from "./cart";
import * as cartApi from "./cart";

export type OrderItem = {
  vinylId: string;
  title?: string;
  unitPrice: number;
  unitCost?: number;
  quantity: number;
  lineTotal: number;
  lineCost?: number;
};

export type OrderRecord = {
  id?: string;
  uid: string;
  items: OrderItem[];
  total: number;
  totalCost?: number;
  totalProfit?: number;
  paymentMethod?: string;
  delivery?: any;
  status: "pending" | "paid" | "fulfilled" | "cancelled";
  createdAt?: any;
};

// Orders are stored as a subcollection under users/{uid}/orders
const userOrdersCollection = (uid: string) => collection(db, "users", uid, "orders");

// Create an order for a user and clear their cart
export async function createOrder(uid: string, items: OrderItem[], total: number, paymentMethod?: string, delivery?: any): Promise<string | null> {
  if (!uid) throw new Error("AUTH_REQUIRED");

  // Ensure the Firebase Auth token is available for Firestore writes.
  // For brand-new users the Firestore SDK may not have the ID token yet;
  // forcing a getIdToken() call guarantees the token is propagated before
  // we attempt the first write.
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.warn("createOrder: auth.currentUser is null – user may not be fully signed in yet.");
    return null;
  }
  try {
    await currentUser.getIdToken(/* forceRefresh */ true);
  } catch (tokenErr) {
    console.warn("createOrder: failed to refresh auth token:", tokenErr);
  }

  // Ensure the user document exists so the subcollection write doesn't hit
  // timing issues with Firestore rules.  Uses merge so we never overwrite
  // existing profile data.
  try {
    const userDocRef = doc(db, "users", uid);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      await setDoc(userDocRef, {
        uid,
        createdAt: new Date().toISOString(),
        role: "user",
      });
    }
  } catch (e) {
    // Non-fatal – the order write may still succeed.
    console.warn("createOrder: could not ensure user doc exists:", e);
  }

  const totalCost = items.reduce((sum, item) => sum + (item.lineCost ?? 0), 0);
  const totalProfit = total - totalCost;

  const payload = {
    uid,
    items,
    total,
    totalCost,
    totalProfit,
    paymentMethod: paymentMethod ?? null,
    delivery: delivery ?? null,
    status: "paid",
    createdAt: serverTimestamp(),
  };

  // create a document ref under the user's orders subcollection to get a stable id
  const userOrderRef = doc(userOrdersCollection(uid));
  // write the user order (this should be allowed by your users/{uid}/orders rule)
  try {
    await setDoc(userOrderRef, payload);
  } catch (e) {
    // Don't let raw Firebase permission errors bubble to the console uncontrolled.
    // Log a concise message for debugging and return null to indicate failure.
    // eslint-disable-next-line no-console
    console.warn(`Failed to write order to users/${uid}/orders:`, e);
    return null;
  }

  // Try to write the same order id to the top-level `orders` collection.
  // Note: do NOT write to a top-level `/orders` collection from the client.
  // Keep orders only under `users/{uid}/orders/{orderId}` so Firestore rules
  // for per-user access remain strict and secure.

  // clear user's cart after successful user-order write
  // Wrap in try-catch so a cart-clear failure does NOT mask the successful order.
  try {
    await cartApi.setCart(uid, []);
  } catch (cartErr) {
    console.warn("createOrder: order saved but failed to clear cart:", cartErr);
  }

  // notify any client-side cart hooks to reload state
  try {
    if (typeof window !== "undefined" && (window as any).dispatchEvent) {
      (window as any).dispatchEvent(new CustomEvent("cart:updated"));
    }
  } catch (e) {
    // ignore
  }

  return userOrderRef.id;
}

export async function fetchAllOrders(): Promise<OrderRecord[]> {
  // fetch across all users' orders (collectionGroup)
  const snap = await getDocs(collectionGroup(db, "orders"));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as OrderRecord));
}

export async function fetchOrdersByUser(uid: string): Promise<OrderRecord[]> {
  if (!uid) throw new Error("AUTH_REQUIRED");
  const q = query(userOrdersCollection(uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as OrderRecord));
}

export default { createOrder, fetchAllOrders, fetchOrdersByUser };
