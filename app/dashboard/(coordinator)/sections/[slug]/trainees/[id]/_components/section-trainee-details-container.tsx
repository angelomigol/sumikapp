"use client";

import React from "react";

import { FileCheck, FileClock } from "lucide-react";

import pathsConfig from "@/config/paths.config";
import { useFetchSectionTrainee } from "@/hooks/use-section-trainees";
import { useFetchSupervisorTrainee } from "@/hooks/use-supervisor-trainees";

import { getOJTStatusConfig } from "@/lib/constants";

import { safeFormatDate } from "@/utils/shared";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackButton from "@/components/sumikapp/back-button";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";

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

      <div className="grid auto-rows-auto grid-cols-3 gap-5 md:grid-cols-6 lg:grid-cols-9">
        <Card className="col-span-3 md:col-span-6 lg:col-span-2">
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="size-24">
              <AvatarImage src={undefined} alt={trainee.data.first_name} />
              <AvatarFallback className="text-4xl font-bold">
                {displayName.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-balance">
                {displayName}
              </h2>
              <p className="text-muted-foreground text-sm">
                {trainee.data.email}
              </p>
              <div className="mt-2">
                <Badge
                  className={`${getOJTStatusConfig(trainee.data.ojt_status)?.badgeColor} capitalize`}
                >
                  {trainee.data.ojt_status}
                </Badge>
              </div>
            </div>
            <Separator />

            <div className="w-full space-y-4">
              <div>
                <p className="text-sm font-medium">Student ID Number</p>
                <p className="text-muted-foreground text-sm">
                  {trainee.data.student_id_number}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Section</p>
                <p className="text-muted-foreground text-sm">
                  {trainee.data.section}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Program</p>
                <p className="text-muted-foreground text-sm">
                  {trainee.data.course}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Company</p>
                <p className="text-muted-foreground text-sm">
                  {trainee.data.internship_details.company_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Intern Role</p>
                <p className="text-muted-foreground text-sm">
                  {trainee.data.internship_details.job_role}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-muted-foreground text-sm">
                  {safeFormatDate(
                    trainee.data.internship_details.start_date,
                    "PP"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p className="text-muted-foreground text-sm">
                  {safeFormatDate(
                    trainee.data.internship_details.end_date,
                    "PP"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 md:col-span-7">
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
            <CardDescription>
              Overall progress and hours completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <p>Program Completion</p>
                <p>{progress.toFixed(1)}%</p>
              </div>
              <Progress value={progress} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2 rounded-md border p-4">
                <p className="text-muted-foreground text-sm">
                  Total Hours Completed
                </p>
                <p className="text-right text-xl font-bold">{hoursCompleted}</p>
              </div>
              <div className="space-y-2 rounded-md border p-4">
                <p className="text-muted-foreground text-sm">Required Hours</p>
                <p className="text-right text-xl font-bold">{requiredHours}</p>
              </div>
              <div className="space-y-2 rounded-md border p-4">
                <p className="text-muted-foreground text-sm">Remaining Hours</p>
                <p className="text-right text-xl font-bold">{remainingHours}</p>
              </div>
            </div>

            <Separator />

            <CardHeader className="px-0">
              <CardTitle>Reports</CardTitle>
              <CardDescription>Attendance and activity reports</CardDescription>
            </CardHeader>

            <Tabs defaultValue="att">
              <TabsList>
                <TabsTrigger value="req">
                  <FileClock className="size-4" />
                  Requirements
                </TabsTrigger>
                <TabsTrigger value="att">
                  <FileClock className="size-4" />
                  Attendance
                </TabsTrigger>
                <TabsTrigger value="acc">
                  <FileCheck className="size-4" />
                  Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="att">
                {/* <AttendanceTabContent
                  reports={trainee.data.attendance_reports}
                /> */}
              </TabsContent>
              <TabsContent value="att">
                {/* <AttendanceTabContent
                  reports={trainee.data.attendance_reports}
                /> */}
              </TabsContent>
              <TabsContent value="acc">
                {/* <ActivityTabContent
                  reports={trainee.data.accomplishment_reports}
                /> */}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
