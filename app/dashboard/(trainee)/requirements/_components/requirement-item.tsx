"use client";

import { useState } from "react";

import { formatDate } from "date-fns";
import { ChevronUp, FileText, History, TriangleAlert } from "lucide-react";

import { DocumentStatus, getDocumentStatusConfig } from "@/lib/constants";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { If } from "@/components/sumikapp/if";

import FileOptions from "./file-options";

export default function RequirementItem({
  title,
  requirement,
}: {
  title: string;
  requirement: {
    id: string;
    requirement_name: string;
    requirement_description?: string | null;
    file_name?: string | null;
    file_size?: number | null;
    file_type?: string | null;
    submitted_at?: string | null;
    status: DocumentStatus;
    history: {
      id: string;
      document_id: string;
      status: DocumentStatus;
      title: string;
      description: string;
      date: Date;
    }[];
  };
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const historyItems = requirement.history ?? [];

  // Get latest history
  const latest =
    historyItems.length > 0 ? historyItems[historyItems.length - 1] : null;

  const StatusIcon = getDocumentStatusConfig(requirement.status).icon;
  const TextColor = getDocumentStatusConfig(requirement.status).textColor;

  return (
    <div className="border first:rounded-t-xl last:rounded-b-xl">
      <div className="bg-muted/30 flex flex-col items-start justify-between gap-2 border-b p-4 md:flex-row md:items-center md:gap-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <FileText className="size-5" />
            <h3 className="font-medium capitalize">{title}</h3>
          </div>
          <p className="text-muted-foreground pl-8 text-xs">
            Accepted file types:{" "}
            <span className="text-foreground font-medium">.pdf</span> &bull; Max
            size: <span className="text-foreground font-medium">50MB</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FileOptions
            id={requirement.id}
            requirement_name={requirement.requirement_name}
            status={requirement.status}
            file_name={requirement.file_name}
            file_size={requirement.file_size}
            file_type={requirement.file_type}
          />

          <If condition={historyItems.length > 0}>
            <Button
              variant={"ghost"}
              size={"sm"}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronUp
                className={`scale-125 transition-transform duration-200 ${
                  isExpanded ? "rotate-0" : "rotate-180"
                }`}
              />
            </Button>
          </If>
        </div>
      </div>

      <If condition={isExpanded && historyItems.length > 0}>
        <div className="bg-muted/30 space-y-4 border-y p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <History className="size-4" />
            Submission History
          </p>
          <div className="space-y-3">
            {historyItems.map((item) => {
              const config = getDocumentStatusConfig(item.status);
              return (
                <div key={item.id} className="flex gap-4">
                  <div className="text-muted-foreground max-w-xl text-sm leading-none">
                    {formatDate(item.date, "PPpp")}
                  </div>
                  <div className="flex flex-col">
                    <Badge className={`${config.badgeColor}`}>
                      <config.icon />
                      {config.label}
                    </Badge>
                    <p className="mt-1 text-sm">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </If>

      <div className="flex items-center justify-between px-4 py-2">
        <div
          className={`flex items-center gap-1.5 ${requirement.status === "not submitted" ? "text-destructive" : TextColor}`}
        >
          {requirement.status === "not submitted" ? (
            <TriangleAlert className="size-4" />
          ) : (
            <StatusIcon className="size-4" />
          )}
          <span className="text-sm font-medium capitalize">
            {requirement.status === "not submitted"
              ? "Required"
              : requirement.status}
          </span>
        </div>

        <If condition={latest !== null}>
          <div className="text-xs">
            Last updated: {latest && formatDate(latest.date, "PPpp")}
          </div>
        </If>
      </div>
    </div>
  );
}
