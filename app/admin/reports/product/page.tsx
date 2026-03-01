"use client";

// Report route wrapper: protects the report UI behind `AdminGuard` so only
// authorized users can access reporting pages. The heavy lifting is done in
// the shared `ProductReportPage` component.
import React from "react";
import AdminGuard from "../../../../components/ui/AdminGuard";
import ProductReportPage from "../../../../components/admin/reports/ProductReportPage";

export default function ProductReportRoute() {
  return (
    <AdminGuard>
      <ProductReportPage />
    </AdminGuard>
  );
}
