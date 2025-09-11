import React from "react";

import { CircleQuestionMark } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CompletionProgressBar({
  value = "0",
}: {
  value: string;
}) {
  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Completion Progress</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleQuestionMark className="size-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Progress is based on approved documents only. Pending or
                rejected submissions are not counted until they receive final
                approval.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <span className="text-sm font-medium">{value}%</span>
      </div>
      <Progress value={parseInt(value)} />
    </>
  );
}
