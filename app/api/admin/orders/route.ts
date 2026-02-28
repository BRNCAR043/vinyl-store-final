import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminApp } from "../../../../lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    console.error("[admin/orders] No Bearer token in Authorization header");
    return false;
  }

  const token = authHeader.split("Bearer ")[1];
  if (!token) {
    console.error("[admin/orders] Empty token");
    return false;
  }

  try {
    const adminApp = getAdminApp();
    const db = getAdminDb();
    const decoded = await getAuth(adminApp).verifyIdToken(token);
    console.log("[admin/orders] Token verified for uid:", decoded.uid);

    const userDoc = await db.collection("users").doc(decoded.uid).get();

    if (!userDoc.exists) {
      console.error("[admin/orders] User doc not found for uid:", decoded.uid);
      return false;
    }

    const data = userDoc.data();
    console.log("[admin/orders] User data fields:", JSON.stringify({ role: data?.role, isAdmin: data?.isAdmin }));

    const isAdmin = data?.role === "admin" || data?.isAdmin === true;
    if (!isAdmin) {
      console.error("[admin/orders] User is NOT admin");
    }
    return isAdmin;
  } catch (err) {
    console.error("[admin/orders] verifyAdmin error:", err);
    return false;
  }
}

export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const db = getAdminDb();

    // Build a vinyl cost lookup from the vinyls collection
    const vinylSnapshot = await db.collection("vinyls").get();
    const vinylCostMap = new Map<string, number>();
    vinylSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      vinylCostMap.set(doc.id, data.cost ?? 0);
    });

    const snapshot = await db.collectionGroup("orders").get();

    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      const totalAmount = data.totalAmount ?? data.total ?? 0;

      // Use stored totalCost if available; otherwise compute from item costs
      let totalCost = data.totalCost ?? 0;
      if (!data.totalCost && Array.isArray(data.items)) {
        totalCost = data.items.reduce((sum: number, item: any) => {
          const cost = item.lineCost ?? item.unitCost
            ? (item.unitCost ?? 0) * (item.quantity ?? 1)
            : (vinylCostMap.get(item.vinylId) ?? 0) * (item.quantity ?? 1);
          return sum + cost;
        }, 0);
      }

      const totalProfit = data.totalProfit ?? (totalAmount - totalCost);

      return {
        createdAt: data.createdAt?._seconds
          ? { seconds: data.createdAt._seconds }
          : data.createdAt?.seconds
          ? { seconds: data.createdAt.seconds }
          : null,
        totalAmount,
        totalCost,
        totalProfit,
      };
    });

    return NextResponse.json({ orders });
  } catch (err: unknown) {
    console.error("Failed to fetch orders:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
