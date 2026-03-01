// Server-side route for product analytics updates.
// Uses the Firebase Admin SDK so writes bypass Firestore security rules —
// regular (non-admin) users can trigger analytics updates via this endpoint
// without needing write access to the `vinyls` collection.

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminApp } from "../../../lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";

// Verify the caller is an authenticated Firebase user (not necessarily admin).
async function verifyAuth(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.split("Bearer ")[1];
  if (!token) return null;
  try {
    const adminApp = getAdminApp();
    const decoded = await getAuth(adminApp).verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

// POST  /api/product-analytics
// Body: { action: "order", items: [{ productId, quantity, priceAtPurchase }] }
//    or { action: "view",  productId: string }
export async function POST(req: NextRequest) {
  const uid = await verifyAuth(req);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const db = getAdminDb();

  try {
    if (body.action === "order") {
      const items: { productId: string; quantity: number; priceAtPurchase: number }[] = body.items;
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: "items array required" }, { status: 400 });
      }
      const batch = db.batch();
      for (const item of items) {
        if (!item.productId) continue;
        const ref = db.collection("vinyls").doc(item.productId);
        batch.update(ref, {
          totalSold: FieldValue.increment(item.quantity ?? 0),
          totalRevenue: FieldValue.increment((item.priceAtPurchase ?? 0) * (item.quantity ?? 0)),
        });
      }
      await batch.commit();
      return NextResponse.json({ ok: true });
    }

    if (body.action === "view") {
      const { productId } = body;
      if (!productId) {
        return NextResponse.json({ error: "productId required" }, { status: 400 });
      }
      const ref = db.collection("vinyls").doc(productId);
      await ref.update({ totalViews: FieldValue.increment(1) });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("[product-analytics] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
