import {
  collection,
  collectionGroup,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  CustomerDoc,
  CustomerOrder,
  CustomerAggregated,
} from "../types/customer-report";

export async function fetchAllCustomers(): Promise<CustomerDoc[]> {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((doc) => {
    const d = doc.data();
    // Build name from firstName/lastName, fall back to displayName
    const first = d.firstName ?? "";
    const last = d.lastName ?? "";
    const fullName = `${first} ${last}`.trim() || d.displayName || "";
    // Country may live inside address object or at top level
    const country = d.address?.country ?? d.country ?? "";
    return {
      id: doc.id,
      name: fullName,
      email: d.email ?? "",
      country,
      age: typeof d.age === "number" ? d.age : null,
      gender: d.gender ?? "",
    };
  });
}

export async function fetchAllCustomerOrders(): Promise<CustomerOrder[]> {
  const snapshot = await getDocs(collectionGroup(db, "orders"));
  return snapshot.docs.map((doc) => {
    const d = doc.data();
    // Parent path is "users/{userId}/orders"
    const parentPath = doc.ref.parent.path;
    const parts = parentPath.split("/");
    const userId = parts[1] ?? "";
    return {
      userId,
      // Order docs store the grand total as "total", not "totalAmount"
      totalAmount: d.total ?? d.totalAmount ?? 0,
      totalCost: d.totalCost ?? 0,
      totalProfit: d.totalProfit ?? 0,
      createdAt: d.createdAt ?? null,
    };
  });
}

export function aggregateCustomerData(
  customers: CustomerDoc[],
  orders: CustomerOrder[]
): CustomerAggregated[] {
  const ordersByUser = new Map<
    string,
    { totalSpent: number; count: number; lastDate: Date | null }
  >();

  for (const order of orders) {
    const existing = ordersByUser.get(order.userId) || {
      totalSpent: 0,
      count: 0,
      lastDate: null as Date | null,
    };
    existing.totalSpent += order.totalAmount;
    existing.count += 1;

    if (order.createdAt?.seconds) {
      const date = new Date(order.createdAt.seconds * 1000);
      if (!existing.lastDate || date > existing.lastDate) {
        existing.lastDate = date;
      }
    }

    ordersByUser.set(order.userId, existing);
  }

  return customers.map((c) => {
    const stats = ordersByUser.get(c.id) || {
      totalSpent: 0,
      count: 0,
      lastDate: null,
    };
    return {
      ...c,
      totalOrders: stats.count,
      totalSpent: stats.totalSpent,
      averageOrderValue: stats.count === 0 ? 0 : stats.totalSpent / stats.count,
      lastPurchaseDate: stats.lastDate,
    };
  });
}
