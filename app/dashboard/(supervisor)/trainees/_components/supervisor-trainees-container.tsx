"use client";

import React from "react";

import { useFetchSupervisorTrainees } from "@/hooks/use-supervisor-trainees";

import { DataTable } from "@/components/data-table";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import NotFoundPage from "@/app/not-found";

import { traineeColumns } from "./trainees-columns";
import { TraineesTableToolbar } from "./trainees-table-toolbar";

export default function SupervisorTraineesContainer() {
  const trainees = useFetchSupervisorTrainees();

  if (trainees.isLoading) {
    return <LoadingOverlay fullPage />;
  }

  if (!trainees.data) {
    return <NotFoundPage />;
  }

  return (
    <>
      <PageTitle text={"OJT Trainee List"} />

      <DataTable
        data={trainees.data}
        columns={traineeColumns}
        Toolbar={TraineesTableToolbar}
      />
    </>
  );
}
