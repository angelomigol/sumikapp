import React, { useEffect, useState } from "react";

import {
  AlertCircle,
  ChevronLeft,
  Download,
  DownloadIcon,
  EyeOff,
  FileIcon,
  FileX2,
  Loader2,
  MessageSquare,
  RotateCwIcon,
  ShieldCheckIcon,
  ShieldXIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  useApproveTraineeSubmission,
  useRejectTraineeSubmission,
} from "@/hooks/use-batch-requirements";
import { useFetchSignedUrl } from "@/hooks/use-document";

import { DocumentStatus, getDocumentStatusConfig } from "@/lib/constants";

import { formatDatePH, formatFileSize } from "@/utils/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { If } from "@/components/sumikapp/if";

interface DocumentInfo {
  id: string;
  requirementName: string;
  status: DocumentStatus;
  filePath: string | null;
  fileName: string | null;
  fileSize: string | null;
  submittedDate: string | null;
}

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  documents: DocumentInfo[];
  slug: string;
}

export default function NewDocumentViewerModal({
  isOpen,
  onClose,
  slug,
  studentName,
  documents,
}: DocumentViewerModalProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState<DocumentInfo | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  const approveSubmissionMutation = useApproveTraineeSubmission(slug);
  const rejectSubmissionMutation = useRejectTraineeSubmission(slug);

  useEffect(() => {
    if (isOpen) {
      setFeedback("");
      setShowFeedbackForm(false);
      setZoom(100);
      setRotation(0);
    }
  }, [isOpen]);

  const fileExtension =
    selectedDoc?.fileName?.split(".").pop()?.toLowerCase() || "";

  const handleApproveDocument = () => {
    if (!selectedDoc?.id) {
      return;
    }

    const promise = async () => {
      await approveSubmissionMutation.mutateAsync(selectedDoc.id);
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
  };

  const handleRejectDocument = () => {
    if (!selectedDoc?.id) {
      return;
    }

    const promise = async () => {
      await rejectSubmissionMutation.mutateAsync({
        documentId: selectedDoc.id,
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

    setFeedback("");
    setShowFeedbackForm(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="data-[state=open]:!zoom-in-0 flex h-screen min-w-screen flex-col gap-0 rounded-none bg-black/20 p-0 outline-none data-[state=open]:duration-300"
        showCloseButton={false}
      >
        <DialogHeader className="bg-background flex-row justify-between border-b p-2">
          <div className="flex h-full flex-1 items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size={"icon-sm"}
                  variant={"ghost"}
                  onClick={onClose}
                  aria-label="Close"
                >
                  <ChevronLeft />
                  <span className="sr-only">Close</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Close</p>
              </TooltipContent>
            </Tooltip>

            <DialogTitle
              className="block max-w-2xs truncate"
              title={selectedDoc?.fileName || undefined}
            >
              {selectedDoc?.fileName || ""}
            </DialogTitle>
            {selectedDoc?.status && (
              <Badge
                className={
                  getDocumentStatusConfig(selectedDoc?.status).badgeColor
                }
              >
                {selectedDoc?.status.charAt(0).toUpperCase() +
                  selectedDoc?.status.slice(1)}
              </Badge>
            )}
          </div>

          <If condition={selectedDoc}>
            <div className="flex flex-1 items-center justify-between gap-4">
              <ButtonGroup>
                <ButtonGroup>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={"outline"}
                        size={"icon-sm"}
                        onClick={handleZoomOut}
                        disabled={zoom <= 50}
                        aria-label="Zoom Out"
                      >
                        <ZoomOutIcon />
                        <span className="sr-only">Zoom Out</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom Out</TooltipContent>
                  </Tooltip>

                  <span className="bg-background dark:border-input dark:bg-input/30 flex items-center border px-3 text-sm font-medium">
                    {`${zoom}%`}
                  </span>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={"outline"}
                        size={"icon-sm"}
                        onClick={handleZoomIn}
                        disabled={zoom >= 200}
                        aria-label="Zoom In"
                      >
                        <ZoomInIcon />
                        <span className="sr-only">Zoom In</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom In</TooltipContent>
                  </Tooltip>
                </ButtonGroup>

                <ButtonGroup>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={"outline"}
                        size={"icon-sm"}
                        onClick={handleRotate}
                        aria-label="Rotate"
                      >
                        <RotateCwIcon className="size-4" />
                        <span className="sr-only">Rotate</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Rotate</TooltipContent>
                  </Tooltip>

                  <Button
                    variant={"outline"}
                    size={"sm"}
                    onClick={handleReset}
                    aria-label="Reset"
                  >
                    Reset
                  </Button>
                </ButtonGroup>
              </ButtonGroup>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"ghost"}
                    size={"icon-sm"}
                    onClick={() => {}}
                    aria-label="Download"
                    disabled={!selectedDoc}
                    // disabled={loadingState === "loading"}
                  >
                    {/* {loadingState !== "loading" && <DownloadIcon className="size-4" />} */}
                    <DownloadIcon className="size-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download</TooltipContent>
              </Tooltip>
            </div>
          </If>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-[22rem_1fr] overflow-hidden">
          <If
            condition={!showInfo && !selectedDoc}
            fallback={
              <div className="bg-background flex w-[22rem] flex-col space-y-4 overflow-y-auto border-l py-2">
                <div className="mb-3 flex items-center gap-2 px-4 font-semibold">
                  <ChevronLeft
                    className="size-4 cursor-pointer"
                    onClick={() => {
                      setSelectedDoc(null);
                      setShowInfo(!showInfo);
                    }}
                  />
                  {selectedDoc?.requirementName}
                </div>
                <ul className="flex flex-1 flex-col gap-2 px-4 text-sm">
                  <li>
                    <span className="font-medium">File Name:</span>{" "}
                    {selectedDoc?.fileName}
                  </li>
                  <li>
                    <span className="font-medium">Size:</span>{" "}
                    {formatFileSize(Number(selectedDoc?.fileSize))}
                  </li>
                  <li>
                    <span className="font-medium">Type:</span>{" "}
                    {fileExtension.toUpperCase()}
                  </li>
                  <li>
                    <span className="font-medium">Submitted Date:</span>{" "}
                    {formatDatePH(selectedDoc?.submittedDate ?? undefined)}
                  </li>
                  <li>
                    <span className="font-medium">Submitted By:</span>{" "}
                    {studentName}
                  </li>
                </ul>

                <If
                  condition={showFeedbackForm}
                  fallback={
                    <If condition={selectedDoc?.status === "pending"}>
                      <div className="flex flex-col gap-4 px-4">
                        <Button
                          className="gap-2 bg-green-600/10 text-green-600 hover:bg-green-600/20 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:hover:bg-green-400/20 dark:focus-visible:ring-green-400/40"
                          onClick={handleApproveDocument}
                          disabled={
                            approveSubmissionMutation.isPending ||
                            rejectSubmissionMutation.isPending
                          }
                        >
                          <If
                            condition={approveSubmissionMutation.isPending}
                            fallback={
                              <>
                                Approve
                                <ShieldCheckIcon className="size-4" />
                              </>
                            }
                          >
                            Approving...
                            <Loader2 className="size-4 animate-spin" />
                          </If>
                        </Button>
                        <Button
                          onClick={() => setShowFeedbackForm(true)}
                          className="bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 gap-2"
                          disabled={
                            approveSubmissionMutation.isPending ||
                            rejectSubmissionMutation.isPending
                          }
                        >
                          Reject
                          <ShieldXIcon className="size-4" />
                        </Button>
                      </div>
                    </If>
                  }
                >
                  <Card className="w-full rounded-none border-b-0 p-4 shadow-none">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="size-4" />
                      <Label
                        htmlFor="feedback"
                        className="text-base font-medium"
                      >
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
                        disabled={rejectSubmissionMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant={"destructive"}
                        size={"sm"}
                        onClick={handleRejectDocument}
                        disabled={
                          rejectSubmissionMutation.isPending || !feedback.trim()
                        }
                        className="gap-2"
                      >
                        <If
                          condition={rejectSubmissionMutation.isPending}
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
              </div>
            }
          >
            <ScrollArea className="bg-background overflow-hidden border-l">
              <div className="flex w-[22rem] flex-col px-4 py-2">
                <span className="mb-3 font-semibold">Requirements</span>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <Card
                      key={doc.id}
                      className={`w-full gap-2 rounded-md border p-3 text-left transition-colors ${
                        selectedDoc?.id === doc.id
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => {
                        if (doc?.status !== "not submitted") {
                          setShowInfo(!showInfo);
                          setSelectedDoc(doc);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {doc.requirementName}
                        </span>
                        {doc.status && (
                          <Badge
                            className={
                              getDocumentStatusConfig(doc.status).badgeColor
                            }
                          >
                            {doc.status.charAt(0).toUpperCase() +
                              doc.status.slice(1)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground line-clamp-2 text-xs">
                        {doc.fileName}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </If>

          {selectedDoc ? (
            <DocumentViewer
              document={selectedDoc}
              zoom={zoom}
              rotation={rotation}
              fileExtension={fileExtension}
            />
          ) : (
            <p className="flex items-center justify-center text-white">
              No document selected
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DocumentViewer({
  document,
  zoom = 100,
  rotation = 0,
  fileExtension,
  onDownload,
}: {
  document: DocumentInfo;
  zoom?: number;
  rotation?: number;
  fileExtension?: string;
  onDownload?: () => void;
}) {
  const {
    data: documentUrl,
    isLoading,
    error,
    refetch,
  } = useFetchSignedUrl(document.filePath!, !!document.filePath);

  const renderDocumentViewer = () => {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin" />
            <p className="text-white">Loading document...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
          <FileX2 className="size-16 text-white" />
          <p className="text-lg font-semibold">Error!</p>
          <p className="max-w-md text-sm text-white">
            {error.message ?? "Failed to load document"}
          </p>
          <Button variant={"outline"} size={"sm"} onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      );
    }

    if (!documentUrl) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <EyeOff className="size-16 text-white" />
          <p className="font-semibold text-white">Document Not Available</p>
        </div>
      );
    }

    const viewerStyle = {
      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
      transformOrigin: "center center",
      transition: "transform 0.3s ease",
    };

    if (fileExtension === "pdf") {
      return (
        <div className="relative h-full w-full">
          <iframe
            src={`${documentUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="h-full w-full border-0"
            title={document.fileName ?? undefined}
            style={viewerStyle}
          />
        </div>
      );
    }

    if (
      ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(
        fileExtension || ""
      )
    ) {
      return (
        <div className="flex h-full items-center justify-center overflow-hidden">
          <div className="flex items-center justify-center" style={viewerStyle}>
            <img
              src={documentUrl}
              alt={document.fileName ?? undefined}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          </div>
        </div>
      );
    }

    if (["txt", "csv", "json", "xml"].includes(fileExtension || "")) {
      return (
        <div className="relative h-full w-full">
          <iframe
            src={documentUrl}
            className="h-full w-full border-0"
            title={document.fileName ?? undefined}
            style={viewerStyle}
            sandbox="allow-same-origin"
          />
        </div>
      );
    }

    // Fallback for unsupported file types
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <FileIcon className="size-16 text-white" />
        <p className="text-lg font-semibold">Preview not available</p>
        <p className="max-w-md text-sm text-white">
          The file <span className="font-medium">({document.fileName})</span>{" "}
          cannot be previewed in the browser. Please download it to view its
          contents.
        </p>

        <Button
          type="button"
          variant={"outline"}
          size={"sm"}
          onClick={onDownload}
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
