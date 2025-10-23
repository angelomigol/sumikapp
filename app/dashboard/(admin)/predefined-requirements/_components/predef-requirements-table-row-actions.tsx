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
import { useRevalidatePredefRequirements } from "@/hooks/use-predefined-requirements";
import { deletePredefRequirementAction } from "../server/sever-actions";

interface PredefRequirementsTableRowActionsProps {
  id: string | null;
  name: string | null;
  handleEdit: () => void;
}

export function PredefRequirementsTableRowActions({
  id,
  name,
  handleEdit,
}: PredefRequirementsTableRowActionsProps) {
  const revalidatePredefRequirements = useRevalidatePredefRequirements();

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

  if (!id || !name) {
    return null;
  }

  const handleDelete = () => {
    openConfirmDialog({
      title: "Delete Requirement",
      description: `Are you sure you want to permanently delete ${name ?? "this requirement"}? This action cannot be undone.`,
      onConfirm: () => {
        toast.promise(deletePredefRequirementAction(id), {
          loading: `Deleting ${name}...`,
          success: () => {
            revalidatePredefRequirements();
            return `${name} deleted successfully.`;
          },
          error: (err) => {
            setDialogOpen(false);
            return err instanceof Error
              ? err.message
              : `Something went wrong while deleting requirement.`;
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
          <DropdownMenuItem onClick={() => handleEdit()}>
            <IconEdit />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="group hover:text-destructive focus:text-red-600"
            onClick={handleDelete}
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
            setDialogOpen(false);
          }}
          confirmText={dialogConfig.confirmText}
          variant={dialogConfig.variant}
        />
      )}
    </>
  );
}
