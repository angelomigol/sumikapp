import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchAttendanceReports } from "@/hooks/use-attendance-reports";

import { getQueryClient } from "@/components/get-query-client";

import AttendanceLogContainer from "./_components/attendance-log-container";

export const generateMetadata = async () => {
  return {
    title: "My Attendance Reports",
  };
};

export default async function AttendanceLogPage() {
  const queryClient = getQueryClient();

  await prefetchAttendanceReports(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AttendanceLogContainer />
    </HydrationBoundary>
  );
}
