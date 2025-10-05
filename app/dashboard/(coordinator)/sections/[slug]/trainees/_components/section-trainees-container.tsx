"use client";

import React from "react";
import Link from "next/link";

import { PlusCircle } from "lucide-react";

import pathsConfig from "@/config/paths.config";
import { useFetchSectionTrainees } from "@/hooks/use-section-trainees";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import { traineeColumns } from "./trainees-columns";
import { TraineesTableRowActions } from "./trainees-table-row-actions";
import { TraineesTableToolbar } from "./trainees-table-toolbar";

export default function SectionTraineesContainer(params: { slug: string }) {
  const { data = [], isLoading, error } = useFetchSectionTrainees(params.slug);

  if (isLoading) {
    return <LoadingOverlay fullPage />;
  }

  const columnsWithActions = traineeColumns.map((column) => {
    if (column.id === "actions") {
      return {
        ...column,
        cell: ({ row }: any) => (
          <TraineesTableRowActions slug={params.slug} row={row} />
        ),
      };
    }
    return column;
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <PageTitle text={"OJT Trainee List"} />

        <Button size={"sm"} asChild>
          <Link href={pathsConfig.dynamic.addSectionTrainees(params.slug)}>
            <PlusCircle className="size-4" />
            Add Students
          </Link>
        </Button>
      </div>

      <DataTable
        data={data}
        columns={columnsWithActions}
        Toolbar={TraineesTableToolbar}
      />
    </>
  );
}
