"use client";

import { useState } from "react";

import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { If } from "./if";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  cancelText?: string;
  confirmText?: string;
  variant?: "default" | "destructive";
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelText = "Cancel",
  confirmText = "Continue",
  onConfirm,
  variant = "default",
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            className={
              variant === "destructive"
                ? "bg-destructive hover:bg-destructive/90"
                : ""
            }
            disabled={isLoading}
          >
            <If condition={isLoading} fallback={confirmText}>
              <Loader2 className="size-5 animate-spin" />
            </If>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
