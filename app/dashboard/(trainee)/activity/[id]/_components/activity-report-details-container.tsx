"use client";

import { useEffect, useState } from "react";

import { Save } from "lucide-react";
import { toast } from "sonner";

import pathsConfig from "@/config/paths.config";
import {
  AccomplishmentEntry,
  useFetchActivityReport,
  useInsertActivityEntry,
  useSubmitActivityReport,
} from "@/hooks/use-activity-reports";

import { documentStatusMap, internCodeMap } from "@/lib/constants";

import { safeFormatDate } from "@/utils/shared";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import BackButton from "@/components/sumikapp/back-button";
import CheckboxEntryDialog from "@/components/sumikapp/checkbox-entry-dialog";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import ReportMoreOptions from "@/components/sumikapp/report-more-options";

import NotFoundPage from "@/app/not-found";

import { deleteActivityReportAction } from "../server/server-actions";

export default function ActivityReportDetailsContainer(params: {
  reportId: string;
}) {
  const activity = useFetchActivityReport(params.reportId);
  const insertEntryMutation = useInsertActivityEntry(params.reportId);
  const submitReportMutation = useSubmitActivityReport(params.reportId);

  const startDate = activity.data?.start_date ?? "";
  const endDate = activity.data?.end_date ?? "";
  const status = activity.data?.status ?? "not submitted";
  const internCode = activity.data?.internship_code ?? "CTNTERN1";

  const [tableEntries, setTableEntries] = useState<AccomplishmentEntry[]>([]);
  const [isInternSigned, setIsInternSigned] = useState(false);

  useEffect(() => {
    if (activity.data) {
      const entries = createTableEntries(
        startDate,
        endDate,
        activity.data?.accomplishment_entries,
        params.reportId
      );
      setTableEntries(entries);
    }
  }, [activity.data, startDate, endDate, params.reportId]);

  useEffect(() => {
    if (status === "pending" || status === "approved") {
      setIsInternSigned(true);
    }
  }, [status]);

  const allEntriesConfirmed =
    tableEntries.length > 0 && tableEntries.every((e) => e.is_confirmed);

  const canEditEntry = (entry: AccomplishmentEntry) => {
    return (
      (!entry.is_confirmed && status === "not submitted") ||
      status === "rejected"
    );
  };

  const handleDailyAccomplishmentsChange = (
    entryId: string,
    dailyAccomplishments: string
  ) => {
    setTableEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === entryId
          ? { ...entry, daily_accomplishments: dailyAccomplishments }
          : entry
      )
    );
  };

  const handleWorkingHoursChange = (entryId: string, hours: number) => {
    setTableEntries((prevEntries) =>
      prevEntries.map((entry) => {
        if (entry.id === entryId) {
          return {
            ...entry,
            no_of_working_hours: hours,
          };
        }
        return entry;
      })
    );
  };

  const handleConfirmEntry = (entryId: string) => {
    const entryToConfirm = tableEntries.find((entry) => entry.id === entryId);

    if (!entryToConfirm) {
      console.error("Entry not found");
      return;
    }

    if (
      !entryToConfirm.daily_accomplishments ||
      !entryToConfirm.no_of_working_hours
    ) {
      console.error("Time in and time out are required");
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
              return {
                ...entry,
                is_confirmed: true,
              };
            }
            return entry;
          })
        );

        return "Entry successfully saved";
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
      success: "Activity report successfully submitted",
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while submitting report. Please try again.";
      },
    });
  };

  if (activity.isLoading) {
    return <LoadingOverlay fullPage />;
  }

  if (!activity.data || activity.error) {
    return <NotFoundPage />;
  }

  return (
    <>
      <If condition={insertEntryMutation.isPending}>
        <LoadingOverlay fullPage className="opacity-50" />
      </If>

      <div className="flex flex-row items-center gap-2">
        <BackButton
          title="Weekly Activity Report"
          link={pathsConfig.app.activity}
        />

        <div className="flex flex-1 justify-end">
          <ReportMoreOptions
            id={activity.data.id}
            deleteAction={deleteActivityReportAction}
            redirectPath={pathsConfig.app.activity}
            reportType="Accomplishment"
            status={status}
            options={{
              canDelete: true,
            }}
          />
        </div>
      </div>

      <Card>
        <CardHeader className={"flex justify-between"}>
          <div className="space-y-2">
            <CardTitle>{`${safeFormatDate(startDate, "PP")} - ${safeFormatDate(endDate, "PP")}`}</CardTitle>
            <CardDescription>{internCodeMap[internCode].label}</CardDescription>
          </div>
          <Badge
            className={`text-[10px] text-white capitalize md:text-xs ${documentStatusMap[status].badgeColor}`}
          >
            {status}
          </Badge>
        </CardHeader>
        <div className="px-6">
          <p className="text-muted-foreground text-sm font-medium">
            Company Name: {activity.data.company_name}
          </p>
        </div>

        <Separator />

        <CardContent className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Daily Accomplishments</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableEntries.map((entry) => {
                const isEditable = canEditEntry(entry);
                const isConfirmed = entry.is_confirmed;

                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {safeFormatDate(entry.entry_date, "PP")}
                    </TableCell>
                    <TableCell>
                      <Textarea
                        minLength={4}
                        placeholder="List your daily accomplishments here..."
                        disabled={!isEditable || insertEntryMutation.isPending}
                        className={`${!isEditable ? "cursor-not-allowed" : ""} max-h-60 min-h-20`}
                        value={entry.daily_accomplishments ?? ""}
                        onChange={(e) =>
                          handleDailyAccomplishmentsChange(
                            entry.id,
                            e.target.value
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="24"
                        disabled={!isEditable || insertEntryMutation.isPending}
                        className={`${!isEditable ? "cursor-not-allowed" : ""} w-fit`}
                        value={
                          entry.no_of_working_hours > 0
                            ? entry.no_of_working_hours
                            : 0
                        }
                        onChange={(e) => {
                          const value = Number(e.target.value);

                          // clamp value between 0 and 24
                          const clamped = Math.max(0, Math.min(24, value));

                          handleWorkingHoursChange(entry.id, clamped);
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-end">
                      <CheckboxEntryDialog
                        disabled={insertEntryMutation.isPending}
                        isConfirmed={isConfirmed}
                        canConfirm={isEditable}
                        onConfirm={() => handleConfirmEntry(entry.id)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex justify-end">
            <div className="space-y-2">
              <Label>Total No. of Hours</Label>
              <Input
                value={`${activity.data.total_hours} Hours`}
                readOnly
                className="bg-muted font-bold"
              />
            </div>
          </div>

          <Separator />

          <div className="justify-between space-y-8 md:flex md:gap-8">
            <div className="space-y-2">
              <Label>Intern Signature</Label>
              <Label htmlFor="internSignature">
                <Checkbox
                  id="internSignature"
                  checked={isInternSigned}
                  disabled={
                    !allEntriesConfirmed ||
                    insertEntryMutation.isPending ||
                    status === "pending" ||
                    status === "approved"
                  }
                  onCheckedChange={(checked) =>
                    setIsInternSigned(checked === true)
                  }
                />
                I verify that the above information is correct
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supervisor-signature">Supervisor Signature</Label>
              {activity.data.supervisor_approved_at ? (
                <Label>
                  Approved by your Supervisor on{" "}
                  {safeFormatDate(activity.data.supervisor_approved_at, "PP")}
                </Label>
              ) : (
                <Label className="text-muted-foreground italic">
                  (To be reviewed by your supervisor)
                </Label>
              )}
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="justify-end">
          <If condition={status === "not submitted" || status === "rejected"}>
            <Button
              size={"sm"}
              disabled={
                !allEntriesConfirmed ||
                !isInternSigned ||
                insertEntryMutation.isPending
              }
              onClick={handleSubmitReport}
            >
              <Save className="size-4" />
              Submit Report
            </Button>
          </If>
        </CardFooter>
      </Card>
    </>
  );
}

function createTableEntries(
  startDate: string,
  endDate: string,
  activityEntries: AccomplishmentEntry[] = [],
  reportId: string
): AccomplishmentEntry[] {
  if (!startDate || !endDate) return [];

  const dateEntries: AccomplishmentEntry[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];

    const existingEntry = activityEntries.find(
      (entry) => entry.entry_date === dateStr
    );

    if (existingEntry) {
      dateEntries.push({
        id: existingEntry.id || `temp-${dateStr}`,
        created_at: existingEntry.created_at || new Date().toISOString(),
        entry_date: existingEntry.entry_date,
        daily_accomplishments: existingEntry.daily_accomplishments,
        no_of_working_hours: existingEntry.no_of_working_hours,
        is_confirmed: existingEntry.is_confirmed || false,
        status: existingEntry.status,
        report_id: existingEntry.report_id || reportId,
      });
    } else {
      dateEntries.push({
        id: `temp-${dateStr}`,
        created_at: new Date().toISOString(),
        entry_date: dateStr,
        daily_accomplishments: null,
        no_of_working_hours: 0,
        is_confirmed: false,
        status: null,
        report_id: reportId,
      });
    }
  }

  return dateEntries;
}
