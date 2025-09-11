"use client";

import React, { useState } from "react";

import { IconEdit, IconTrashX } from "@tabler/icons-react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { useRevalidateFetchBatchRequirements } from "@/hooks/use-batch-requirements";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmationDialog from "@/components/sumikapp/confirmation-dialog";

import { deleteCustomRequirementAction } from "../server/server-actions";

export default function CustomRequirementRowActions({
  id,
  name,
  slug,
  handleEdit,
}: {
  id: string | null;
  name: string | null;
  slug: string;
  handleEdit: () => void;
}) {
  const revalidateBatchRequirements = useRevalidateFetchBatchRequirements();

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
      title: `Delete ${name}`,
      description: `Are you sure you want to delete ${name ?? "this custom requirement"}? This action cannot be undone.`,
      onConfirm: async () => {
        toast.promise(deleteCustomRequirementAction(id), {
          loading: `Deleting ${name}...`,
          success: () => {
            revalidateBatchRequirements(slug);
            return `${name} deleted successfully.`;
          },
          error: (err) =>
            err instanceof Error
              ? err.message
              : `Something went wrong while deleting custom requirement`,
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
            size={"icon"}
            variant={"ghost"}
            className="data-[state=open]:bg-muted"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => handleEdit()}
          >
            <IconEdit />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="group hover:text-destructive focus:text-red-600"
            onClick={handleDelete}
          >
            <IconTrashX className="group-hover:text-destructive" />
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
