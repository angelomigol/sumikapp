"use client";

import { useState } from "react";
import Link from "next/link";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import pathsConfig from "@/config/paths.config";
import {
  TraineeWithUserAndHours,
  useRevalidateFetchSectionTrainees,
} from "@/hooks/use-section-trainees";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmationDialog from "@/components/sumikapp/confirmation-dialog";

import { removeStudentFromSectionAction } from "../server/server-actions";

interface TraineesTableRowActionsProps {
  row: Row<TraineeWithUserAndHours>;
  slug: string;
}

export function TraineesTableRowActions({
  row,
  slug,
}: TraineesTableRowActionsProps) {
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

  const revalidateSectionTrainees = useRevalidateFetchSectionTrainees();

  const traineeId = row.original.trainee_id;
  const displayName = [
    (row.original as any).first_name,
    (row.original as any).middle_name,
    (row.original as any).last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const removeClick = () => {
    openConfirmDialog({
      title: "Remove Student From Section",
      description: `Are you sure you want to remove ${displayName}? This action cannot be undone.`,
      onConfirm: () => {
        const formData = new FormData();
        formData.append("sectionName", slug);
        formData.append("traineeId", traineeId);

        toast.promise(removeStudentFromSectionAction(formData), {
          loading: `Removing student from section...`,
          success: () => {
            revalidateSectionTrainees(slug);
            return `Student removed from section successfully.`;
          },
          error: (err) =>
            err instanceof Error
              ? err.message
              : `Something went wrong while removing student.`,
        });
      },
      confirmText: "Remove",
      variant: "destructive",
    });
  };

  console.log(traineeId, slug);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted flex size-8 p-0"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem asChild>
            <Link
              href={pathsConfig.dynamic.sectionTraineeDetails(
                row.original.trainee_id,
                slug
              )}
            >
              View Student
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={removeClick}>
            Remove Student
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
