"use client";

import React from "react";
import Link from "next/link";

import pathsConfig from "@/config/paths.config";
import { NormalizedAttendanceReport } from "@/hooks/use-attendance-reports";

import { getDocumentStatusConfig } from "@/lib/constants";

import { safeFormatDate } from "@/utils/shared";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AttendanceTabContent({
  reports,
}: {
  reports: NormalizedAttendanceReport[];
}) {
  return (
    <Table className="max-h-[100px]">
      <TableHeader>
        <TableRow>
          <TableHead>Period</TableHead>
          <TableHead>Submitted Date</TableHead>
          <TableHead>Total Hours</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => {
          const status = getDocumentStatusConfig(report.status);

          return (
            <TableRow key={report.id}>
              <TableCell className="min-w-[150px]">
                {`${safeFormatDate(report.start_date, "PP")} - ${safeFormatDate(report.end_date, "PP")}`}
              </TableCell>
              <TableCell>
                {report.submitted_at
                  ? safeFormatDate(report.submitted_at, "PP")
                  : "-"}
              </TableCell>
              <TableCell>
                {`${report.period_total} ${report.period_total === 1 ? " Hour" : " Hours"}`}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {status.icon && <status.icon className="size-4" />}
                  {status.label}
                </div>
              </TableCell>
              <TableCell>
                <Button size={"sm"} variant={"outline"} asChild>
                  <Link
                    href={pathsConfig.dynamic.reviewReport(
                      report.id,
                      "attendance"
                    )}
                  >
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
