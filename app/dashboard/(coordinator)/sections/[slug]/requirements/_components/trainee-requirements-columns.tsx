"use client";

import { ColumnDef } from "@tanstack/react-table";

import { TraineeWithRequirementsAndInternship } from "@/hooks/use-batch-requirements";

import { DocumentStatus, getDocumentStatusConfig } from "@/lib/constants";

import { BatchRequirementsWithCompliance } from "@/schemas/requirements-tracker/batch-requirements-with-compliance";

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
            className="block max-w-32 truncate lg:max-w-none"
            title={fullName}
          >
            {fullName}
          </span>
        );
      },
      enableHiding: false,
      enableSorting: false,
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
            <div className="flex flex-col gap-1">
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
    {
      id: "requirements",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={`Requirements (${requirementTypes.length} total)`}
        />
      ),
      cell: ({ row }) => {
        const trainee = row.original;

        const documents = requirementTypes.map((reqType) => {
          const submittedReq = trainee.requirements?.find(
            (req) => req.requirement_name === reqType.name
          );

          if (submittedReq && submittedReq.submitted_at !== null) {
            const latestHistory = submittedReq.history?.length
              ? [...submittedReq.history].sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )[0]
              : null;
            return (
              latestHistory?.document_status ||
              submittedReq.status ||
              "not submitted"
            );
          } else {
            return "not submitted";
          }
        });

        const statusCounts = {
          approved: documents.filter((status) => status === "approved").length,
          rejected: documents.filter((status) => status === "rejected").length,
          pending: documents.filter((status) => status === "pending").length,
          missing: documents.filter((status) => status === "not submitted")
            .length,
        };

        return (
          <div className="flex flex-wrap items-center gap-2">
            {statusCounts.approved > 0 && (
              <Badge
                className={`${getDocumentStatusConfig("approved")?.badgeColor}`}
              >
                <span className="font-semibold">{statusCounts.approved}</span>
                <span className="ml-1 text-xs">Approved</span>
              </Badge>
            )}

            {statusCounts.pending > 0 && (
              <Badge
                className={`${getDocumentStatusConfig("pending")?.badgeColor}`}
              >
                <span className="font-semibold">{statusCounts.pending}</span>
                <span className="ml-1 text-xs">Pending</span>
              </Badge>
            )}

            {statusCounts.rejected > 0 && (
              <Badge
                className={`${getDocumentStatusConfig("rejected")?.badgeColor}`}
              >
                <span className="font-semibold">{statusCounts.rejected}</span>
                <span className="ml-1 text-xs">Rejected</span>
              </Badge>
            )}

            {statusCounts.missing > 0 && (
              <Badge
                className={`${getDocumentStatusConfig("not submitted")?.badgeColor}`}
              >
                <span className="font-semibold">{statusCounts.missing}</span>
                <span className="ml-1 text-xs">Missing</span>
              </Badge>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const trainee = row.original;

        const documents = requirementTypes.map((reqType) => {
          const submittedReq = trainee.requirements?.find(
            (req) => req.requirement_name === reqType.name
          );

          if (submittedReq && submittedReq.submitted_at !== null) {
            const latestHistory = submittedReq.history?.length
              ? [...submittedReq.history].sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )[0]
              : null;
            return {
              id: submittedReq.id,
              requirementName: reqType.name!,
              status: (latestHistory?.document_status ||
                submittedReq.status) as DocumentStatus,
              filePath: submittedReq.file_path,
              fileName: submittedReq.file_name,
              fileSize: submittedReq.file_size?.toString() || null,
              submittedDate: submittedReq.submitted_at,
            };
          } else {
            return {
              id: reqType.id!,
              requirementName: reqType.name!,
              status: "not submitted" as DocumentStatus,
              filePath: null,
              fileName: null,
              fileSize: null,
              submittedDate: null,
            };
          }
        });

        return (
          <DocumentStatusCell
            slug={slug}
            studentName={`${trainee.last_name}, ${trainee.first_name}`}
            documents={documents}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
};

export const traineeRequirementColumns = createTraineeRequirementColumns(
  [],
  ""
);
