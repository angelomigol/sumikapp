"use client";

import { ColumnDef } from "@tanstack/react-table";

import {
  TraineeWithRequirements,
  TraineeWithRequirementsAndInternship,
} from "@/hooks/use-batch-requirements";

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
          <span className="max-w-20 truncate lg:max-w-32">{fullName}</span>
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
    // {
    //   accessorFn: (row) => {
    //     if (!row.requirements || !Array.isArray(row.requirements)) {
    //       return requirementTypes.length;
    //     }
    //     const submittedRequirementNames = new Set(
    //       row.requirements.map((req) => req.requirement_name)
    //     );
    //     return requirementTypes.length - submittedRequirementNames.size;
    //   },
    //   id: "completion",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Completion" />
    //   ),
    //   cell: ({ row }) => {
    //     const trainee = row.original;

    //     const missingCount = (() => {
    //       if (!trainee.requirements || !Array.isArray(trainee.requirements)) {
    //         return requirementTypes.length;
    //       }
    //       const submittedRequirementNames = new Set(
    //         trainee.requirements.map((req) => req.requirement_name)
    //       );
    //       return requirementTypes.length - submittedRequirementNames.size;
    //     })();

    //     // Determine status
    //     let status;
    //     let badgeColor;

    //     if (missingCount === 0) {
    //       status = "Complete";
    //       badgeColor = "bg-green-3 text-green-11";
    //     } else if (missingCount === requirementTypes.length) {
    //       status = "No Submissions";
    //       badgeColor = "bg-red-3 text-red-11";
    //     } else {
    //       status = "Incomplete";
    //       badgeColor = "bg-amber-3 text-amber-11";
    //     }

    //     return (
    //       <div className="flex flex-col items-center justify-center gap-1">
    //         <Badge className={badgeColor}>{status}</Badge>
    //         <span className="text-xs text-gray-500">
    //           {requirementTypes.length - missingCount}/{requirementTypes.length}{" "}
    //           submitted
    //         </span>
    //       </div>
    //     );
    //   },
    //   enableSorting: false,
    // },
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

        return <InternshipStatusCell internship_details={internship} />;
      },
      enableSorting: false,
    },
    ...requirementTypes.map((reqType) => ({
      accessorKey: reqType.name,
      header: ({ column }: { column: any }) => (
        <DataTableColumnHeader
          column={column}
          title={`${reqType.name
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}`}
        />
      ),
      cell: ({ row }: { row: any }) => {
        const trainee = row.original as TraineeWithRequirements;
        const documents: Record<string, any> = {};

        // Create a mapping of requirement names to their status
        if (trainee.requirements && Array.isArray(trainee.requirements)) {
          trainee.requirements.forEach((req) => {
            // Get the latest history entry for this requirement
            const latestHistory = req.history?.length
              ? req.history.sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )[0]
              : null;

            documents[req.requirement_name] = {
              id: req.id,
              status:
                latestHistory?.document_status || req.status || "not submitted",
              filePath: req.file_path,
              fileName: req.file_name,
              fileSize: req.file_size,
              fileType: req.file_type,
              submitted: req.submitted_at,
            };
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
