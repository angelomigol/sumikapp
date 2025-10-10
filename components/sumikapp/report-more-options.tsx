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

          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Export Attendance Report
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
