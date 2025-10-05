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

export default function AccomplishmentReportsTabContent({
  reports,
}: {
  reports?: {
    id: string;
    created_at: string;
    start_date: string;
    end_date: string;
    total_hours: number;
    status: DocumentStatus;
    submitted_at: string | null;
  }[];
}) {
  if (!reports || reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="text-muted-foreground mb-2 text-lg font-medium">
          No Accomplishment Reports
        </h3>
        <p className="text-muted-foreground max-w-md text-sm">
          This trainee hasn't submitted any accomplishment reports yet, or no
          accomplishment reports have been approved yet.
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
              <TableCell className="min-w-[150px]">
                {`${safeFormatDate(report.start_date, "PP")} - ${safeFormatDate(report.end_date, "PP")}`}
              </TableCell>
              <TableCell>
                {report.submitted_at
                  ? safeFormatDate(report.submitted_at, "PP")
                  : "-"}
              </TableCell>
              <TableCell>
                {`${report.total_hours} ${report.total_hours === 1 ? " Hour" : " Hours"}`}
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
                      "accomplishment"
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
