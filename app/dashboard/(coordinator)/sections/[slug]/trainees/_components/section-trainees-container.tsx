"use client";

import React from "react";
import Link from "next/link";

import { Row } from "@tanstack/react-table";
import { PlusCircle } from "lucide-react";
import * as motion from "motion/react-client";

import pathsConfig from "@/config/paths.config";
import {
  TraineeWithUserAndHours,
  useFetchSectionTrainees,
} from "@/hooks/use-section-trainees";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import { traineeColumns } from "./trainees-columns";
import { TraineesTableRowActions } from "./trainees-table-row-actions";
import { TraineesTableToolbar } from "./trainees-table-toolbar";

export default function SectionTraineesContainer(params: { slug: string }) {
  const { data = [], isLoading } = useFetchSectionTrainees(params.slug);

  if (isLoading) {
    return <LoadingOverlay fullPage />;
  }

  const columnsWithActions = traineeColumns.map((column) => {
    if (column.id === "actions") {
      return {
        ...column,
        cell: ({ row }: { row: Row<TraineeWithUserAndHours> }) => (
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
          <motion.button whileTap={{ scale: 0.85 }}>
            <Link
              href={pathsConfig.dynamic.addSectionTrainees(params.slug)}
              className="inline-flex items-center gap-2"
            >
              <PlusCircle className="size-4" />
              Add Students
            </Link>
          </motion.button>
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
