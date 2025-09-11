"use client";

import { useState } from "react";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { useRevalidateFetchUsers } from "@/hooks/use-users";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmationDialog from "@/components/sumikapp/confirmation-dialog";

import { deleteUserAction } from "../server/server-actions";

interface UserTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function UserTableRowActions<TData>({
  row,
}: UserTableRowActionsProps<TData>) {
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

  const revalidateUsers = useRevalidateFetchUsers();

  const userId = (row.original as any).id;
  const userEmail = (row.original as any).email;
  const isDeleted = (row.original as any).deleted_at;

  const archiveClick = () => {
    openConfirmDialog({
      title: "Archive Account",
      description: `Are you sure you want to archive ${userEmail}? This account will be hidden from active views but can be restored later.`,
      onConfirm: () => {},
      confirmText: "Archive",
      variant: "default",
    });
  };

  const suspendClick = () => {
    openConfirmDialog({
      title: "Suspend Account",
      description: `Are you sure you want to suspend ${userEmail}? This account will not be able to log in until unsuspended.`,
      onConfirm: () => {},
      confirmText: "Suspend",
      variant: "default",
    });
  };

  const deleteClick = () => {
    openConfirmDialog({
      title: "Deactivate Account Permanently",
      description: `Are you sure you want to permanently disable ${userEmail}? This action cannot be undone.`,
      onConfirm: () => {
        toast.promise(deleteUserAction(userId), {
          loading: `Deleting user...`,
          success: () => {
            revalidateUsers();
            return `User deleted successfully.`;
          },
          error: (err) =>
            err instanceof Error
              ? err.message
              : `Something went wrong while deleting user.`,
        });
      },
      confirmText: "Delete",
      variant: "destructive",
    });
  };

  if (isDeleted) {
    return null;
  }

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
          <DropdownMenuItem onClick={archiveClick} disabled={true}>
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem onClick={suspendClick} disabled={true}>
            Suspend
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={deleteClick}>Deactivate</DropdownMenuItem>
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
