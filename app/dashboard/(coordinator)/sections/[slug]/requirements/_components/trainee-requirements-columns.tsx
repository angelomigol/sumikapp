"use client";

import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { TraineeWithRequirementsAndInternship } from "@/hooks/use-batch-requirements";

import { getDocumentStatusConfig } from "@/lib/constants";

import { BatchRequirementsWithCompliance } from "@/schemas/batch-requirements-with-compliance";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

import { DocumentStatusCell } from "./document-status-cell";
import InternshipStatusCell from "./internship-status-cell";

export const createTraineeRequirementColumns = (
  batchRequirements: BatchRequirementsWithCompliance[],
  slug: string
): ColumnDef<TraineeWithRequirementsAndInternship>[] => {
  const requirementTypes = batchRequirements
    .filter((req) => req.requirement_name)
    .map((req) => ({
      id: req.requirement_type_id!,
      name: req.requirement_name!,
      description: req.requirement_description,
      is_mandatory: req.is_mandatory || false,
    }))
    .filter(
      (req, index, self) => index === self.findIndex((r) => r.id === req.id)
    );

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: {
        sticky: "left",
        stickyOffset: 0,
      },
    },
    {
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      id: "fullName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const trainee = row.original;
        const fullName = `${trainee.last_name}, ${trainee.first_name} ${
          trainee.middle_name ? trainee.middle_name + " " : ""
        }`;
        return (
          <span
            className="block max-w-20 truncate lg:max-w-32"
            title={fullName}
          >
            {fullName}
          </span>
        );
      },
      enableHiding: false,
      enableSorting: false,
      size: 220,
      meta: {
        sticky: "left",
        stickyOffset: 50,
      },
    },
    {
      accessorFn: (row) => row.internship_details?.status || "not submitted",
      id: "internship",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Internship Details" />
      ),
      cell: ({ row }) => {
        const trainee = row.original;
        const internship = trainee.internship_details;

        if (!internship) {
          const config = getDocumentStatusConfig("not submitted");
          return (
            <div className="flex flex-col items-center justify-center gap-1">
              <Badge className={config.badgeColor}>{config.label}</Badge>
              <span className="text-xs text-gray-500">
                No internship details
              </span>
            </div>
          );
        }

        return (
          <InternshipStatusCell internship_details={internship} slug={slug} />
        );
      },
      enableSorting: false,
    },
    ...requirementTypes.map((reqType) => ({
      accessorKey: reqType.name,
      header: ({
        column,
      }: HeaderContext<TraineeWithRequirementsAndInternship, unknown>) => (
        <DataTableColumnHeader
          column={column}
          title={reqType.name
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        />
      ),
      cell: ({
        row,
      }: {
        row: { original: TraineeWithRequirementsAndInternship };
      }) => {
        const trainee = row.original;
        const documents: Record<
          string,
          {
            id: string;
            status: string;
            filePath: string;
            fileName: string;
            fileSize: number;
            fileType: string;
            submitted: string;
          }
        > = {};

        // Create a mapping of requirement names to their status
        if (Array.isArray(trainee.requirements)) {
          trainee.requirements.forEach((req) => {
            const latestHistory = req.history?.length
              ? [...req.history].sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )[0]
              : null;

            const status =
              latestHistory?.document_status || req.status || "not submitted";

            if (status !== "not submitted") {
              documents[req.requirement_name] = {
                id: req.id,
                status,
                filePath: req.file_path,
                fileName: req.file_name,
                fileSize: req.file_size,
                fileType: req.file_type,
                submitted: req.submitted_at,
              };
            }
          });
        }

        return (
          <DocumentStatusCell
            docInfo={documents[reqType.name] || null}
            studentName={`${trainee.last_name}, ${trainee.first_name}`}
            slug={slug}
          />
        );
      },
      enableSorting: false,
    })),
  ];
};

export const traineeRequirementColumns = createTraineeRequirementColumns(
  [],
  ""
);
