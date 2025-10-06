"use client";

import React from "react";
import Link from "next/link";

import { FileText } from "lucide-react";

import pathsConfig from "@/config/paths.config";

import { DocumentStatus, getDocumentStatusConfig } from "@/lib/constants";

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

export default function AttendanceReportsTabContent({
  reports,
}: {
  reports?: {
    id: string;
    created_at: string;
    start_date: string;
    end_date: string;
    period_total: number;
    status: DocumentStatus;
    submitted_at: string | null;
  }[];
}) {
  if (!reports || reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="text-muted-foreground mb-2 text-lg font-medium">
          No Attendance Reports
        </h3>
        <p className="text-muted-foreground max-w-md text-sm">
          {`This trainee hasn't submitted any attendance reports yet, or no
          attendance reports have been approved yet.`}
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-none">
          <TableHead className="bg-muted h-8 border-t border-b border-none px-3 text-xs font-semibold first:rounded-l-xl first:border-l last:rounded-r-xl last:border-r">
            Period
          </TableHead>
          <TableHead className="bg-muted h-8 border-t border-b border-none px-3 text-xs font-semibold first:rounded-l-xl first:border-l last:rounded-r-xl last:border-r">
            Submitted Date
          </TableHead>
          <TableHead className="bg-muted h-8 border-t border-b border-none px-3 text-xs font-semibold first:rounded-l-xl first:border-l last:rounded-r-xl last:border-r">
            Total Hours
          </TableHead>
          <TableHead className="bg-muted h-8 border-t border-b border-none px-3 text-xs font-semibold first:rounded-l-xl first:border-l last:rounded-r-xl last:border-r">
            Status
          </TableHead>
          <TableHead className="bg-muted h-8 border-t border-b border-none px-3 text-xs font-semibold first:rounded-l-xl first:border-l last:rounded-r-xl last:border-r"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => {
          const status = getDocumentStatusConfig(report.status);

          return (
            <TableRow key={report.id}>
              <TableCell className="h-10 overflow-hidden border-b px-3 py-2 text-sm text-ellipsis">
                {`${safeFormatDate(report.start_date, "PP")} - ${safeFormatDate(report.end_date, "PP")}`}
              </TableCell>
              <TableCell className="h-10 overflow-hidden border-b px-3 py-2 text-sm text-ellipsis">
                {report.submitted_at
                  ? safeFormatDate(report.submitted_at, "PP")
                  : "-"}
              </TableCell>
              <TableCell className="h-10 overflow-hidden border-b px-3 py-2 text-sm text-ellipsis">
                {`${report.period_total} ${report.period_total === 1 ? " Hour" : " Hours"}`}
              </TableCell>
              <TableCell className="h-10 overflow-hidden border-b px-3 py-2 text-sm text-ellipsis">
                <div className="flex items-center gap-2">
                  {status.icon && <status.icon className="size-4" />}
                  {status.label}
                </div>
              </TableCell>
              <TableCell className="h-10 overflow-hidden border-b px-3 py-2 text-sm text-ellipsis">
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
