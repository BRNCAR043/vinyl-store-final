"use client";

// Customer report wrapper: places the customer analytics view behind admin
// protection. The actual rendering is handled by `CustomerReportPage`.
import React from "react";
import AdminGuard from "../../../../components/ui/AdminGuard";
import CustomerReportPage from "../../../../components/admin/reports/CustomerReportPage";

export default function CustomerReportRoute() {
  return (
    <AdminGuard>
      <CustomerReportPage />
    </AdminGuard>
  );
}
