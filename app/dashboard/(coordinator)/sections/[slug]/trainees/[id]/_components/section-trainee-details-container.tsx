"use client";

import React from "react";

import {
  ClipboardCheck,
  Clock,
  FileCheck,
  FileClock,
  FileText,
  Target,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

import pathsConfig from "@/config/paths.config";
import { useFetchSectionTrainee } from "@/hooks/use-section-trainees";

import { getOJTStatusConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { safeFormatDate } from "@/utils/shared";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackButton from "@/components/sumikapp/back-button";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";

import AccomplishmentReportsTabContent from "@/app/dashboard/(coordinator)/sections/[slug]/trainees/[id]/_components/accomplishment-reports-tab-content";
import AttendanceReportsTabContent from "@/app/dashboard/(coordinator)/sections/[slug]/trainees/[id]/_components/attendance-reports-tab-content";

import EvaluationResultsTabContent from "./evaluation-results-tab-content";
import RequirementsTabContent from "./requirements-tab-content";

export default function SectionTraineeDetailsContainer(params: {
  traineeId: string;
  slug: string;
}) {
  const trainee = useFetchSectionTrainee({
    slug: params.slug,
    id: params.traineeId,
  });

  if (!trainee.data || trainee.isLoading) {
    return <LoadingOverlay fullPage />;
  }

  const displayName = [
    trainee.data.first_name,
    trainee.data.middle_name,
    trainee.data.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const hoursCompleted = trainee.data.hours_logged ?? 0;
  const requiredHours = trainee.data.program_batch.required_hours ?? 0;
  const remainingHours = Math.max(requiredHours - hoursCompleted, 0);
  const progress =
    requiredHours > 0 ? (hoursCompleted / requiredHours) * 100 : 0;

  return (
    <>
      <div>
        <BackButton
          title="Trainee Details"
          link={pathsConfig.dynamic.sectionTrainees(params.slug)}
        />
      </div>

      <Card className="border-none py-0 shadow-none">
        <CardContent className="px-0">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <Avatar className="relative size-20 shrink-0 rounded-3xl">
              <AvatarFallback className={cn("rounded-3xl text-2xl font-bold")}>
                {displayName.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="w-full overflow-hidden text-center md:text-left">
              <span
                className="text-sm font-semibold"
                title={trainee.data.student_id_number}
              >
                {trainee.data.student_id_number}
              </span>
              <h2
                className="w-full truncate text-[28px] leading-[34px] font-medium tracking-[-0.045rem] md:max-w-[800px]"
                title={displayName}
              >
                {displayName}
              </h2>
              <p
                className="text-muted-foreground text-sm"
                title={trainee.data.email}
              >
                {trainee.data.email}
              </p>
            </div>
            <div className="flex-end flex shrink-0 items-center gap-4">
              <Badge
                className={`${getOJTStatusConfig(trainee.data.ojt_status)?.badgeColor} capitalize`}
              >
                {trainee.data.ojt_status}
              </Badge>
            </div>
          </div>

          <If
            condition={trainee.data.internship_details}
            fallback={
              <div className="mt-10 mb-6">
                <Alert className="border-amber-11 bg-amber-3 [&>svg]:text-amber-11 rounded-2xl p-4 [&>svg]:size-5">
                  <TriangleAlert />
                  <AlertTitle>Heads up!</AlertTitle>
                  <AlertDescription className="text-foreground">
                    This student has not submitted their internship details yet.
                  </AlertDescription>
                </Alert>
              </div>
            }
          >
            <div className="grid grid-cols-2 items-start gap-12 pt-10 pb-4 md:flex md:gap-16">
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase">Section</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    {trainee.data.section}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase">Course</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    {trainee.data.course}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase">Company Name</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm font-normal">
                    {trainee.data.internship_details?.company_name}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase">Job Role</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm font-normal">
                    {trainee.data.internship_details?.job_role}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase">Duration</span>
                <div className="flex items-center gap-2">
                  {trainee.data.internship_details && (
                    <span className="text-muted-foreground text-sm font-normal">
                      {`${safeFormatDate(
                        trainee.data.internship_details.start_date,
                        "PP"
                      )} - ${safeFormatDate(
                        trainee.data.internship_details.end_date,
                        "PP"
                      )}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </If>
        </CardContent>
      </Card>
      <div className="mx-auto w-full max-w-full space-y-6 md:max-w-5xl">
        <div className="border-gray-3 relative rounded-3xl border p-6">
          <div className="bg-gray-3 absolute top-[20px] left-0 h-8 w-1 rounded-tr-md rounded-br-md" />
          <div className="mb-4 items-center justify-between md:flex">
            <div>
              <h3 className="text-xl font-bold tracking-[-0.16px]">
                Progress Overview
              </h3>
              <p className="text-muted-foreground text-sm">
                Overall progress and hours completed
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-end">
              <span className="text-muted-foreground text-sm">
                {progress.toFixed(0)}%
              </span>
            </div>
            <Progress value={progress} />
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Clock className="text-primary size-4" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Hours Completed
                  </p>
                  <p className="text-2xl font-bold">
                    {hoursCompleted.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Target className="size-4" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Required Hours
                  </p>
                  <p className="text-2xl font-bold">
                    {requiredHours.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-lg p-2">
                  <TrendingUp className="size-4" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Remaining Hours
                  </p>
                  <p className="text-2xl font-bold">
                    {remainingHours.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="att">
          <TabsList>
            <TabsTrigger value="att">
              <FileClock className="size-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="acc">
              <FileCheck className="size-4" />
              Accomplishment
            </TabsTrigger>
            <TabsTrigger value="req">
              <FileText className="size-4" />
              Requirements
            </TabsTrigger>
            <TabsTrigger value="eval">
              <ClipboardCheck className="size-4" />
              Evaluation Result
            </TabsTrigger>
          </TabsList>
          <TabsContent value="att">
            <div className="max-h-[500px] overflow-y-auto">
              <div className="border-gray-3 relative rounded-3xl border p-6">
                <div className="bg-gray-3 absolute top-[22px] left-0 h-8 w-1 rounded-tr-md rounded-br-md" />

                <div className="mb-4 items-center justify-between md:flex">
                  <h3 className="text-xl font-bold tracking-[-0.16px]">
                    Attendance Reports
                  </h3>
                </div>

                <AttendanceReportsTabContent
                  reports={trainee.data.attendance_reports}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="acc">
            <div className="max-h-[500px] overflow-y-auto">
              <div className="border-gray-3 relative rounded-3xl border p-6">
                <div className="bg-gray-3 absolute top-[22px] left-0 h-8 w-1 rounded-tr-md rounded-br-md" />

                <div className="mb-4 items-center justify-between md:flex">
                  <h3 className="text-xl font-bold tracking-[-0.16px]">
                    Accomplishment Reports
                  </h3>
                </div>

                <AccomplishmentReportsTabContent
                  reports={trainee.data.accomplishment_reports}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="req">
            <div className="max-h-[500px] overflow-y-auto">
              <div className="border-gray-3 relative rounded-3xl border p-6">
                <div className="bg-gray-3 absolute top-[22px] left-0 h-8 w-1 rounded-tr-md rounded-br-md" />

                <div className="mb-4 items-center justify-between md:flex">
                  <h3 className="text-xl font-bold tracking-[-0.16px]">
                    Requirements
                  </h3>
                </div>

                <RequirementsTabContent
                  requirements={trainee.data.submitted_requirements}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="eval">
            <div className="max-h-[500px] overflow-y-auto">
              <div className="border-gray-3 relative rounded-3xl border p-6">
                <div className="bg-gray-3 absolute top-[22px] left-0 h-8 w-1 rounded-tr-md rounded-br-md" />

                <div className="mb-4 items-center justify-between md:flex">
                  <h3 className="text-xl font-bold tracking-[-0.16px]">
                    Evaluation Result
                  </h3>
                </div>

                <EvaluationResultsTabContent
                  results={trainee.data.evaluation_results}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
