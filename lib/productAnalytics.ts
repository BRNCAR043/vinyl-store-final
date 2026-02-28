// lib/productAnalytics.ts
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "./firebase";

export type AnalyticsOrderItem = {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
};

/**
 * Increment totalSold and totalRevenue for each product after an order is placed.
 * Fields default to 0 if they don't yet exist (Firestore increment handles this).
 */
export async function updateProductAnalyticsAfterOrder(
  items: AnalyticsOrderItem[]
): Promise<void> {
  if (!items || items.length === 0) return;

  const updates = items.map((item) => {
    const ref = doc(db, "vinyls", item.productId);
    return updateDoc(ref, {
      totalSold: increment(item.quantity),
      totalRevenue: increment(item.priceAtPurchase * item.quantity),
    });
  });

  try {
    await Promise.all(updates);
  } catch (error) {
    console.error("[productAnalytics] Failed to update analytics after order:", error);
  }
}

/**
 * Increment totalViews by 1 for a single product.
 * The field defaults to 0 if it doesn't yet exist.
 */
export async function incrementProductView(productId: string): Promise<void> {
  if (!productId) return;

  try {
    const ref = doc(db, "vinyls", productId);
    await updateDoc(ref, {
      totalViews: increment(1),
    });
  } catch (error) {
    console.error("[productAnalytics] Failed to increment view for", productId, error);
  }
}
