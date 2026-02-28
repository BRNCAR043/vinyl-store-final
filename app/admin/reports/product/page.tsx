"use client";

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
