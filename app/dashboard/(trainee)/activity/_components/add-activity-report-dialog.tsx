"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useCreateActivityReport } from "@/hooks/use-activity-reports";

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

import {
  activityFormSchema,
  ActivityFormValues,
} from "../schema/activity-report-schema";
import { If } from "@/components/sumikapp/if";

export default function AddActivityReportDialog() {
  const [open, setOpen] = useState(false);
  const createActivityReportMutation = useCreateActivityReport();

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      start_date: new Date(),
      end_date: new Date(),
    },
  });

  async function onSubmit(data: ActivityFormValues) {
    const promise = createActivityReportMutation.mutateAsync(data);

    toast.promise(promise, {
      loading: "Creating activity report...",
      success: "Activity report successfully created",
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Something went wrong while creating the activity report.";
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
          id="add-activity-report-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle />
              New Report
            </Button>
          </DialogTrigger>
          <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Create Activity Report</DialogTitle>
              <DialogDescription>
                Fill out the form to create a new weekly activity report. Click
                "create report" when you're done.
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
                        side="right"
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
                          }
                        }}
                      />
                      <FormDescription>
                        Select the start and end date for your report period
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
                  onClick={() => form.reset()}
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                size={"sm"}
                type="submit"
                form="add-activity-report-form"
                className="cursor-pointer"
                onClick={() => form.handleSubmit(onSubmit)()}
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
