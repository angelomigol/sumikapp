import React from "react";

import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function DashboardStatsCard(props: {
  title: string;
  icon?: React.ElementType;
  tooltip: string;
  data?: {
    main: string | number;
    sub?: string;
  };
}) {
  return (
    <Card className={cn("gap-2 py-3")}>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          {props.icon && <props.icon className="size-4" />}
          {props.title}
        </CardTitle>
        <Tooltip>
          <TooltipTrigger>
            <Info className="text-muted-foreground size-4" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{props.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{props.data?.main}</div>
        <p className="text-muted-foreground text-xs">{props.data?.sub}</p>
      </CardContent>
    </Card>
  );
}
