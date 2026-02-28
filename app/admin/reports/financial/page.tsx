"use client";

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
