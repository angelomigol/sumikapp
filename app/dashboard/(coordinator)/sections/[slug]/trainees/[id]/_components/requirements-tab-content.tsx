import React from "react";

import { Download, FileText } from "lucide-react";

import { RequirementWithHistory } from "@/hooks/use-batch-requirements";

import { getDocumentStatusConfig } from "@/lib/constants";

import { safeFormatDate } from "@/utils/shared";

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

interface RequirementsTabContentProps {
  requirements?: RequirementWithHistory[];
}

export default function RequirementsTabContent({
  requirements,
}: RequirementsTabContentProps) {
  if (!requirements || requirements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="text-muted-foreground mb-2 text-lg font-medium">
          No Requirements Found
        </h3>
        <p className="text-muted-foreground max-w-md text-sm">
          This trainee hasn&#39;t submitted any requirements yet, or no
          requirements have been assigned to their program batch.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-none">
          <TableHead className="bg-muted h-8 border-t border-b border-none px-3 text-xs font-semibold first:rounded-l-xl first:border-l last:rounded-r-xl last:border-r">
            Name
          </TableHead>
          <TableHead className="bg-muted h-8 border-t border-b border-none px-3 text-xs font-semibold first:rounded-l-xl first:border-l last:rounded-r-xl last:border-r">
            Submitted Date
          </TableHead>
          <TableHead className="bg-muted h-8 border-t border-b border-none px-3 text-xs font-semibold first:rounded-l-xl first:border-l last:rounded-r-xl last:border-r">
            File Details
          </TableHead>
          <TableHead className="bg-muted h-8 border-t border-b border-none px-3 text-xs font-semibold first:rounded-l-xl first:border-l last:rounded-r-xl last:border-r">
            Status
          </TableHead>
          <TableHead className="bg-muted h-8 border-t border-b border-none px-3 text-xs font-semibold first:rounded-l-xl first:border-l last:rounded-r-xl last:border-r"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requirements.map((requirement) => {
          const status = getDocumentStatusConfig(requirement.status);

          return (
            <TableRow key={requirement.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {requirement.requirement_name}
                  </div>
                  {requirement.requirement_description && (
                    <div className="text-muted-foreground line-clamp-2 text-xs">
                      {requirement.requirement_description}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm">
                  {safeFormatDate(requirement.submitted_at, "PP")}
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  <span
                    className="block max-w-[200px] truncate text-sm font-medium"
                    title={requirement.file_name}
                  >
                    {requirement.file_name}
                  </span>
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <span className="uppercase">{requirement.file_type}</span>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant={"outline"} className="text-muted-foreground">
                  {status.icon && (
                    <status.icon
                      className={`${status.label === "pending" ? "" : status.textColor}`}
                    />
                  )}
                  {status.label}
                </Badge>
              </TableCell>

              <TableCell>
                <Button
                  size={"sm"}
                  variant={"ghost"}
                  className="size-8 p-0"
                  onClick={() => {
                    window.open(requirement.file_path, "_blank");
                  }}
                >
                  <Download className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
