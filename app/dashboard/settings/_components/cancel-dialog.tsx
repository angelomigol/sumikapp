"use client";

import { AlertTriangle, Edit, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function CancelDialog({
  isCancelDialogOpen,
  setIsCancelDialogOpen,
  confirmCancel,
}: {
  isCancelDialogOpen: boolean;
  setIsCancelDialogOpen: (open: boolean) => void;
  confirmCancel: () => void;
}) {
  return (
    <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-amber-11 size-5" />
            Unsaved Changes
          </AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes that will be lost if you cancel. Are you
            sure you want to discard these changes?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={(e) => {
              e.preventDefault();
              setIsCancelDialogOpen(false);
            }}
          >
            <Edit className="size-4" />
            Keep Editing
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmCancel}
            className="bg-destructive hover:bg-destructive/80"
          >
            <Trash2 className="size-4" />
            Discard Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
