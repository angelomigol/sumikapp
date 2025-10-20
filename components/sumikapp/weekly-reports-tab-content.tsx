"use client";

import React from "react";
import Link from "next/link";

import { IconEye } from "@tabler/icons-react";
import { FileText } from "lucide-react";

import pathsConfig from "@/config/paths.config";

import { DocumentStatus, getDocumentStatusConfig } from "@/lib/constants";

import { formatHoursDisplay, safeFormatDate } from "@/utils/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function WeeklyReportsTabContent({
  reports,
}: {
  reports?: {
    id: string;
    created_at: string;
    start_date: string;
    end_date: string | null;
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
          No Weekly Reports
        </h3>
        <p className="text-muted-foreground max-w-md text-sm">
          This trainee hasn&#39;t submitted any weekly reports yet, or no weekly
          reports have been approved yet.
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
          const startDate = report.start_date ?? "";
          const endDate = report.end_date ?? "";

          return (
            <TableRow key={report.id}>
              <TableCell className="h-10 overflow-hidden border-b px-3 py-2 text-sm text-ellipsis">
                {`${safeFormatDate(startDate, "PP")} - ${safeFormatDate(endDate, "PP")}`}
              </TableCell>
              <TableCell className="h-10 overflow-hidden border-b px-3 py-2 text-sm text-ellipsis">
                {report.submitted_at
                  ? safeFormatDate(report.submitted_at, "PP")
                  : "-"}
              </TableCell>
              <TableCell className="h-10 overflow-hidden border-b px-3 py-2 text-sm text-ellipsis">
                {formatHoursDisplay(report.period_total)}
              </TableCell>
              <TableCell className="h-10 overflow-hidden border-b px-3 py-2 text-sm text-ellipsis">
                <Badge variant={"outline"} className="text-muted-foreground">
                  {status.icon && (
                    <status.icon
                      className={`${status.label === "pending" ? "" : status.textColor}`}
                    />
                  )}
                  {status.label}
                </Badge>
              </TableCell>
              <TableCell className="h-10 overflow-hidden border-b px-3 py-2 text-sm text-ellipsis">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size={"sm"} variant={"outline"} asChild>
                      <Link href={pathsConfig.dynamic.weeklyReport(report.id)}>
                        <IconEye />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
