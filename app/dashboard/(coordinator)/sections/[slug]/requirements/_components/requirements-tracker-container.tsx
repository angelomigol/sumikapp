"use client";

import React, { useEffect, useState } from "react";

import { ColumnDef } from "@tanstack/react-table";

import {
  TraineeWithRequirements,
  useFetchBatchRequirements,
  useFetchTraineeRequirements,
} from "@/hooks/use-batch-requirements";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTable } from "@/components/data-table";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import NotFoundPage from "@/app/not-found";

import AddCustomRequirementDialog from "./add-edit-custom-requirement-dialog";
import CustomRequirementRowActions from "./custom-requirements-row-actions";
import { RequirementTableToolbar } from "./requirements-table-toolbar";
import { createTraineeRequirementColumns } from "./trainee-requirements-columns";

export default function RequirementsTrackerContainer(params: { slug: string }) {
  const [columns, setColumns] = useState<ColumnDef<TraineeWithRequirements>[]>(
    []
  );
  const [selectedRequirement, setSelectedRequirement] = useState<{
    id: string;
    name: string;
    description: string;
  } | null>(null);
  const [requirementDialogOpen, setRequirementDialogOpen] = useState(false);

  const {
    data: batchReqs = [],
    isLoading: batchReqsLoading,
    error: batchReqsError,
  } = useFetchBatchRequirements(params.slug);

  const { data: traineeData = [], isLoading: traineeDataLoading } =
    useFetchTraineeRequirements(params.slug);

  useEffect(() => {
    if (batchReqs && batchReqs.length > 0) {
      const generatedColumns = createTraineeRequirementColumns(
        batchReqs,
        params.slug
      );
      setColumns(generatedColumns);
    }
  }, [batchReqs]);

  const handleEdit = (requirement: {
    id: string;
    name: string;
    description: string;
  }) => {
    setSelectedRequirement(requirement);
    setRequirementDialogOpen(true);
  };

  if (batchReqsLoading || traineeDataLoading || batchReqsError) {
    return <LoadingOverlay fullPage />;
  }

  if (!params.slug) {
    return <NotFoundPage />;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <PageTitle text={"Requirements Tracker"} />

        <AddCustomRequirementDialog
          open={requirementDialogOpen}
          setOpen={setRequirementDialogOpen}
          editingRequirement={selectedRequirement}
          handleAdd={() => setSelectedRequirement(null)}
          slug={params.slug}
        />
      </div>

      <Card className="max-h-[300px] overflow-hidden">
        <CardHeader>
          <CardTitle>List of Requirements</CardTitle>
          <CardDescription>
            Manage the list of custom and default requirements for this section.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requirement</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batchReqs.map((item) => (
                <TableRow key={item.requirement_type_id}>
                  <TableCell className="max-w-[200px]">
                    <p className="font-medium">{item.requirement_name}</p>
                    <p className="text-muted-foreground truncate text-sm">
                      {item.requirement_description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>
                          {item.submitted_count}/{item.total_trainees}
                        </span>
                        <span>
                          {Math.round(item.compliance_percentage ?? 0)}%
                        </span>
                      </div>
                      <Progress
                        value={item.compliance_percentage}
                        className="h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <If condition={!item.is_predefined}>
                      <CustomRequirementRowActions
                        id={item.requirement_type_id}
                        name={item.requirement_name}
                        handleEdit={() =>
                          handleEdit({
                            id: item.requirement_type_id ?? "",
                            name: item.requirement_name ?? "",
                            description: item.requirement_description ?? "",
                          })
                        }
                        slug={params.slug}
                      />
                    </If>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {columns.length > 0 && (
        <DataTable
          data={traineeData}
          columns={columns}
          Toolbar={RequirementTableToolbar}
        />
      )}
    </>
  );
}
