"use client";

import React, { useRef } from "react";

import { FileInput, Loader2, Upload, X } from "lucide-react";
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
  file_name?: string | null;
  file_size?: number | null;
  file_type?: string | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadRequiementMutation = useUploadRequirement();
  const submitRequirementMutation = useSubmitRequirement();
  const deleteRequirementMutation = useDeleteRequirement();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      success: "File uploaded successfully",
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Failed to upload file. Please try again.";
      },
    });
  };

  const handleSubmit = async () => {
    if (!id.startsWith("placeholder-")) {
      const promise = async () => {
        await submitRequirementMutation.mutateAsync(id);
      };

      toast.promise(promise, {
        loading: "Submitting document...",
        success: "Document submitted for review",
        error: (err) => {
          if (err instanceof Error) {
            return err.message;
          }
          return "Failed to submit document. Please try again.";
        },
      });
    }
  };

  const handleDelete = async () => {
    if (!id.startsWith("placeholder-")) {
      const promise = async () => {
        await deleteRequirementMutation.mutateAsync(id);
      };

      toast.promise(promise, {
        loading: "Deleting file...",
        success: "File deleted successfully",
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
    <>
      <Input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        hidden
        onChange={handleFileChange}
        disabled={isOperationInProgress}
      />

      {status === "not submitted" && !file_name ? (
        <Button
          size={"sm"}
          className="cursor-pointer gap-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={isOperationInProgress}
        >
          <Upload className="size-4" />
          {uploadRequiementMutation.isPending ? "Uploading..." : "Upload File"}
        </Button>
      ) : (
        <div className="flex gap-5">
          <If
            condition={
              status === "not submitted" && !!file_name && !isPlaceholder
            }
          >
            <Button
              size={"sm"}
              className="cursor-pointer gap-1"
              onClick={handleSubmit}
              disabled={isOperationInProgress}
            >
              <FileInput className="size-4" />
              {submitRequirementMutation.isPending
                ? "Submitting..."
                : "Submit File"}
            </Button>
          </If>

          <div className="flex items-center gap-1">
            <div className="flex gap-1 font-medium">
              <p className="line-clamp-1 text-sm">{file_name}</p>
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
                size={"sm"}
                className="hover:bg-destructive/20 cursor-pointer"
                onClick={handleDelete}
                disabled={isOperationInProgress}
              >
                {deleteRequirementMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <X className="text-destructive size-4" />
                )}
              </Button>
            </If>
          </div>
        </div>
      )}
    </>
  );
}
