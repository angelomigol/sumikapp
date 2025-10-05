"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useCreateSection } from "@/hooks/use-sections";

import { internCodeSelectOptions } from "@/lib/constants";

import { sanitizeText } from "@/utils/shared";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import DateRangePicker from "@/components/sumikapp/date-range-picker";
import { If } from "@/components/sumikapp/if";

import { SectionFormValues, sectionSchema } from "../schemas/section.schema";

export default function AddSectionSheet() {
  const [open, setOpen] = useState(false);
  const createSectionMutation = useCreateSection();

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: "",
      description: "",
      internship_code: "CTNTERN1",
      start_date: new Date(),
      end_date: new Date(),
      required_hours: 0,
    },
  });

  async function onSubmit(data: SectionFormValues) {
    const sanitizedData = {
      ...data,
      title: data.title,
      description: sanitizeText(data.description),
      internship_code: sanitizeText(data.internship_code),
    };

    const promise = createSectionMutation.mutateAsync(sanitizedData);

    toast.promise(promise, {
      loading: "Creating section...",
      success: "Section successfully created",
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Something went wrong while creating the section.";
      },
    });

    await promise;
    form.reset();
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Form {...form}>
        <form id="add-section-form" onSubmit={form.handleSubmit(onSubmit)}>
          <SheetTrigger asChild>
            <Button size={"sm"}>
              <PlusCircle className="size-4" />
              New Section
            </Button>
          </SheetTrigger>
          <SheetContent
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            className="min-w-1/2 gap-0 [&>button.absolute]:hidden"
          >
            <SheetHeader className="border-b">
              <SheetTitle>Create a new section</SheetTitle>
              <SheetDescription>
                Fill in the details for the new internship section. Click
                &quot;create section&quot; when you&apos;re done.
              </SheetDescription>
            </SheetHeader>
            <fieldset
              disabled={form.formState.isSubmitting}
              className="grid auto-rows-min items-start gap-6 overflow-y-auto p-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-start gap-4">
                    <FormLabel>Section Name</FormLabel>
                    <div className="col-span-2 space-y-2">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-start gap-4">
                    <Label>Description</Label>
                    <div className="col-span-2 space-y-2">
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          className="max-h-40 min-h-20"
                          placeholder="Optional"
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-start gap-4">
                    <FormLabel>Internship Period</FormLabel>
                    <div className="col-span-2 items-end space-y-2">
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
                        Select the start and end date of the internship period.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="internship_code"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-start gap-4">
                    <FormLabel>Internship Code</FormLabel>
                    <div className="col-span-2 space-y-2">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {internCodeSelectOptions.map((item, index) => (
                            <SelectItem key={index} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="required_hours"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-start gap-4">
                    <FormLabel>Required Hours</FormLabel>
                    <div className="col-span-2 space-y-2">
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={1}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </fieldset>
            <SheetFooter className="border-t">
              <div className="flex justify-end gap-4">
                <SheetClose asChild>
                  <Button
                    size={"sm"}
                    variant={"outline"}
                    onClick={() => form.reset()}
                    disabled={form.formState.isSubmitting}
                  >
                    Cancel
                  </Button>
                </SheetClose>
                <Button
                  size={"sm"}
                  type="submit"
                  form="add-section-form"
                  className="cursor-pointer"
                  disabled={form.formState.isSubmitting}
                >
                  <If
                    condition={form.formState.isSubmitting}
                    fallback={"Create Section"}
                  >
                    Creating...
                  </If>
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </form>
      </Form>
    </Sheet>
  );
}
