"use client";

import React, { useRef, useState } from "react";

import { IconDownload, IconExternalLink } from "@tabler/icons-react";
import {
  File,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Paperclip,
  X,
} from "lucide-react";
import * as motion from "motion/react-client";
import { toast } from "sonner";

import { formatFileSize } from "@/utils/shared";
import { useSupabase } from "@/utils/supabase/hooks/use-supabase";

import { EntryUploadedFile } from "@/schemas/weekly-report/weekly-report.schema";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { If } from "@/components/sumikapp/if";

interface EntryFileUploadProps {
  existingFiles?: EntryUploadedFile[];
  disabled?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  onFilesChange?: (files: EntryUploadedFile[]) => void;
}

const ACCEPTED_FILE_TYPES = {
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
};

export default function EntryFileUpload({
  existingFiles = [],
  disabled = false,
  maxFiles = 5,
  maxFileSize = 10, // 10MB default
  allowedTypes = Object.keys(ACCEPTED_FILE_TYPES),
  onFilesChange,
}: EntryFileUploadProps) {
  const supabase = useSupabase();

  const [files, setFiles] = useState<EntryUploadedFile[]>(existingFiles);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="size-4" />;
    if (fileType.includes("pdf")) return <FileText className="size-4" />;
    if (fileType.includes("spreadsheet") || fileType.includes("excel"))
      return <FileSpreadsheet className="size-4" />;
    return <File className="size-4" />;
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    const isAllowedType = allowedTypes.some((type) => {
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.replace("/*", ""));
      }
      return file.type === type;
    });

    if (!isAllowedType) {
      return "File type not supported";
    }

    return null;
  };

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const currentFileCount = files.length;
    const newFileCount = selectedFiles.length;

    if (currentFileCount + newFileCount > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} files`);
      return;
    }

    const validFiles: EntryUploadedFile[] = [];
    const filesToUpload: File[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const error = validateFile(file);

      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }

      const uploadedFile: EntryUploadedFile = {
        entry_id: `temp-${Date.now()}-${i}`,
        file,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_path: "",
      };

      validFiles.push(uploadedFile);
      filesToUpload.push(file);
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    }
  };

  const handleRemoveFile = async (fileToRemove: EntryUploadedFile) => {
    if (disabled) return;

    const updatedFiles = files.filter(
      (f) => f.entry_id !== fileToRemove.entry_id
    );
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleButtonClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleDownloadFile = async ({
    filePath,
    fileName,
  }: {
    filePath: string;
    fileName: string;
  }) => {
    if (files.length > 0) {
      try {
        const { data, error } = await supabase.storage
          .from("additional-attachments")
          .download(filePath);

        if (error) {
          toast.error(`Failed to download ${fileName}.`);
          console.error("Error downloading file:", error);
          return;
        }

        const url = URL.createObjectURL(data);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Failed to download file:", err);
      }
    }
  };

  const handleViewFile = async ({ filePath }: { filePath: string }) => {
    if (files.length > 0) {
      try {
        const { data, error } = await supabase.storage
          .from("additional-attachments")
          .createSignedUrl(filePath, 3600);

        if (error) {
          toast.error("Failed to view file.");
          console.error("Error getting file URL:", error);
          return;
        }

        window.open(data.signedUrl, "_blank");
      } catch (err) {
        console.error("Failed to view file:", err);
        toast.error("Something went wrong while opening the file.");
      }
    }
  };

  const canAddMoreFiles = files.length < maxFiles;

  return (
    <div className="space-y-3">
      {(files.length > 0 || !disabled) && (
        <div className="flex items-center justify-between">
          <Label>Attachments</Label>
          {!disabled && (
            <span className="text-muted-foreground text-xs">
              {files.length}/{maxFiles} files
            </span>
          )}
        </div>
      )}

      {!disabled && canAddMoreFiles && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          onClick={handleButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(",")}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />

          <div className="flex flex-col items-center gap-2">
            <Paperclip className="text-muted-foreground size-8" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isDragging
                  ? "Drop files here"
                  : "Click to upload or drag and drop"}
              </p>
              <p className="text-muted-foreground text-xs">
                Images, PDF, Word, Excel (max {maxFileSize}MB each)
              </p>
            </div>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={`${file.entry_id}-${file.file_name}`}
              className="hover:bg-accent/50 flex items-center gap-3 rounded-lg border p-3 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="bg-muted flex size-10 items-center justify-center rounded">
                  {getFileIcon(file.file_type)}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="truncate text-sm font-medium">
                      {file.file_name}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{file.file_name}</p>
                  </TooltipContent>
                </Tooltip>
                <p className="text-muted-foreground text-xs">
                  {formatFileSize(file.file_size)}
                </p>
              </div>

              <If
                condition={!disabled}
                fallback={
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={"ghost"}
                          size={"icon-sm"}
                          onClick={() =>
                            handleViewFile({ filePath: file.file_path })
                          }
                          asChild
                        >
                          <motion.button whileTap={{ scale: 0.85 }}>
                            <a>
                              <IconExternalLink className="size-4" />
                              <span className="sr-only">View</span>
                            </a>
                          </motion.button>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={"ghost"}
                          size={"icon-sm"}
                          onClick={() =>
                            handleDownloadFile({
                              filePath: file.file_path,
                              fileName: file.file_name,
                            })
                          }
                          asChild
                        >
                          <motion.button whileTap={{ scale: 0.85 }}>
                            <IconDownload className="size-4" />
                            <span className="sr-only">Download</span>
                          </motion.button>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                }
              >
                <Button
                  variant={"ghost"}
                  size={"icon-sm"}
                  className="hover:bg-destructive/20 flex-shrink-0 cursor-pointer"
                  onClick={() => handleRemoveFile(file)}
                  asChild
                >
                  <motion.button whileTap={{ scale: 0.85 }}>
                    <X className="text-destructive size-4" />
                    <span className="sr-only">Remove</span>
                  </motion.button>
                </Button>
              </If>
            </div>
          ))}
        </div>
      )}

      {!disabled && !canAddMoreFiles && (
        <p className="text-muted-foreground text-xs italic">
          Maximum number of files reached
        </p>
      )}
    </div>
  );
}
