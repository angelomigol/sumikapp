"use client";

import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  InternshipDetails,
  useCreateInternshipPlacement,
  useUpdateInternshipPlacement,
} from "@/hooks/use-internship-details";

import { jobRoles, weekDays } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { formatPhone } from "@/utils/shared";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SmartCompanySearch, {
  SearchableCompany,
} from "@/components/sumikapp/smart-company-search";

import {
  internshipDetailsFormSchema,
  InternshipDetailsFormValues,
} from "../schema/internship-details-form.schema";

interface InternshipDetailsFormProps {
  internship?: InternshipDetails | null;
  onClose: () => void;
}

export default function InternshipDetailsForm({
  internship,
  onClose,
}: InternshipDetailsFormProps) {
  const [selectedPartner, setSelectedPartner] =
    useState<SearchableCompany | null>(null);
  const [partnerSearchOpen, setPartnerSearchOpen] = useState(false);

  const createInternshipMutation = useCreateInternshipPlacement();
  const updateInternshipMutation = useUpdateInternshipPlacement();

  const isEditing = !!internship;
  const isLoading =
    createInternshipMutation.isPending || updateInternshipMutation.isPending;

  const form = useForm<InternshipDetailsFormValues>({
    resolver: zodResolver(internshipDetailsFormSchema),
    defaultValues: {
      id: undefined,
      companyName: "",
      contactNumber: "",
      natureOfBusiness: "",
      companyAddress: "",
      supervisorEmail: "",
      jobRole: "",
      customJobRole: "",
      startDate: "",
      endDate: "",
      dailySchedule: [],
      startTime: "",
      endTime: "",
      lunchBreak: 0,
    },
  });

  const watchedJobRole = form.watch("jobRole");
  const watchedDailySchedule = form.watch("dailySchedule");

  const handlePartnerSelect = (partner: SearchableCompany) => {
    setSelectedPartner(partner);
    form.setValue("companyName", partner.company_name);
    form.setValue("companyAddress", partner.company_address ?? "");
    form.setValue("contactNumber", partner.company_contact_number ?? "");
    form.setValue("natureOfBusiness", partner.nature_of_business ?? "");
    setPartnerSearchOpen(false);
  };

  useEffect(() => {
    if (isEditing) {
      const existingRole = jobRoles.find(
        (role) => role.value === internship.job_role
      );

      const formData = {
        id: internship.id,
        companyName: internship.companyName || "",
        contactNumber: internship.contactNumber || "",
        natureOfBusiness: internship.natureOfBusiness || "",
        companyAddress: internship.companyAddress || "",
        supervisorEmail: "",
        jobRole: existingRole ? internship.job_role || "" : "others",
        customJobRole: existingRole ? "" : internship.job_role || "",
        startDate: internship.startDate || "",
        endDate: internship.endDate || "",
        dailySchedule: internship.dailySchedule || [],
        startTime: internship.startTime || "",
        endTime: internship.endTime || "",
        lunchBreak: internship.lunchBreak || 0,
      };

      form.reset(formData);
    } else {
      form.reset({
        id: undefined,
        companyName: "",
        contactNumber: "",
        natureOfBusiness: "",
        companyAddress: "",
        supervisorEmail: "",
        jobRole: "",
        customJobRole: "",
        startDate: "",
        endDate: "",
        dailySchedule: [],
        startTime: "",
        endTime: "",
        lunchBreak: 0,
      });
    }
  }, [isEditing, internship, form]);

  const onSubmit = async (data: InternshipDetailsFormValues) => {
    let promise;

    const submitData = {
      ...data,
      jobRole:
        data.jobRole === "others"
          ? (data.customJobRole ?? "")
          : (data.jobRole ?? ""),
    };

    if (internship) {
      if (!submitData.id) {
        submitData.id = internship.id;
      }

      promise = updateInternshipMutation.mutateAsync({
        ...submitData,
      });

      toast.promise(promise, {
        loading: "Updating internship details...",
        success: "Internship form successfully updated!",
        error: (err) => {
          if (err instanceof Error) {
            return err.message;
          }
          return "Something went wrong while updating internship details.";
        },
      });
    } else {
      promise = createInternshipMutation.mutateAsync({ ...submitData });

      toast.promise(promise, {
        loading: "Creating internship form...",
        success: "Intership form successfully created!",
        error: (error) => {
          if (error instanceof Error) {
            return error.message;
          }
          return "Something went wrong while creating internship form.";
        },
      });
    }

    await promise;
    form.reset();
    onClose();
  };

  const toggleDay = (day: string, currentDays: string[]) => {
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    form.setValue("dailySchedule", newDays);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset className="space-y-6" disabled={isLoading}>
          <div className="space-y-4">
            <div className="font-medium">Company Details</div>

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <SmartCompanySearch
                      value={field.value}
                      onChange={field.onChange}
                      onSelect={handlePartnerSelect}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact No.</FormLabel>
                    <FormControl>
                      <Input
                        value={formatPhone(field.value ?? "")}
                        inputMode="numeric"
                        maxLength={13}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          field.onChange(raw);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="natureOfBusiness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nature of Business</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="companyAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="supervisorEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Supervisor Email</FormLabel>
                <FormControl>
                  <Input inputMode="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-6">
            <div className="font-medium">Training Details</div>

            <FormField
              control={form.control}
              name="jobRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Role</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {field.value === "others"
                            ? form.getValues("customJobRole") ||
                              "Enter custom role"
                            : field.value
                              ? jobRoles.find(
                                  (role) => role.value === field.value
                                )?.label
                              : "Select your job role"}
                          <ChevronDown />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-full p-0"
                      align="start"
                      sideOffset={8}
                    >
                      <Command>
                        <CommandInput placeholder="Find job roles..." />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {jobRoles.map((role) => (
                              <CommandItem
                                key={role.value}
                                value={role.value}
                                onSelect={() => {
                                  field.onChange(role.value);
                                  if (role.value !== "others") {
                                    form.setValue("customJobRole", "");
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      "border-primary flex size-4 items-center justify-center rounded-sm border",
                                      field.value === role.value
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50"
                                    )}
                                  >
                                    {field.value === role.value && (
                                      <Check className="size-3" />
                                    )}
                                  </div>
                                  <span>{role.label}</span>
                                </div>
                              </CommandItem>
                            ))}
                            <CommandItem
                              key="others"
                              value="others"
                              onSelect={() => field.onChange("others")}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "border-primary flex size-4 items-center justify-center rounded-sm border",
                                    field.value === "others"
                                      ? "bg-primary text-primary-foreground"
                                      : "opacity-50"
                                  )}
                                >
                                  {field.value === "others" && (
                                    <Check className="size-3" />
                                  )}
                                </div>
                                <span>Others</span>
                              </div>
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedJobRole === "others" && (
              <FormField
                control={form.control}
                name="customJobRole"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="e.g. AI Prompt Engineer" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-2">
              <FormLabel>Duration (start date & end date)</FormLabel>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="dailySchedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Schedule</FormLabel>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {weekDays.map((day) => (
                      <div key={day.value} className="flex items-center gap-2">
                        <Checkbox
                          id={day.value}
                          checked={field.value.includes(day.value)}
                          onCheckedChange={() =>
                            toggleDay(day.value, field.value)
                          }
                        />
                        <FormLabel htmlFor={day.value}>{day.label}</FormLabel>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedDailySchedule.length > 0 && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="lunchBreak"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lunch Break ()</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., " />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {internship ? "Update Internship" : "Create Internship"}
            </Button>
            <Button
              type="button"
              variant={"outline"}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
