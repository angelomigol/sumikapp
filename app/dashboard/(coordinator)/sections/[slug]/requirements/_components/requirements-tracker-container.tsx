"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import { IconUserOff } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";

import pathsConfig from "@/config/paths.config";
import {
  TraineeWithRequirements,
  useFetchBatchRequirements,
  useFetchTraineeRequirements,
} from "@/hooks/use-batch-requirements";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
import RefreshButton from "@/components/sumikapp/refresh-button";

import NotFoundPage from "@/app/not-found";

import AddEditCustomRequirementSheet from "./add-edit-custom-requirement-sheet";
import CustomRequirementRowActions from "./custom-requirements-row-actions";
import NewDocumentViewerModal from "./new-document-viewer-modal";
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
    allowedFileTypes: string[];
    maxFileSizeBytes: number;
    filePath: string;
    fileName: string;
  } | null>(null);
  const [requirementDialogOpen, setRequirementDialogOpen] = useState(false);

  const {
    data: batchReqs = [],
    isLoading: batchReqsLoading,
    error: batchReqsError,
  } = useFetchBatchRequirements(params.slug);

  const {
    data: traineeData = [],
    isLoading: traineeDataLoading,
    refetch: traineeTableRefetch,
    isFetching: traineeTableIsFetching,
  } = useFetchTraineeRequirements(params.slug);

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
    allowedFileTypes: string[];
    maxFileSizeBytes: number;
    filePath: string;
    fileName: string;
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

        <If condition={batchReqs.length > 0 || traineeData.length > 0}>
          <AddEditCustomRequirementSheet
            open={requirementDialogOpen}
            setOpen={setRequirementDialogOpen}
            editingRequirement={selectedRequirement}
            slug={params.slug}
            handleAdd={() => setSelectedRequirement(null)}
          />
        </If>
      </div>

      <If
        condition={batchReqs.length > 0 || traineeData.length > 0}
        fallback={
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant={"icon"}>
                <IconUserOff />
              </EmptyMedia>
              <EmptyTitle>No Students Yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t added any students in this section. Get started
                by adding your students first.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-2">
                <Button asChild>
                  <Link
                    href={pathsConfig.dynamic.addSectionTrainees(params.slug)}
                  >
                    Add Student
                  </Link>
                </Button>
              </div>
            </EmptyContent>
          </Empty>
        }
      >
        <Card className="max-h-[300px] overflow-hidden">
          <CardHeader>
            <CardTitle>List of Requirements</CardTitle>
            <CardDescription>
              Manage the list of custom and default requirements for this
              section.
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
                              allowedFileTypes: item.allowed_file_types ?? [],
                              maxFileSizeBytes: item.max_file_size_bytes ?? 0,
                              filePath: item.template_file_path ?? "",
                              fileName: item.template_file_name ?? "",
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

        <div className="flex flex-col gap-2">
          <div className="flex justify-end">
            <RefreshButton
              refetch={traineeTableRefetch}
              isFetching={traineeTableIsFetching}
            />
          </div>

          {columns.length > 0 && (
            <DataTable
              data={traineeData}
              columns={columns}
              Toolbar={RequirementTableToolbar}
            />
          )}
        </div>
      </If>

      {/* <NewDocumentViewerModal isOpen={true} /> */}
    </>
  );
}
