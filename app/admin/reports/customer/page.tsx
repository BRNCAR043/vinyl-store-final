"use client";

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
