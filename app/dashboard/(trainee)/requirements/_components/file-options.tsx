"use client";

import React, { useRef } from "react";

import { FileInput, Loader2, Upload, X } from "lucide-react";
import * as motion from "motion/react-client";
import { toast } from "sonner";

import {
  useDeleteRequirement,
  useSubmitRequirement,
  useUploadRequirement,
} from "@/hooks/use-requirements";

import { DocumentStatus } from "@/lib/constants";

import { formatFileSize } from "@/utils/shared";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { If } from "@/components/sumikapp/if";

export default function FileOptions({
  id,
  status,
  file_name,
  file_size,
  file_type,
  requirement_name,
}: {
  id: string;
  status: DocumentStatus;
  requirement_name: string;
  file_type?: string[] | null;
  file_name?: string | null;
  file_size?: number | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadRequiementMutation = useUploadRequirement();
  const submitRequirementMutation = useSubmitRequirement();
  const deleteRequirementMutation = useDeleteRequirement();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    const promise = async () => {
      await uploadRequiementMutation.mutateAsync({
        file,
        requirement_name,
      });
    };

    toast.promise(promise, {
      loading: "Uploading file...",
      success: "File uploaded successfully!",
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Failed to upload file. Please try again.";
      },
    });
  };

  const handleSubmit = () => {
    if (!id.startsWith("placeholder-")) {
      const promise = async () => {
        await submitRequirementMutation.mutateAsync(id);
      };

      toast.promise(promise, {
        loading: "Submitting document...",
        success: "Document submitted for review!",
        error: (err) => {
          if (err instanceof Error) {
            return err.message;
          }
          return "Failed to submit document. Please try again.";
        },
      });
    }
  };

  const handleDelete = () => {
    if (!id.startsWith("placeholder-")) {
      const promise = async () => {
        await deleteRequirementMutation.mutateAsync(id);
      };

      toast.promise(promise, {
        loading: "Deleting file...",
        success: "File deleted successfully!",
        error: (err) => {
          if (err instanceof Error) {
            return err.message;
          }
          return "Failed to delete document. Please try again.";
        },
      });
    }
  };

  const isOperationInProgress =
    uploadRequiementMutation.isPending ||
    submitRequirementMutation.isPending ||
    deleteRequirementMutation.isPending;
  const isPlaceholder = id.startsWith("placeholder-");

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
      <Input
        type="file"
        accept={file_type ? file_type.join(",") : undefined}
        ref={fileInputRef}
        hidden
        onChange={handleFileChange}
        disabled={isOperationInProgress}
      />

      <If
        condition={status === "not submitted" && !file_name}
        fallback={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <If
              condition={
                status === "not submitted" && !!file_name && !isPlaceholder
              }
            >
              <Button
                size={"sm"}
                className="w-full cursor-pointer transition-none sm:w-auto"
                onClick={handleSubmit}
                disabled={isOperationInProgress}
                asChild
              >
                <motion.button whileTap={{ scale: 0.85 }}>
                  <If
                    condition={submitRequirementMutation.isPending}
                    fallback={
                      <>
                        <FileInput className="size-4" />
                        Submit File
                      </>
                    }
                  >
                    <Loader2 className="size-4 animate-spin" />
                    Submitting...
                  </If>
                </motion.button>
              </Button>
            </If>

            <div className="flex items-center gap-1">
              <div className="flex max-w-2xs gap-1 font-medium">
                <p
                  className="block truncate text-sm"
                  title={file_name ?? undefined}
                >
                  {file_name}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  {file_size && formatFileSize(file_size)}
                </p>
              </div>

              <If
                condition={
                  (status === "not submitted" || status === "rejected") &&
                  !isPlaceholder
                }
              >
                <Button
                  variant={"ghost"}
                  size={"icon-sm"}
                  className="hover:bg-destructive/20 cursor-pointer transition-none"
                  onClick={handleDelete}
                  disabled={isOperationInProgress}
                >
                  <motion.button whileTap={{ scale: 0.85 }}>
                    <If
                      condition={deleteRequirementMutation.isPending}
                      fallback={<X className="text-destructive size-4" />}
                    >
                      <Loader2 className="size-4 animate-spin" />
                      <span className="sr-only">Remove</span>
                    </If>
                  </motion.button>
                </Button>
              </If>
            </div>
          </div>
        }
      >
        <Button
          size={"sm"}
          className="w-full cursor-pointer transition-none sm:w-auto"
          onClick={() => fileInputRef.current?.click()}
          disabled={isOperationInProgress}
          asChild
        >
          <motion.button whileTap={{ scale: 0.85 }}>
            <If
              condition={uploadRequiementMutation.isPending}
              fallback={
                <>
                  <Upload className="size-4" />
                  Upload File
                </>
              }
            >
              <Loader2 className="size-4 animate-spin" />
              Uploading...
            </If>
          </motion.button>
        </Button>
      </If>
    </div>
  );
}
