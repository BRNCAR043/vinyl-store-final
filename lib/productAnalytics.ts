// lib/productAnalytics.ts
// Client-side helpers that delegate analytics writes to a server API route.
// The API route uses the Firebase Admin SDK, so regular users don't need
// write access to the `vinyls` collection.
import { auth } from "./firebase";

export type AnalyticsOrderItem = {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
};

/** Get the current user's ID token for the API call. */
async function getToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
}

/**
 * Increment totalSold and totalRevenue for each product after an order is placed.
 * Delegates to /api/product-analytics so the write uses the admin SDK.
 */
export async function updateProductAnalyticsAfterOrder(
  items: AnalyticsOrderItem[]
): Promise<void> {
  if (!items || items.length === 0) return;

  try {
    const token = await getToken();
    if (!token) {
      console.warn("[productAnalytics] No auth token — skipping order analytics update");
      return;
    }
    const res = await fetch("/api/product-analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "order", items }),
    });
    if (!res.ok) {
      console.error("[productAnalytics] API error:", res.status, await res.text());
    }
  } catch (error) {
    console.error("[productAnalytics] Failed to update analytics after order:", error);
  }
}

/**
 * Increment totalViews by 1 for a single product.
 * Delegates to /api/product-analytics so the write uses the admin SDK.
 */
export async function incrementProductView(productId: string): Promise<void> {
  if (!productId) return;

  try {
    const token = await getToken();
    if (!token) {
      console.warn("[productAnalytics] No auth token — skipping view increment");
      return;
    }
    const res = await fetch("/api/product-analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "view", productId }),
    });
    if (!res.ok) {
      console.error("[productAnalytics] API error:", res.status, await res.text());
    }
  } catch (error) {
    console.error("[productAnalytics] Failed to increment view for", productId, error);
  }
}
