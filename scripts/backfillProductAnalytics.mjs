// scripts/backfillProductAnalytics.mjs
//
// One-time script to rebuild totalSold and totalRevenue from existing orders.
// Sets totalViews to 0 for any product that doesn't have it yet.
//
// Usage:  node scripts/backfillProductAnalytics.mjs
//
// Uses the Firebase Admin SDK (service account credentials from .env.local).

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "❌ Missing Firebase Admin credentials. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in .env.local"
  );
  process.exit(1);
}

const app = initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});
const db = getFirestore(app);

async function backfillProductAnalyticsFields() {
  console.log("🔄 Starting analytics backfill from existing orders…");

  // ── 1. Aggregate totals from all orders ──────────────────────────────
  const ordersSnap = await db.collectionGroup("orders").get();
  console.log(`   Found ${ordersSnap.size} order document(s).`);

  // Map: productId → { totalSold, totalRevenue }
  const analytics = {};

  ordersSnap.forEach((orderDoc) => {
    const data = orderDoc.data();
    // Skip cancelled orders
    if (data.status === "cancelled") return;

    const items = data.items;
    if (!Array.isArray(items)) return;

    for (const item of items) {
      const pid = item.vinylId || item.productId;
      if (!pid) continue;

      if (!analytics[pid]) {
        analytics[pid] = { totalSold: 0, totalRevenue: 0 };
      }

      const qty = typeof item.quantity === "number" ? item.quantity : 0;
      const lineTotal =
        typeof item.lineTotal === "number"
          ? item.lineTotal
          : (typeof item.unitPrice === "number" ? item.unitPrice : 0) * qty;

      analytics[pid].totalSold += qty;
      analytics[pid].totalRevenue += lineTotal;
    }
  });

  const productIds = Object.keys(analytics);
  console.log(`   Aggregated analytics for ${productIds.length} product(s) from orders.`);

  // ── 2. Fetch all products so we can also default totalViews ──────────
  const productsSnap = await db.collection("vinyls").get();
  console.log(`   Found ${productsSnap.size} product(s) in the vinyls collection.`);

  let updated = 0;
  let errors = 0;

  for (const productDoc of productsSnap.docs) {
    const pid = productDoc.id;
    const existing = productDoc.data();

    const aggregate = analytics[pid] || { totalSold: 0, totalRevenue: 0 };

    const patch = {
      totalSold: aggregate.totalSold,
      totalRevenue: Math.round(aggregate.totalRevenue * 100) / 100, // avoid float drift
      totalViews: typeof existing.totalViews === "number" ? existing.totalViews : 0,
    };

    try {
      await db.collection("vinyls").doc(pid).update(patch);
      updated++;
      console.log(
        `   ✅ ${pid} → sold=${patch.totalSold}, revenue=R${patch.totalRevenue.toFixed(2)}, views=${patch.totalViews}`
      );
    } catch (err) {
      errors++;
      console.error(`   ❌ Failed to update ${pid}:`, err.message || err);
    }
  }

  console.log(`\n🏁 Backfill complete: ${updated} updated, ${errors} error(s).`);
}

backfillProductAnalyticsFields().catch((err) => {
  console.error("Fatal error during backfill:", err);
  process.exit(1);
});
