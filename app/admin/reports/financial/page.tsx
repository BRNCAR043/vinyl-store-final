"use client";

// Financial report wrapper: ensures only admins can view financial dashboards
// by placing the actual `FinancialReportPage` component behind `AdminGuard`.
import React from "react";
import AdminGuard from "../../../../components/ui/AdminGuard";
import FinancialReportPage from "../../../../components/admin/reports/FinancialReportPage";

export default function FinancialReportRoute() {
  return (
    <AdminGuard>
      <FinancialReportPage />
    </AdminGuard>
  );
}
