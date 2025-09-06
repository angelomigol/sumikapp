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

import { Database } from "@/utils/supabase/supabase.types";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import ConfirmationDialog from "./confirmation-dialog";
import { If } from "./if";

interface ReportMoreOptionsProps {
  id: string;
  status: DocumentStatus;
  deleteAction?: (formData: FormData) => Promise<any>;
  redirectPath?: string;
  reportType?: "Attendance" | "Accomplishment";
  options?: {
    canDelete?: boolean;
  };
}

export default function ReportMoreOptions({
  id,
  deleteAction,
  redirectPath,
  reportType,
  status,
  options = {},
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
    if (!deleteAction || !redirectPath || !reportType) return;

    openConfirmDialog({
      title: `Delete ${reportType} Report`,
      description: `Are you sure you want to delete this ${reportType.toLowerCase()} report? This action cannot be undone.`,
      onConfirm: async () => {
        const formData = new FormData();
        formData.append("id", id);

        toast.promise(deleteAction(formData), {
          loading: `Deleting ${reportType.toLowerCase()} report...`,
          success: () => {
            router.push(redirectPath);
            return `${reportType} report deleted successfully.`;
          },
          error: (err) =>
            err instanceof Error
              ? err.message
              : `Something went wrong while deleting the ${reportType.toLowerCase()} report.`,
        });
      },
      confirmText: "Delete",
      variant: "destructive",
    });
  };

  return (
    <>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconFileTypePdf />
                Export to PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconFileTypeDocx />
                Export to DOCX
              </DropdownMenuItem>
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
