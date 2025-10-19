"use client";

import React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function CheckboxEntryDialog({
  isConfirmed,
  canConfirm = false,
  disabled,
  onConfirm,
}: {
  isConfirmed: boolean;
  disabled: boolean;
  canConfirm?: boolean | string | number | null;
  onConfirm?: () => void;
}) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  if (isConfirmed) {
    return (
      <div className="flex gap-2">
        <Checkbox
          checked={true}
          disabled
          className="data-[state=checked]:text-green-700"
        />
        <div className="grid gap-2">
          <Label htmlFor="save-entry" className="leading-4">
            Confirmed
          </Label>
          <p className="text-muted-foreground text-xs">
            This entry is already confirmed. Changes cannot be made.
          </p>
        </div>
      </div>
    );
  }

  if (!canConfirm) {
    return (
      <Label className="flex items-center gap-2 opacity-50">
        <Checkbox checked={false} disabled />
        <span className="text-sm">Confirm Entry</span>
      </Label>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="flex gap-2">
          <Checkbox disabled={disabled} id="save-entry" checked={false} />
          <div className="grid gap-2">
            <Label htmlFor="save-entry" className="leading-4">
              Confirm Entry
            </Label>
            <p className="text-muted-foreground w-3/4 text-xs">
              Clicking this checkbox means that you agree that the above
              information is correct.
            </p>
          </div>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Entry</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. You won&#39;t be able to edit this
            entry after confirmation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
