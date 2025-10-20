"use client";

import { useState } from "react";

import { IconEye } from "@tabler/icons-react";

import { DocumentStatus } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import NewDocumentViewerModal from "./new-document-viewer-modal";

export const DocumentStatusCell = ({
  studentName,
  slug,
  documents,
}: {
  studentName: string;
  slug: string;
  documents: Array<{
    id: string;
    requirementName: string;
    status: DocumentStatus;
    filePath: string | null;
    fileName: string | null;
    fileSize: string | null;
    submittedDate: string | null;
  }>;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => setIsModalOpen(true)}
          >
            <IconEye />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View</p>
        </TooltipContent>
      </Tooltip>

      {isModalOpen && (
        <NewDocumentViewerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          studentName={studentName}
          documents={documents}
          slug={slug}
        />
      )}
    </div>
  );
};
