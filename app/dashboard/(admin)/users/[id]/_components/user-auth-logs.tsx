"use client";

import React from "react";

import { DataTable } from "@/components/data-table";

import { authLogsColumns } from "./auth-logs-columns";

export default function UserAuthLogs() {
  return (
    <>
      <DataTable data={[]} columns={authLogsColumns} />
    </>
  );
}
