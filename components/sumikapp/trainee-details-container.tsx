"use client";

import React from "react";

import {
  ClipboardCheckIcon,
  ClockIcon,
  FileCheckIcon,
  FileTextIcon,
  TargetIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { TraineeFullDetails } from "@/hooks/use-section-trainees";

import { getOJTStatusConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { formatHoursDisplay, safeFormatDate } from "@/utils/shared";

import EvaluationResultsTabContent from "@/components/sumikapp/evaluation-results-tab-content";
import RequirementsTabContent from "@/components/sumikapp/requirements-tab-content";
import WeeklyReportsTabContent from "@/components/sumikapp/weekly-reports-tab-content";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import BackButton from "./back-button";
import { If } from "./if";

interface TraineeDetailsContainerProps {
  role: "coordinator" | "supervisor" | "trainee";
  link?: string;
  traineeDetails: TraineeFullDetails;
}

export default function TraineeDetailsContainer({
  role,
  link,
  traineeDetails,
}: TraineeDetailsContainerProps) {
  const displayName = [
    traineeDetails.first_name,
    traineeDetails.middle_name,
    traineeDetails.last_name,
  ]
    .filter(Boolean)
    .join(" ");
  const studentIdNumber = traineeDetails.student_id_number;
  const email = traineeDetails.email;
  const section = traineeDetails.section || "N/A";
  const course = traineeDetails.course || "N/A";
  const ojtStatus = traineeDetails.ojt_status;

  const internshipDetails = traineeDetails.internship_details;
  const companyName = internshipDetails?.company_name || "N/A";
  const jobRole = internshipDetails?.job_role || "N/A";
  const startDate = internshipDetails?.start_date || "N/A";
  const endDate = internshipDetails?.end_date || "N/A";

  const internshipCode = traineeDetails.program_batch.internship_code || "N/A";
  const hoursCompleted = traineeDetails.hours_logged ?? 0;
  const requiredHours = traineeDetails.program_batch.required_hours ?? 0;
  const remainingHours = Math.max(requiredHours - hoursCompleted, 0);
  const progress =
    requiredHours > 0 ? (hoursCompleted / requiredHours) * 100 : 0;

  if (!role || !traineeDetails) {
    return null;
  }

  return (
    <>
      <If condition={role !== "trainee"}>
        <div>
          <BackButton title={"Trainee Details"} link={link} />
        </div>
      </If>

      <Card className="border-none py-0 shadow-none">
        <CardContent className="px-0">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <Avatar className="relative size-20 shrink-0 rounded-3xl">
              <AvatarFallback className={cn("rounded-3xl text-2xl font-bold")}>
                {displayName.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="w-full overflow-hidden text-center md:text-left">
              <span className="text-sm font-semibold" title={studentIdNumber}>
                {studentIdNumber}
              </span>
              <h2
                className="w-full truncate text-[28px] leading-[34px] font-medium tracking-[-0.045rem] md:max-w-[800px]"
                title={displayName}
              >
                {displayName}
              </h2>
              <p className="text-muted-foreground text-sm" title={email}>
                {email}
              </p>
            </div>
            <div className="flex-end flex shrink-0 items-center gap-4">
              <Badge
                className={`${getOJTStatusConfig(ojtStatus)?.badgeColor} capitalize`}
              >
                {ojtStatus}
              </Badge>
            </div>
          </div>

          <If
            condition={internshipDetails}
            fallback={
              <div className="mt-10 mb-6">
                <Alert className="border-amber-11 bg-amber-3 [&>svg]:text-amber-11 rounded-2xl p-4 [&>svg]:size-5">
                  <TriangleAlertIcon className="size-4" />
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
                    {section}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase">Course</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    {course}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase">Company Name</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm font-normal">
                    {companyName}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase">Job Role</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm font-normal">
                    {jobRole}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase">Duration</span>
                <div className="flex items-center gap-2">
                  {internshipDetails && (
                    <span className="text-muted-foreground text-sm font-normal">
                      {`${safeFormatDate(startDate, "PP")} - ${safeFormatDate(
                        endDate,
                        "PP"
                      )}`}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase">Internship</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm font-normal">
                    {internshipCode === "CTNTERN2"
                      ? "Internship 2"
                      : "Internship 1"}
                  </span>
                </div>
              </div>
            </div>
          </If>
        </CardContent>
      </Card>

      <div className="w-full max-w-full space-y-6">
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
                  <ClockIcon className="text-primary size-4" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Hours Completed
                  </p>
                  <p className="text-2xl font-bold">
                    {formatHoursDisplay(hoursCompleted)}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-lg p-2">
                  <TargetIcon className="size-4" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Required Hours
                  </p>
                  <p className="text-2xl font-bold">
                    {formatHoursDisplay(requiredHours)}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-lg p-2">
                  <TrendingUpIcon className="size-4" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Remaining Hours
                  </p>
                  <p className="text-2xl font-bold">
                    {formatHoursDisplay(remainingHours)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="att">
          <TabsList>
            <TabsTrigger value="att">
              <FileCheckIcon className="size-4" />
              Reports
            </TabsTrigger>
            <If condition={role === "coordinator" || role === "trainee"}>
              <TabsTrigger value="req">
                <FileTextIcon className="size-4" />
                Requirements
              </TabsTrigger>
            </If>
            <TabsTrigger value="eval">
              <ClipboardCheckIcon className="size-4" />
              Evaluation Result
            </TabsTrigger>
          </TabsList>

          <TabsContent value="att">
            <TabPanel title="Weekly Reports">
              <WeeklyReportsTabContent
                reports={traineeDetails.weekly_reports}
              />
            </TabPanel>
          </TabsContent>

          <If condition={role === "coordinator" || role === "trainee"}>
            <TabsContent value="req">
              <TabPanel title="Requirements">
                <RequirementsTabContent
                  requirements={traineeDetails.submitted_requirements}
                />
              </TabPanel>
            </TabsContent>
          </If>

          <TabsContent value="eval">
            <TabPanel title="Evaluation Result">
              <EvaluationResultsTabContent
                results={traineeDetails.evaluation_results}
              />
            </TabPanel>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function TabPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-h-[500px] min-h-[500px] overflow-y-auto">
      <div className="border-gray-3 relative rounded-3xl border p-6">
        <div className="bg-gray-3 absolute top-[22px] left-0 h-8 w-1 rounded-tr-md rounded-br-md" />
        <div className="mb-4 items-center justify-between md:flex">
          <h3 className="text-xl font-bold tracking-[-0.16px]">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}
