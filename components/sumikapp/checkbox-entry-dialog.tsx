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
      <Label className="flex items-center gap-2 text-green-700">
        <Checkbox
          checked={true}
          disabled
          className="data-[state=checked]:text-green-700"
        />
        <span className="text-sm">Confirmed</span>
      </Label>
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
        <Label htmlFor="saveEntry">
          <Checkbox disabled={disabled} id="saveEntry" checked={false} />
          Confirm Entry
        </Label>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Entry</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. You won't be able to edit this entry
            after confirmation.
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
