import React from "react";

import { HelpCircle, TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function UserStatsCard(
  props: React.PropsWithChildren<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    help: string;
    trend?: {
      value: string | number;
      isPositive: boolean;
    };
  }>
) {
  return (
    <Card className={cn("gap-4 py-4")}>
      <CardHeader
        className={cn("flex flex-row items-center justify-between py-0")}
      >
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <props.icon className="size-4" />
          {props.title ?? ""}
        </CardTitle>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="text-muted-foreground size-4" />
          </TooltipTrigger>
          <TooltipContent>{props.help}</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-2xl font-bold">
          {props.value}
          {typeof props.trend?.value === "number" && props.trend.value > 0 && (
            <Badge
              className={`${props.trend.isPositive ? "bg-green-3 text-green-11" : "bg-red-3 text-red-11"}`}
            >
              {props.trend.isPositive ? (
                <TrendingUp className="size-4" />
              ) : (
                <TrendingDown className="size-4" />
              )}
              {props.trend.value}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
