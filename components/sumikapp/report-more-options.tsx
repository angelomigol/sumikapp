"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  IconFileTypeDocx,
  IconFileTypePdf,
  IconTrash,
} from "@tabler/icons-react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { DocumentStatus } from "@/lib/constants";
import {
  exportAttendanceReportToDOCX,
  exportAttendanceReportToPDF,
} from "@/lib/exports/export-attendance-report";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import ConfirmationDialog from "./confirmation-dialog";
import { If } from "./if";

interface ReportMoreOptionsProps {
  id: string;
  status: DocumentStatus;
  deleteAction?: (formData: FormData) => Promise<{
    success: boolean;
    message: string;
  }>;
  redirectPath?: string;
  reportType?: "Attendance" | "Accomplishment";
  options?: {
    canDelete?: boolean;
  };

  exportData?: {
    internName?: string;
    companyName?: string;
    entries?: any[];
    previousTotal?: number;
    periodTotal?: number;
    startDate?: string;
    endDate?: string;
  };
}

export default function ReportMoreOptions({
  id,
  deleteAction,
  redirectPath,
  reportType,
  status,
  options = {},
  exportData,
}: ReportMoreOptionsProps) {
  const { canDelete = false } = options;
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText: string;
    variant: "default" | "destructive";
  } | null>(null);

  const openConfirmDialog = (config: typeof dialogConfig) => {
    setDialogConfig(config);
    setDialogOpen(true);
  };

  const isDeletableStatus = status === "not submitted" || status === "rejected";

  const handleDelete = () => {
    if (!deleteAction || !redirectPath) return;

    openConfirmDialog({
      title: `Delete ${reportType ?? "Weekly"} Report`,
      description: `Are you sure you want to delete this ${reportType?.toLowerCase() ?? "weekly"} report? This action cannot be undone.`,
      onConfirm: async () => {
        const formData = new FormData();
        formData.append("id", id);

        toast.promise(deleteAction(formData), {
          loading: `Deleting ${reportType?.toLowerCase() ?? "weekly"} report...`,
          success: () => {
            router.push(redirectPath);
            return `${reportType ?? "Weekly"} report deleted successfully.`;
          },
          error: (err) =>
            err instanceof Error
              ? err.message
              : `Something went wrong while deleting the ${reportType?.toLowerCase() ?? "weekly"} report.`,
        });
      },
      confirmText: "Delete",
      variant: "destructive",
    });
  };

  const handleExportAttendancePDF = async () => {
    if (!exportData || !exportData.entries) {
      toast.error("Missing data for export");
      return;
    }

    try {
      await exportAttendanceReportToPDF({
        internName: exportData.internName || "N/A",
        companyName: exportData.companyName || "N/A",
        entries: exportData.entries,
        previousTotal: exportData.previousTotal || 0,
        periodTotal: exportData.periodTotal || 0,
        startDate: exportData.startDate || "",
        endDate: exportData.endDate || "",
      });
      toast.success("Attendance report exported to PDF successfully");
    } catch (error) {
      toast.error("Failed to export attendance report to PDF");
      console.error(error);
    }
  };

  const handleExportAttendanceDOCX = async () => {
    if (!exportData || !exportData.entries) {
      toast.error("Missing data for export");
      return;
    }

    try {
      await exportAttendanceReportToDOCX({
        internName: exportData.internName || "N/A",
        companyName: exportData.companyName || "N/A",
        entries: exportData.entries,
        previousTotal: exportData.previousTotal || 0,
        periodTotal: exportData.periodTotal || 0,
        startDate: exportData.startDate || "",
        endDate: exportData.endDate || "",
      });
      toast.success("Attendance report exported to DOCX successfully");
    } catch (error) {
      toast.error("Failed to export attendance report to DOCX");
      console.error(error);
    }
  };

  return (
    <>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} size={"icon-sm"}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>

          <DropdownMenuContent
            align="end"
            className="data-[state=closed]:slide-out-to-left-0 data-[state=open]:slide-in-from-left-0 data-[state=closed]:slide-out-to-bottom-20 data-[state=open]:slide-in-from-bottom-20 data-[state=closed]:zoom-out-100 w-56 duration-400"
          >
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Export Attendance Report
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={handleExportAttendancePDF}>
                      <IconFileTypePdf />
                      To PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportAttendanceDOCX}>
                      <IconFileTypeDocx />
                      To DOCX
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Export Accomplishment Report
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <IconFileTypePdf />
                      To PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconFileTypeDocx />
                      To DOCX
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>

            <If condition={canDelete}>
              <If condition={isDeletableStatus}>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="group hover:text-destructive focus:text-red-600"
                  onClick={handleDelete}
                >
                  <IconTrash className="group-hover:text-destructive" />
                  Delete report
                </DropdownMenuItem>
              </If>

              <If condition={status === "pending"}>
                <DropdownMenuItem onClick={() => {}}>
                  Withdraw submission
                </DropdownMenuItem>
              </If>
            </If>
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent>
          <p>More Options</p>
        </TooltipContent>
      </Tooltip>

      {dialogConfig && (
        <ConfirmationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={dialogConfig.title}
          description={dialogConfig.description}
          onConfirm={() => {
            dialogConfig.onConfirm();
            setDialogOpen(false);
          }}
          confirmText={dialogConfig.confirmText}
          variant={dialogConfig.variant}
        />
      )}
    </>
  );
}
