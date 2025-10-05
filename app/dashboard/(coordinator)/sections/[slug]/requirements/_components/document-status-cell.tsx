"use client";

import { useState } from "react";

import { useFetchSignedUrl, usePrefetchSignedUrl } from "@/hooks/use-document";

import { DocumentStatus } from "@/lib/constants";

import { formatFileSize } from "@/utils/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import DocumentViewerModal from "./document-viewer-modal";

export const DocumentStatusCell = ({
  docInfo,
  studentName,
  slug,
}: {
  docInfo: {
    id: string;
    status: string;
    filePath: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    submitted: string;
  } | null;
  docSubmitted?: string;
  studentName: string;
  slug: string;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!docInfo) {
    return (
      <Badge
        variant="outline"
        className="text-muted-foreground border-gray-300"
      >
        Missing
      </Badge>
    );
  }

  const prefetchSignedUrl = usePrefetchSignedUrl();
  const documentUrl = useFetchSignedUrl(
    docInfo.filePath,
    isModalOpen && !!docInfo?.filePath
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      case "not submitted":
        return "bg-gray-500 text-white";
      default:
        return "bg-amber-500 text-white";
    }
  };

  const fileSize = formatFileSize(docInfo.fileSize);

  const handlePrefetch = () => {
    if (docInfo.filePath) {
      prefetchSignedUrl(docInfo.filePath);
    }
  };

  const handleViewDocument = () => {
    if (!docInfo.filePath) return;
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex max-w-[150px] text-sm" title={docInfo.fileName}>
        <span className="truncate">{docInfo.fileName}</span>
      </div>

      <Badge className={getStatusColor(docInfo.status)}>
        {docInfo.status.charAt(0).toUpperCase() + docInfo.status.slice(1)}
      </Badge>

      <Button
        variant={"outline"}
        size={"sm"}
        className="h-7 text-xs"
        onClick={handleViewDocument}
        onMouseEnter={handlePrefetch}
        disabled={!docInfo.filePath}
      >
        {documentUrl.isLoading && isModalOpen ? "Loading..." : "View"}
      </Button>

      {isModalOpen && (
        <DocumentViewerModal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          documentUrl={documentUrl.data ?? ""}
          documentName={docInfo.fileName}
          submittedDate={docInfo.submitted}
          fileSize={fileSize}
          documentId={docInfo.id}
          studentName={studentName}
          currentStatus={docInfo.status as DocumentStatus}
          isLoading={documentUrl.isLoading}
          error={documentUrl.error?.message}
          slug={slug}
        />
      )}
    </div>
  );
};
