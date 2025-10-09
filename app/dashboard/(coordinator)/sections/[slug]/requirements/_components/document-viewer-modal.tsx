"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";

import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  Download,
  EyeOff,
  FileIcon,
  FileX2,
  Info,
  Loader2,
  MessageSquare,
  RotateCw,
  XCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";

import {
  useApproveTraineeSubmission,
  useRejectTraineeSubmission,
} from "@/hooks/use-batch-requirements";

import { DocumentStatus, getDocumentStatusConfig } from "@/lib/constants";

import { formatDatePH } from "@/utils/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { If } from "@/components/sumikapp/if";

type LoadingState = "idle" | "approving" | "rejecting" | "loading" | "error";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentName: string;
  submittedDate: string;
  documentId: string;
  fileSize: string;
  studentName: string;
  currentStatus: DocumentStatus;
  isLoading: boolean;
  error?: string | null;
  slug: string;
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  documentUrl,
  documentName,
  submittedDate,
  documentId,
  currentStatus,
  isLoading = false,
  error = null,
  fileSize,
  studentName,
  slug,
}: DocumentViewerModalProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [feedback, setFeedback] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [documentError, setDocumentError] = useState("");

  const approveSubmissionMutation = useApproveTraineeSubmission(slug);
  const rejectSubmissionMutation = useRejectTraineeSubmission(slug);

  console.log(
    documentUrl,
    documentName,
    submittedDate,
    documentId,
    currentStatus,
    fileSize,
    studentName
  );

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setLoadingState("idle");
      setFeedback("");
      setShowFeedbackForm(false);
      setZoom(100);
      setRotation(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (approveSubmissionMutation.isPending) {
      setLoadingState("approving");
    } else if (rejectSubmissionMutation.isPending) {
      setLoadingState("rejecting");
    } else {
      setLoadingState("idle");
    }
  }, [approveSubmissionMutation.isPending, rejectSubmissionMutation.isPending]);

  const fileExtension = documentName.split(".").pop()?.toLowerCase() || "";
  const isPdf = fileExtension === "pdf";
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(
    fileExtension
  );

  const handleDownload = useCallback(async () => {
    if (!documentUrl) {
      toast.error("Document URL not available");
      return;
    }

    try {
      setLoadingState("loading");

      const response = await fetch(documentUrl);
      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = documentName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Document downloaded successfully");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download document");
    } finally {
      setLoadingState("idle");
    }
  }, [documentUrl, documentName]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleResetView = () => {
    setZoom(100);
    setRotation(0);
  };

  const handleApproveDocument = () => {
    const promise = async () => {
      await approveSubmissionMutation.mutateAsync(documentId);
    };

    toast.promise(promise, {
      loading: "Updating document...",
      success: "Document approved successfully!",
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while updating document. Please try again.";
      },
    });

    setLoadingState("idle");
  };

  const handleRejectDocument = () => {
    const promise = async () => {
      await rejectSubmissionMutation.mutateAsync({
        documentId,
        feedback,
      });
    };

    toast.promise(promise, {
      loading: "Updating document...",
      success: "Document rejected successfully!",
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while updating document. Please try again.";
      },
    });

    setLoadingState("idle");
    setFeedback("");
    setShowFeedbackForm(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex h-screen min-w-screen flex-col gap-0 rounded-none p-0"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row justify-between border-b p-2">
          <div className="flex h-full items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size={"icon"} variant={"ghost"} onClick={onClose}>
                  <ChevronLeft />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exit</p>
              </TooltipContent>
            </Tooltip>

            <DialogTitle className="max-w-2xs truncate" title={documentName}>
              {documentName}
            </DialogTitle>
            <Badge
              className={getDocumentStatusConfig(currentStatus).badgeColor}
            >
              {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </Badge>
          </div>

          {(isPdf || isImage) && (
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"outline"}
                    size={"icon"}
                    onClick={handleZoomOut}
                  >
                    <ZoomOut />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom Out</TooltipContent>
              </Tooltip>

              <span className="text-muted-foreground w-fit text-center text-sm">
                {zoom}%
              </span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"outline"}
                    size={"icon"}
                    onClick={handleZoomIn}
                  >
                    <ZoomIn />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom In</TooltipContent>
              </Tooltip>

              <If condition={isImage}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRotate}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rotate</TooltipContent>
                </Tooltip>
              </If>

              <Button variant="outline" size="sm" onClick={handleResetView}>
                Reset
              </Button>
            </div>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={handleDownload}
                disabled={loadingState === "loading"}
              >
                {loadingState !== "loading" && <Download className="size-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download</TooltipContent>
          </Tooltip>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-[1fr_22rem] overflow-hidden">
          <DocumentRenderer
            isLoading={isLoading}
            error={error}
            zoom={zoom}
            rotation={rotation}
            isPdf={isPdf}
            isImage={isImage}
            fileExtension={fileExtension}
            documentUrl={documentUrl}
            documentName={documentName}
            handleDownload={handleDownload}
            documentError={documentError}
            setDocumentError={setDocumentError}
          />

          <aside className="flex flex-col space-y-4 overflow-y-auto border-l p-4">
            <div className="flex items-center gap-2">
              <Info className="size-4" />
              <p className="font-semibold">Information</p>
            </div>
            <ul className="flex flex-1 flex-col gap-2 text-sm">
              <li>
                <span className="font-medium">Name:</span> {documentName}
              </li>
              <li>
                <span className="font-medium">Size:</span> {fileSize}
              </li>
              <li>
                <span className="font-medium">Type:</span>{" "}
                {fileExtension.toUpperCase()}
              </li>
              <li>
                <span className="font-medium">Submitted Date:</span>{" "}
                {formatDatePH(submittedDate)}
              </li>
              <li>
                <span className="font-medium">Submitted By:</span> {studentName}
              </li>
            </ul>

            <If
              condition={showFeedbackForm}
              fallback={
                <If condition={currentStatus === "pending"}>
                  <div className="flex flex-col gap-4">
                    <Button
                      className="gap-2 bg-green-600 hover:bg-green-600/80"
                      onClick={handleApproveDocument}
                      disabled={loadingState !== "idle"}
                    >
                      <If
                        condition={loadingState === "approving"}
                        fallback={
                          <>
                            <CheckCircle className="size-4" />
                            Approve
                          </>
                        }
                      >
                        <Loader2 className="size-4 animate-spin" />
                        Approving...
                      </If>
                    </Button>
                    <Button
                      variant={"destructive"}
                      onClick={() => setShowFeedbackForm(true)}
                      disabled={loadingState !== "idle"}
                      className="gap-2"
                    >
                      <XCircle className="size-4" />
                      Reject
                    </Button>
                  </div>
                </If>
              }
            >
              <Card className="w-full p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4" />
                  <Label htmlFor="feedback" className="text-base font-medium">
                    Rejection Feedback
                  </Label>
                </div>
                <div>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Please provide specific feedback explaining why this document is being rejected. This will help the student understand what needs to be corrected."
                    className="max-h-32 resize-none"
                    maxLength={500}
                  />
                  <span className="text-muted-foreground text-xs">
                    {feedback.length}/500 characters
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    variant={"outline"}
                    size={"sm"}
                    onClick={() => {
                      setShowFeedbackForm(false);
                      setFeedback("");
                    }}
                    disabled={loadingState !== "idle"}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={"destructive"}
                    size={"sm"}
                    onClick={handleRejectDocument}
                    disabled={loadingState !== "idle" || !feedback.trim()}
                    className="gap-2"
                  >
                    <If
                      condition={loadingState === "rejecting"}
                      fallback={
                        <>
                          <AlertCircle className="size-4" />
                          Confirm Rejection
                        </>
                      }
                    >
                      <Loader2 className="size-4 animate-spin" />
                      Rejecting...
                    </If>
                  </Button>
                </div>
              </Card>
            </If>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DocumentRenderer({
  isLoading,
  error,

  zoom,
  rotation,

  isPdf,
  isImage,
  fileExtension,
  documentUrl,
  documentName,

  handleDownload,
  documentError,
  setDocumentError,
}: {
  isLoading: boolean;
  error: string | null;

  zoom: number;
  rotation: number;

  isPdf: boolean;
  isImage: boolean;
  fileExtension: string;
  documentUrl: string;
  documentName: string;

  handleDownload: () => void;
  documentError: string;
  setDocumentError: (error: string) => void;
}) {
  const renderDocumentViewer = () => {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin" />
            <p className="text-muted-foreground">Loading document...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
          <FileX2 className="text-muted-foreground size-16" />
          <p className="text-lg font-semibold">Error!</p>
          <p className="text-muted-foreground max-w-md text-sm">
            {error || documentError || "Failed to load document"}
          </p>
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      );
    }

    if (!documentUrl) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <EyeOff className="text-muted-foreground size-16" />
          <p className="text-muted-foreground font-semibold">
            Document Not Available
          </p>
        </div>
      );
    }

    const viewerStyle = {
      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
      transformOrigin: "center center",
      transition: "transform 0.3s ease",
    };

    if (isPdf) {
      return (
        <div className="relative h-full w-full">
          <iframe
            src={`${documentUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="h-full w-full border-0"
            title={documentName}
            style={viewerStyle}
            onError={() => setDocumentError("Failed to load PDF")}
          />
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="flex h-full items-center justify-center overflow-hidden">
          <div className="flex items-center justify-center" style={viewerStyle}>
            <img
              src={documentUrl}
              alt={documentName}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          </div>
        </div>
      );
    }

    // Fallback for unsupported file types
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <FileIcon className="text-muted-foreground size-16" />
        <p className="text-lg font-semibold">Preview not available</p>
        <p className="text-muted-foreground max-w-md text-sm">
          This file type ({fileExtension.toUpperCase()}) cannot be previewed in
          the browser. Please download the file to view its contents.
        </p>
        <Button
          type="button"
          variant={"outline"}
          size={"sm"}
          onClick={() => {}}
          className="gap-2"
        >
          <Download className="size-4" />
          Download to View
        </Button>
      </div>
    );
  };

  return <div className="overflow-auto">{renderDocumentViewer()}</div>;
}
