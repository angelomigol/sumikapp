"use client";

import Link from "next/link";

import { Row } from "@tanstack/react-table";

import pathsConfig from "@/config/paths.config";
import { SupervisorTraineesForEvaluationTable } from "@/hooks/use-supervisor-trainees";

import { Button } from "@/components/ui/button";

interface EvaluationsTableRowActionsProps {
  row: Row<SupervisorTraineesForEvaluationTable>;
}

export function EvaluationsTableRowActions({
  row,
}: EvaluationsTableRowActionsProps) {
  return (
    <Button
      asChild
      size={"sm"}
      className="text-primary-foreground cursor-pointer bg-green-600 shadow-xs hover:bg-green-600/90"
    >
      <Link href={pathsConfig.dynamic.evaluteTrainee(row.original.trainee_id)}>
        Evaluate
      </Link>
    </Button>
  );
}
