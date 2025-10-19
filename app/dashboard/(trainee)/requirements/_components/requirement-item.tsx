"use client";

import { useState } from "react";

import { formatDate } from "date-fns";
import {
  ChevronUp,
  Download,
  FileText,
  History,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { DocumentStatus, getDocumentStatusConfig } from "@/lib/constants";

import { formatFileSize } from "@/utils/shared";
import { useSupabase } from "@/utils/supabase/hooks/use-supabase";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { If } from "@/components/sumikapp/if";

import FileOptions from "./file-options";

const DEFAULT_FILE_CONSTRAINTS = {
  allowedTypes: [".pdf"],
  maxSizeBytes: 50 * 1024 * 1024, // 50MB in bytes
};

export default function RequirementItem({
  title,
  requirement,
}: {
  title: string;
  requirement: {
    id: string;
    requirement_name: string;
    requirement_description: string | null;
    file_name?: string | null;
    file_size?: number | null;
    submitted_at?: string | null;
    status: DocumentStatus;
    allowed_file_types?: string[] | null;
    max_file_size_bytes?: number | null;
    template_file_name?: string | null;
    template_file_path?: string | null;
    history: {
      id: string;
      document_id: string;
      document_status: DocumentStatus;
      title: string;
      description: string;
      date: Date;
    }[];
  };
}) {
  const supabase = useSupabase();
  const [open, setOpen] = useState(false);

  const historyItems = requirement.history ?? [];
  const latest =
    historyItems.length > 0 ? historyItems[historyItems.length - 1] : null;

  const StatusIcon = getDocumentStatusConfig(requirement.status).icon;
  const TextColor = getDocumentStatusConfig(requirement.status).textColor;

  const allowedTypes =
    requirement.allowed_file_types || DEFAULT_FILE_CONSTRAINTS.allowedTypes;
  const maxSizeBytes =
    requirement.max_file_size_bytes || DEFAULT_FILE_CONSTRAINTS.maxSizeBytes;

  const handleDownloadTemplate = async () => {
    if (requirement.template_file_path) {
      try {
        const { data, error } = await supabase.storage
          .from("requirement-templates")
          .download(requirement.template_file_path);

        if (error) {
          toast.error("Failed to download template.");
          console.error("Error downloading template:", error);
          return;
        }

        const url = URL.createObjectURL(data);
        const link = document.createElement("a");
        link.href = url;
        link.download = requirement.template_file_name || "template";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Failed to download template:", err);
      }
    }
  };

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="border first:rounded-t-xl last:rounded-b-xl"
    >
      <div className="bg-muted/30 flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3 sm:items-center">
            <FileText className="size-5 shrink-0" />
            <div className="w-full min-w-0">
              <h3
                className="line-clamp-2 block leading-tight font-medium capitalize sm:line-clamp-1"
                title={title}
              >
                {title}
              </h3>
              <p className="text-muted-foreground line-clamp-2 text-sm sm:line-clamp-1">
                {requirement.requirement_description}
              </p>
            </div>
          </div>
          <p className="text-muted-foreground pl-8 text-xs">
            Accepted file types:{" "}
            <span className="text-foreground font-medium">
              {allowedTypes.join(", ")}
            </span>{" "}
            &bull; Max size:{" "}
            <span className="text-foreground font-medium">
              {formatFileSize(maxSizeBytes)}
            </span>
          </p>

          <If
            condition={
              requirement.template_file_path !== null &&
              requirement.template_file_path !== undefined
            }
          >
            <div className="pl-8">
              <Button
                variant={"outline"}
                onClick={handleDownloadTemplate}
                className="gap-2 px-2 text-xs has-[>svg]:px-2"
              >
                <Download className="size-4" />
                Download Template
              </Button>
            </div>
          </If>
        </div>

        <div className="flex items-center justify-between gap-2">
          <FileOptions
            id={requirement.id}
            requirement_name={requirement.requirement_name}
            status={requirement.status}
            file_type={requirement.allowed_file_types}
            file_name={requirement.file_name}
            file_size={requirement.file_size}
          />

          <If condition={historyItems.length > 0}>
            <CollapsibleTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon-sm"}
                aria-label="Toggle collapsible"
              >
                <ChevronUp
                  className={`scale-125 transition-transform duration-200 ${
                    open ? "rotate-0" : "rotate-180"
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
          </If>
        </div>
      </div>

      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down flex flex-col gap-2 overflow-hidden transition-all duration-300">
        <If condition={historyItems.length > 0}>
          <div className="bg-muted/30 space-y-4 border-y p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <History className="size-4" />
              Submission History
            </p>
            <div className="space-y-3">
              {historyItems.map((item) => {
                const config = getDocumentStatusConfig(item.document_status);
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4"
                  >
                    <div className="text-muted-foreground shrink-0 text-xs sm:text-sm">
                      {formatDate(item.date, "PPpp")}
                    </div>
                    <div className="flex flex-col">
                      <Badge className={config.badgeColor}>
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
      </CollapsibleContent>

      <div className="flex flex-col items-start justify-between gap-2 px-4 py-3 sm:flex-row sm:items-center">
        <div
          className={`flex items-center gap-1.5 ${
            requirement.status === "not submitted"
              ? "text-destructive"
              : TextColor
          }`}
        >
          <If
            condition={requirement.status === "not submitted"}
            fallback={<StatusIcon className="size-4" />}
          >
            <TriangleAlert className="size-4" />
          </If>
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
    </Collapsible>
  );
}
