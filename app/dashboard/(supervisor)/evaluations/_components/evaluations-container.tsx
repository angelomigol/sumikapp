"use client";

import React from "react";

import { useFetchTraineesForEvaluation } from "@/hooks/use-supervisor-trainees";

import { DataTable } from "@/components/data-table";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import { evaluationColumns } from "./evaluations-columns";
import { EvaluationsTableToolbar } from "./evaluations-table-toolbar";

export default function EvaluationsContainer() {
  const { data = [], isLoading } = useFetchTraineesForEvaluation();

  if (isLoading) {
    return <LoadingOverlay fullPage />;
  }

  return (
    <>
      <div>
        <PageTitle text={"Trainee Evaluations"} />
        <p className="text-muted-foreground text-sm">
          {`Evaluate your trainees' overall performance during their OJT.`}
        </p>
      </div>

      <DataTable
        data={data}
        columns={evaluationColumns}
        Toolbar={EvaluationsTableToolbar}
      />
    </>
  );
}
