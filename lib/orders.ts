import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { CartItem } from "./cart";
import * as cartApi from "./cart";

export type OrderItem = CartItem;

export type OrderRecord = {
  id?: string;
  uid: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "paid" | "fulfilled" | "cancelled";
  createdAt?: any;
};

const ordersCollection = () => collection(db, "orders");

export async function createOrder(uid: string, items: OrderItem[], total: number): Promise<string> {
  if (!uid) throw new Error("AUTH_REQUIRED");
  const payload = {
    uid,
    items,
    total,
    status: "pending",
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(ordersCollection(), payload);
  // clear user's cart after successful order
  await cartApi.setCart(uid, []);
  return ref.id;
}

export async function fetchAllOrders(): Promise<OrderRecord[]> {
  const snap = await getDocs(ordersCollection());
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as OrderRecord));
}

export async function fetchOrdersByUser(uid: string): Promise<OrderRecord[]> {
  if (!uid) throw new Error("AUTH_REQUIRED");
  const q = query(ordersCollection(), where("uid", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as OrderRecord));
}

export default { createOrder, fetchAllOrders, fetchOrdersByUser };
