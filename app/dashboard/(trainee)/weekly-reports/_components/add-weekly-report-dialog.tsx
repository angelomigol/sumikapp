"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { PlusCircle } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useCreateWeeklyReport } from "@/hooks/use-weekly-reports";

import {
  WeeklyReport,
  weeklyReportFormSchema,
  WeeklyReportFormValues,
  WeeklyReportServerPayload,
} from "@/schemas/weekly-report/weekly-report.schema";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import DateRangePicker from "@/components/sumikapp/date-range-picker";
import { If } from "@/components/sumikapp/if";

interface AddWeeklyReportDialogProps {
  existingReports?: WeeklyReport[];
}

export default function AddWeeklyReportDialog({
  existingReports = [],
}: AddWeeklyReportDialogProps) {
  const [open, setOpen] = useState(false);
  const createAttendanceReportMutation = useCreateWeeklyReport();

  const form = useForm<WeeklyReportFormValues>({
    resolver: zodResolver(weeklyReportFormSchema),
    defaultValues: {
      start_date: new Date(),
      end_date: new Date(),
    },
  });

  const getDisabledDates = () => {
    const disabledDates: Date[] = [];

    existingReports.forEach((report) => {
      if (!report.start_date || !report.end_date) return;

      const startDate = new Date(report.start_date);
      const endDate = new Date(report.end_date);

      for (
        let date = new Date(startDate);
        date <= endDate;
        date.setDate(date.getDate() + 1)
      ) {
        disabledDates.push(new Date(date));
      }
    });

    return disabledDates;
  };

  const validateNoOverlap = (
    startDate: Date,
    endDate: Date,
    existingReports: WeeklyReport[]
  ) => {
    return !existingReports.some((report) => {
      if (!report.start_date || !report.end_date) return false;

      const reportStart = new Date(report.start_date);
      const reportEnd = new Date(report.end_date);

      // Check if there's any overlap
      return (
        (startDate >= reportStart && startDate <= reportEnd) ||
        (endDate >= reportStart && endDate <= reportEnd) ||
        (startDate <= reportStart && endDate >= reportEnd)
      );
    });
  };

  async function onSubmit(data: WeeklyReportFormValues) {
    if (!validateNoOverlap(data.start_date, data.end_date, existingReports)) {
      toast.error("Date range overlaps with an existing report");
      return;
    }

    const serverPayload: WeeklyReportServerPayload = {
      start_date: format(data.start_date, "yyyy-MM-dd"),
      end_date: format(data.end_date, "yyyy-MM-dd"),
    };

    const promise = createAttendanceReportMutation.mutateAsync(serverPayload);

    toast.promise(promise, {
      loading: "Creating weekly report...",
      success: "Weekly report successfully created!",
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Something went wrong while creating weekly report.";
      },
    });

    await promise;
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Form {...form}>
        <form
          id="add-weekly-report-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <DialogTrigger asChild>
            <Button size={"sm"}>
              <PlusCircle />
              New Report
            </Button>
          </DialogTrigger>
          <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            className="data-[state=open]:!zoom-in-100 data-[state=open]:slide-in-from-bottom-20 data-[state=open]:duration-600"
          >
            <DialogHeader>
              <DialogTitle>Create Weekly Report</DialogTitle>
              <DialogDescription>
                Fill out the form to create a new weekly report. Click
                &#34;create report&#34; when you&#39;re done.
              </DialogDescription>
              <fieldset
                disabled={form.formState.isSubmitting}
                className="space-y-4 pt-4"
              >
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Report Period</FormLabel>
                      <DateRangePicker
                        disabledDates={getDisabledDates()}
                        selected={{
                          from: field.value,
                          to: form.getValues("end_date"),
                        }}
                        onSelect={(range: DateRange | undefined) => {
                          if (range?.from) {
                            form.setValue("start_date", range.from);
                          }
                          if (range?.to) {
                            form.setValue("end_date", range.to);

                            // Validate 7-day selection
                            if (range?.from && range?.to) {
                              const diffTime = Math.abs(
                                range.to.getTime() - range.from.getTime()
                              );
                              const diffDays = Math.ceil(
                                diffTime / (1000 * 60 * 60 * 24)
                              );

                              if (diffDays !== 6) {
                                form.setError("start_date", {
                                  type: "manual",
                                  message:
                                    "Please select exactly 7 days (1 week)",
                                });
                              } else {
                                form.clearErrors("start_date");
                              }
                            }
                          }
                        }}
                      />
                      <FormDescription>
                        Select exactly 7 days for your report period (1 week)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </fieldset>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  className="cursor-pointer"
                  onClick={() => form.reset()}
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                size={"sm"}
                form="add-weekly-report-form"
                className="cursor-pointer"
                onClick={() => form.handleSubmit(onSubmit)}
                disabled={form.formState.isSubmitting}
              >
                <If
                  condition={form.formState.isSubmitting}
                  fallback={"Create Report"}
                >
                  Creating...
                </If>
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
}
