"use client";

import { useEffect, useState } from "react";

import { Save } from "lucide-react";
import { toast } from "sonner";

import pathsConfig from "@/config/paths.config";
import {
  AttendanceEntry,
  useFetchAttendanceReport,
  useInsertAttendanceEntry,
  useSubmitAttendanceReport,
} from "@/hooks/use-attendance-reports";

import { documentStatusMap, internCodeMap } from "@/lib/constants";

import { createAttendanceTableEntries, safeFormatDate } from "@/utils/shared";
import { calculateTotalHours } from "@/utils/shared/index";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import BackButton from "@/components/sumikapp/back-button";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import ReportMoreOptions from "@/components/sumikapp/report-more-options";

import NotFoundPage from "@/app/not-found";

import { deleteAttendanceReportAction } from "../server/server-actions";
import AttendanceSignatures from "./attendance-signatures";
import AttendanceSummary from "./attendance-summary";
import AttendanceTable from "./attendance-table";

export default function AttendanceReportDetailsContainer(params: {
  reportId: string;
}) {
  const attendance = useFetchAttendanceReport(params.reportId);
  const insertEntryMutation = useInsertAttendanceEntry(params.reportId);
  const submitReportMutation = useSubmitAttendanceReport(params.reportId);

  const startDate = attendance.data?.start_date ?? "";
  const endDate = attendance.data?.end_date ?? "";
  const status = attendance.data?.status ?? "not submitted";
  const internCode = attendance.data?.internship_code ?? "CTNTERN1";

  const [tableEntries, setTableEntries] = useState<AttendanceEntry[]>([]);
  const [isInternSigned, setIsInternSigned] = useState(false);

  useEffect(() => {
    if (attendance.data) {
      const entries = createAttendanceTableEntries(
        startDate,
        endDate,
        attendance.data?.attendance_entries,
        params.reportId
      );
      setTableEntries(entries);
    }
  }, [attendance.data, startDate, endDate, params.reportId]);

  useEffect(() => {
    if (status === "pending" || status === "approved") {
      setIsInternSigned(true);
    }
  }, [status]);

  const allEntriesConfirmed =
    tableEntries.length > 0 && tableEntries.every((e) => e.is_confirmed);

  const handleTimeInChange = (entryId: string, timeIn: string) => {
    setTableEntries((prevEntries) =>
      prevEntries.map((entry) => {
        if (entry.id === entryId) {
          const totalHours = calculateTotalHours(timeIn, entry.time_out || "");
          return {
            ...entry,
            time_in: timeIn,
            total_hours: totalHours,
          };
        }
        return entry;
      })
    );
  };

  const handleTimeOutChange = (entryId: string, timeOut: string) => {
    setTableEntries((prevEntries) =>
      prevEntries.map((entry) => {
        if (entry.id === entryId) {
          const totalHours = calculateTotalHours(entry.time_in || "", timeOut);
          return {
            ...entry,
            time_out: timeOut,
            total_hours: totalHours,
          };
        }
        return entry;
      })
    );
  };

  const handleConfirmEntry = (entryId: string) => {
    const entryToConfirm = tableEntries.find((entry) => entry.id === entryId);

    if (!entryToConfirm?.time_in || !entryToConfirm?.time_out) {
      toast.error("Time in and time out are required");
      return;
    }

    const promise = async () => {
      await insertEntryMutation.mutateAsync(entryToConfirm);
    };

    toast.promise(promise, {
      loading: "Saving Entry...",
      success: () => {
        setTableEntries((prevEntries) =>
          prevEntries.map((entry) => {
            if (entry.id === entryId) {
              return { ...entry, is_confirmed: true };
            }
            return entry;
          })
        );
        return "Entry saved successfully!";
      },
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while saving entry. Please try again.";
      },
    });
  };

  const handleSubmitReport = () => {
    if (!allEntriesConfirmed) {
      toast.error("Please confirm all entries before submitting the report.");
      return;
    }

    if (!isInternSigned) {
      toast.error("Please sign the report before submitting.");
      return;
    }

    const promise = async () => {
      await submitReportMutation.mutateAsync(params.reportId);
    };

    toast.promise(promise, {
      loading: "Submitting report...",
      success: "Attendance report successfully submitted!",
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while submitting report. Please try again.";
      },
    });
  };

  if (attendance.isLoading) {
    return <LoadingOverlay fullPage />;
  }

  if (!attendance.data || attendance.error) {
    return <NotFoundPage />;
  }

  const isLoading =
    insertEntryMutation.isPending || submitReportMutation.isPending;

  return (
    <>
      <If condition={isLoading}>
        <LoadingOverlay fullPage className="opacity-50" />
      </If>

      <div className="flex flex-row items-center gap-2">
        <BackButton
          title="Weekly Attendance Report"
          link={pathsConfig.app.attendance}
        />

        <div className="flex-end">
          <ReportMoreOptions
            id={attendance.data.id}
            deleteAction={deleteAttendanceReportAction}
            redirectPath={pathsConfig.app.attendance}
            reportType="Attendance"
            status={status}
            options={{ canDelete: true }}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex justify-between">
          <div className="space-y-2">
            <CardTitle>
              {`${safeFormatDate(startDate, "PP")} - ${safeFormatDate(endDate, "PP")}`}
            </CardTitle>
            <CardDescription>{internCodeMap[internCode].label}</CardDescription>
          </div>
          <Badge
            className={`text-white capitalize ${documentStatusMap[status].badgeColor}`}
          >
            {status}
          </Badge>
        </CardHeader>

        <div className="px-6">
          <p className="text-muted-foreground text-sm font-medium">
            Company Name: {attendance.data.company_name}
          </p>
        </div>

        <Separator />

        <CardContent className="space-y-6">
          <AttendanceTable
            entries={tableEntries}
            status={status}
            isLoading={isLoading}
            onTimeInChange={handleTimeInChange}
            onTimeOutChange={handleTimeOutChange}
            onConfirmEntry={handleConfirmEntry}
          />

          <AttendanceSummary
            previousTotal={attendance.data.previous_total}
            periodTotal={attendance.data.period_total}
            totalHoursServed={attendance.data.total_hours_served}
          />

          <Separator />

          <AttendanceSignatures
            allEntriesConfirmed={allEntriesConfirmed}
            isInternSigned={isInternSigned}
            isLoading={isLoading}
            status={status}
            supervisorApprovedAt={attendance.data.supervisor_approved_at}
            onInternSignChange={setIsInternSigned}
          />
        </CardContent>

        <If condition={status === "not submitted" || status === "rejected"}>
          <Separator />
          <CardFooter className="justify-end">
            <Button
              size="sm"
              disabled={!allEntriesConfirmed || !isInternSigned || isLoading}
              onClick={handleSubmitReport}
            >
              <Save className="size-4" />
              Submit Report
            </Button>
          </CardFooter>
        </If>
      </Card>
    </>
  );
}
