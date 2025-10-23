"use client";

import React, { useState } from "react";

import { Row } from "@tanstack/react-table";
import { se } from "date-fns/locale";

import { useFetchPredefRequirements } from "@/hooks/use-predefined-requirements";

import { Tables } from "@/utils/supabase/supabase.types";

import { DataTable } from "@/components/data-table";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import AddEditPredefRequirementSheet from "./add-edit-predef-requirement-sheet";
import { PredefRequirementsTableToolbar } from "./predef-requirement-table-toolbar";
import { PreDefRequirementsColumns } from "./predef-requirements-columns";
import { PredefRequirementsTableRowActions } from "./predef-requirements-table-row-actions";

export default function PredefinedRequirementsContainer() {
  const [open, setOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<{
    id: string;
    name: string;
    description: string;
    allowedFileTypes: string[];
    maxFileSizeBytes: number;
    filePath: string;
    fileName: string;
  } | null>(null);

  const { data = [], isLoading } = useFetchPredefRequirements();

  const handleEdit = (requirement: {
    id: string;
    name: string;
    description: string;
    allowedFileTypes: string[];
    maxFileSizeBytes: number;
    filePath: string;
    fileName: string;
  }) => {
    setSelectedRequirement(requirement);
    setOpen(true);
  };

  if (isLoading) {
    return <LoadingOverlay fullPage />;
  }

  const columnsWithActions = PreDefRequirementsColumns.map((column) => {
    if (column.id === "actions") {
      return {
        ...column,
        cell: ({ row }: { row: Row<Tables<"requirement_types">> }) => (
          <PredefRequirementsTableRowActions
            id={row.original.id}
            name={row.original.name}
            handleEdit={() =>
              handleEdit({
                id: row.original.id ?? "",
                name: row.original.name ?? "",
                description: row.original.description ?? "",
                allowedFileTypes: row.original.allowed_file_types ?? [],
                maxFileSizeBytes: row.original.max_file_size_bytes ?? 0,
                filePath: row.original.template_file_path ?? "",
                fileName: row.original.template_file_name ?? "",
              })
            }
          />
        ),
      };
    }
    return column;
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <PageTitle text={"Requirements"} />

        <AddEditPredefRequirementSheet
          open={open}
          setOpen={setOpen}
          editingRequirement={selectedRequirement}
          handleAdd={() => setSelectedRequirement(null)}
        />
      </div>

      <DataTable
        data={data}
        columns={columnsWithActions}
        Toolbar={PredefRequirementsTableToolbar}
      />
    </>
  );
}
