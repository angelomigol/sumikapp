"use client";

import Link from "next/link";

import { Check, Loader2, X } from "lucide-react";

import pathsConfig from "@/config/paths.config";
import { useRevalidateFetchTraineesForEvaluation } from "@/hooks/use-supervisor-trainees";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ModalState = "processing" | "success" | "error";

interface EvaluationStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: ModalState;
  error?: string | null;
}

export default function EvaluationStatusDialog({
  open,
  onOpenChange,
  state,
  error,
}: EvaluationStatusDialogProps) {
  const revalidateTrainees = useRevalidateFetchTraineesForEvaluation();

  const modalConfig = {
    processing: {
      icon: <Loader2 className="h-6 w-6 animate-spin text-blue-600" />,
      title: "Processing Evaluation",
      description: "Please wait while we process your evaluation...",
      footer: null,
    },
    success: {
      icon: (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>
      ),
      title: "Evaluation Submitted",
      description:
        "Your evaluation has been successfully submitted and processed.",
      footer: (
        <Button className="w-full" asChild onClick={revalidateTrainees}>
          <Link href={pathsConfig.app.evaluations}>Close</Link>
        </Button>
      ),
    },
    error: (error: string | null) => ({
      icon: (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <X className="h-6 w-6 text-red-600" />
        </div>
      ),
      title: "Submission Failed",
      description:
        error ||
        "An unexpected error occurred while submitting your evaluation.",
      footer: null,
    }),
  } as const;

  const config =
    state === "error" ? modalConfig.error(error ?? null) : modalConfig[state];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-col items-center space-y-2">
          {config.icon}
          <DialogTitle className="text-center">{config.title}</DialogTitle>
          <p className="text-muted-foreground text-center text-sm">
            {config.description}
          </p>
        </DialogHeader>

        <DialogFooter>
          {config.footer ??
            (state === "error" && (
              <Button
                className="w-full"
                variant="destructive"
                onClick={() => onOpenChange(false)}
              >
                Try Again
              </Button>
            ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
