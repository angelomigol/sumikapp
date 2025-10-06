"use client";

import { useState } from "react";

import { IconEdit, IconTrash } from "@tabler/icons-react";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import {
  IndustryPartner,
  useRevalidateFetchIndustryPartners,
} from "@/hooks/use-industry-partner";

import { Tables } from "@/utils/supabase/supabase.types";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmationDialog from "@/components/sumikapp/confirmation-dialog";

interface IndustryPartnerTableRowActionsProps {
  row: Row<Tables<"industry_partners">>;
  onEdit: (partner: IndustryPartner) => void;
  deleteAction: (formData: FormData) => Promise<{
    success: boolean;
    message: string;
  }>;
}

export function IndustryPartnerTableRowActions({
  row,
  onEdit,
  deleteAction,
}: IndustryPartnerTableRowActionsProps) {
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

  const revalidatePartners = useRevalidateFetchIndustryPartners();

  const partnerData = row.original;

  const deleteClick = () => {
    openConfirmDialog({
      title: "Delete Industry Partner",
      description: `Are you sure you want to permanently delete ${partnerData.company_name}? This action cannot be undone.`,
      onConfirm: () => {
        const formData = new FormData();
        formData.append("id", partnerData.id);

        toast.promise(deleteAction(formData), {
          loading: `Deleting ${partnerData.company_name}...`,
          success: () => {
            revalidatePartners();
            setDialogOpen(false);
            return `Industry partner deleted successfully.`;
          },
          error: (err) => {
            setDialogOpen(false);
            return err instanceof Error
              ? err.message
              : `Something went wrong while deleting industry partner.`;
          },
        });
      },
      confirmText: "Delete",
      variant: "destructive",
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => onEdit(partnerData)}>
            <IconEdit />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={deleteClick}
            className="group hover:text-destructive focus:text-red-600"
          >
            <IconTrash className="group-hover:text-destructive" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {dialogConfig && (
        <ConfirmationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={dialogConfig.title}
          description={dialogConfig.description}
          onConfirm={() => {
            dialogConfig.onConfirm();
          }}
          confirmText={dialogConfig.confirmText}
          variant={dialogConfig.variant}
        />
      )}
    </>
  );
}
