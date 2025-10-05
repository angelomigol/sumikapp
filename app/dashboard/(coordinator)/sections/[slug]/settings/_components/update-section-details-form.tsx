"use client";

import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { isValid, parseISO } from "date-fns";
import { AlertTriangle, CheckCheck, Edit, Loader2, Trash2 } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useUpdateSection } from "@/hooks/use-sections";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

import { internCodeSelectOptions, InternshipCode } from "@/lib/constants";

import { Database } from "@/utils/supabase/supabase.types";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateRangePicker from "@/components/sumikapp/date-range-picker";
import { If } from "@/components/sumikapp/if";

import {
  SectionFormValues,
  sectionSchema,
} from "../../../schemas/section.schema";

type UpdateSectionDataParams =
  Database["public"]["Tables"]["program_batch"]["Update"];

export default function UpdateSectionDetailsForm({
  isEdit,
  setIsEdit,
  title,
  sectionId,
  description,
  start_date,
  end_date,
  internship_code,
  required_hours,
}: {
  isEdit: boolean;
  setIsEdit: (isEdit: boolean) => void;
  onUpdate: (user: Partial<UpdateSectionDataParams>) => void;
  sectionId: string;
  start_date: Date;
  end_date: Date;
  description: string | null;
  internship_code: InternshipCode;
  required_hours: number;
  title: string;
}) {
  const updateSectionMutation = useUpdateSection(title);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const originalValues: SectionFormValues = {
    id: sectionId,
    title,
    description,
    start_date,
    end_date,
    internship_code,
    required_hours,
  };

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: originalValues,
  });

  const { hasUnsavedChanges, resetToOriginal, setHasUnsavedChanges } =
    useUnsavedChanges({ form, originalValues, isEditing: isEdit });

  const onSubmit = async (data: SectionFormValues) => {
    toast.promise(updateSectionMutation.mutateAsync(data), {
      loading: "Updating section...",
      success: "Section updated successfully!",
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while updating section. Please try again.";
      },
    });

    setIsEdit(false);
    setHasUnsavedChanges(false);
  };

  const parseDate = (dateString: string): Date => {
    if (!dateString) {
      return new Date();
    }

    const parsed = parseISO(dateString);
    return isValid(parsed) ? parsed : new Date();
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setIsCancelDialogOpen(true);
    } else {
      setIsEdit(false);
    }
  };

  const confirmCancel = () => {
    resetToOriginal();
    setIsEdit(false);
    setIsCancelDialogOpen(false);
  };

  return (
    <>
      <div className="flex flex-col space-y-8">
        <Form {...form}>
          <form
            className="flex flex-col space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <fieldset
              disabled={!isEdit || updateSectionMutation.isPending}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => {
                  const startDate =
                    field.value instanceof Date
                      ? field.value
                      : parseDate(field.value as string);
                  const endDateValue = form.getValues("end_date");
                  const endDate =
                    endDateValue instanceof Date
                      ? endDateValue
                      : parseDate(endDateValue as string);

                  return (
                    <FormItem>
                      <FormLabel>Internship Period</FormLabel>
                      <FormControl>
                        <DateRangePicker
                          selected={{
                            from: isValid(startDate) ? startDate : undefined,
                            to: isValid(endDate) ? endDate : undefined,
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="internship_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internship Code</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!isEdit}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {internCodeSelectOptions.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="required_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Hours</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>

            <div className="mt-4 flex justify-end gap-4">
              <If condition={hasUnsavedChanges && isEdit}>
                <div className="text-amber-11 flex items-center gap-2 text-sm">
                  <AlertTriangle className="size-4" />
                  <span>You have unsaved changes</span>
                </div>
              </If>

              <If condition={!isEdit}>
                <Button
                  size={"sm"}
                  onClick={() => setIsEdit(true)}
                  className="cursor-pointer"
                >
                  <Edit className="size-4" />
                  Edit
                </Button>
              </If>

              <If condition={isEdit}>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    size={"sm"}
                    variant={"outline"}
                    onClick={handleCancel}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size={"sm"}
                    disabled={updateSectionMutation.isPending}
                    className="cursor-pointer"
                  >
                    <If
                      condition={updateSectionMutation.isPending}
                      fallback={
                        <>
                          <CheckCheck className="size-4" />
                          Save Changes
                        </>
                      }
                    >
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Saving...
                      </>
                    </If>
                  </Button>
                </div>
              </If>
            </div>
          </form>
        </Form>
      </div>

      <CancelDialog
        isCancelDialogOpen={isCancelDialogOpen}
        setIsCancelDialogOpen={setIsCancelDialogOpen}
        confirmCancel={confirmCancel}
      />
    </>
  );
}

function CancelDialog({
  isCancelDialogOpen,
  setIsCancelDialogOpen,
  confirmCancel,
}: {
  isCancelDialogOpen: boolean;
  setIsCancelDialogOpen: (open: boolean) => void;
  confirmCancel: () => void;
}) {
  return (
    <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-amber-11 size-5" />
            Unsaved Changes
          </AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes that will be lost if you cancel. Are you
            sure you want to discard these changes?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={(e) => {
              e.preventDefault();
              setIsCancelDialogOpen(false);
            }}
          >
            <Edit className="size-4" />
            Keep Editing
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmCancel}
            className="bg-destructive hover:bg-destructive/80"
          >
            <Trash2 className="size-4" />
            Discard Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
