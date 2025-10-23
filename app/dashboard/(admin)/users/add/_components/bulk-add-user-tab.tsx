"use client";

import React, { useRef, useState } from "react";

import {
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { If } from "@/components/sumikapp/if";

import DownloadButtonGroup from "./download-button-group";

interface UploadResult {
  success: number;
  failed: number;
  errors?: Array<{ row: number; message: string }>;
  message?: string;
}

export default function BulkAddUserTab() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!validExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: "Please upload an Excel (.xlsx, .xls) or CSV file",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      };
    }

    if (file.size === 0) {
      return { valid: false, error: "File is empty" };
    }

    return { valid: true };
  };

  const handleFileSelection = (uploadedFile: File) => {
    setError(null);
    setResult(null);

    const validation = validateFile(uploadedFile);

    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    setFile(uploadedFile);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload file. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const uploadedFile = e.dataTransfer.files[0];
      handleFileSelection(uploadedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFile = e.target.files[0];
      handleFileSelection(uploadedFile);
    }
  };

  const handleDropZoneClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  const handleDropZoneKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !isProcessing) {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <>
      {/* {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )} */}
      <Card>
        <CardHeader>
          <CardAction>
            <DownloadButtonGroup />
          </CardAction>
        </CardHeader>
        <CardContent>
          <If condition={!!error}>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </If>

          <If condition={!!result}>
            <Alert className="mb-4 border-green-500 bg-green-50 text-green-900">
              <CheckCircle className="size-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold">
                    Successfully processed {result?.success ?? 0} user(s)
                  </p>
                  {result && result.failed > 0 && (
                    <p className="text-sm">
                      {result.failed} user(s) failed to import
                    </p>
                  )}
                  {result?.errors && result.errors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium">Errors:</p>
                      <ul className="list-inside list-disc text-sm">
                        {result.errors.slice(0, 5).map((err, idx) => (
                          <li key={idx}>
                            Row {err.row}: {err.message}
                          </li>
                        ))}
                        {result.errors.length > 5 && (
                          <li>
                            ... and {result.errors.length - 5} more errors
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </If>

          <div
            className={`cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/10"
                : isProcessing
                  ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-50"
                  : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleDropZoneClick}
            onKeyDown={handleDropZoneKeyDown}
            role="button"
            tabIndex={isProcessing ? -1 : 0}
            aria-label="Upload area for bulk user import spreadsheet"
          >
            <FileSpreadsheet className="text-muted-foreground mx-auto size-12" />
            <h3 className="mt-4 font-semibold">
              Drag and drop the downloaded template here
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              or click to browse your files
            </p>
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={isProcessing}
              aria-label="Upload spreadsheet file for bulk user import"
            />

            <Button
              variant={"outline"}
              className="mt-4"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Select File
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <If condition={file !== null && !isProcessing}>
            <div className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="size-4 text-gray-500" />
                <div className="text-sm">
                  <span className="text-muted-foreground">Selected file: </span>
                  <span className="font-medium">{file?.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    ({file && (file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                aria-label="Remove selected file"
              >
                <X className="size-4" />
              </Button>
            </div>
          </If>

          <If condition={file !== null && !isProcessing}>
            <div className="flex w-full gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!file || isProcessing}
                className="flex-1"
              >
                <Upload className="size-4" />
                Upload and Process
              </Button>
            </div>
          </If>

          <If condition={isProcessing}>
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              <p className="text-muted-foreground text-sm">
                Processing file, please wait...
              </p>
            </div>
          </If>
        </CardFooter>
      </Card>
    </>
  );
}
