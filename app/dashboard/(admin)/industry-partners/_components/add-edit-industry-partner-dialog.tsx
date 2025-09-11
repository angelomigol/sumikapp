"use client";

import React, { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  IndustryPartner,
  useCreateIndustryPartner,
  useUpdateIndustryPartner,
} from "@/hooks/use-industry-partner";

import { cn } from "@/lib/utils";

import { formatPhone } from "@/utils/shared";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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

import {
  IndustryPartnerFormValues,
  industryPartnerSchema,
} from "../schema/industry-partner.schema";

interface AddEditIndustryPartnerDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  editingPartner?: IndustryPartner | null;
  handleAdd: () => void;
}

export default function AddEditIndustryPartnerDialog({
  open,
  setOpen,
  editingPartner,
  handleAdd,
}: AddEditIndustryPartnerDialogProps) {
  const createPartnerMutation = useCreateIndustryPartner();
  const updatePartnerMutation = useUpdateIndustryPartner();

  const isEditing = !!editingPartner;
  const isLoading =
    createPartnerMutation.isPending || updatePartnerMutation.isPending;

  const form = useForm<IndustryPartnerFormValues>({
    resolver: zodResolver(industryPartnerSchema),
    defaultValues: {
      companyName: "",
      companyAddress: "",
      companyContactNumber: "",
      natureOfBusiness: "",
      dateOfSigning: new Date(),
    },
  });

  useEffect(() => {
    if (open && editingPartner) {
      form.reset({
        companyName: editingPartner.company_name || "",
        companyAddress: editingPartner.company_address || "",
        companyContactNumber: editingPartner.company_contact_number || "",
        natureOfBusiness: editingPartner.nature_of_business || "",
        dateOfSigning: editingPartner.date_of_signing
          ? new Date(editingPartner.date_of_signing)
          : new Date(),
      });
    } else if (open && !editingPartner) {
      form.reset({
        companyName: "",
        companyAddress: "",
        companyContactNumber: "",
        natureOfBusiness: "",
        dateOfSigning: new Date(),
      });
    }
  }, [open, editingPartner, form]);

  async function onSubmit(data: IndustryPartnerFormValues) {
    let promise;

    if (isEditing && editingPartner) {
      promise = updatePartnerMutation.mutateAsync({
        ...data,
        partnerId: editingPartner.id,
      });

      toast.promise(promise, {
        loading: "Updating industry partner...",
        success: "Industry partner successfully updated!",
        error: (err) => {
          if (err instanceof Error) {
            return err.message;
          }
          return "Something went wrong while updating industry partner.";
        },
      });
    } else {
      promise = createPartnerMutation.mutateAsync(data);

      toast.promise(promise, {
        loading: "Creating industry partner...",
        success: "Industry partner successfully created!",
        error: (err) => {
          if (err instanceof Error) {
            return err.message;
          }
          return "Something went wrong while creating industry partner.";
        },
      });
    }

    await promise;
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Form {...form}>
        <form id="add-partner-form" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogTrigger asChild>
            <Button size={"sm"} onClick={handleAdd}>
              <Plus />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit" : "Add"} Industry Partner
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? `Update the details for ${editingPartner?.company_name}. Click "update" when you're done.`
                  : 'Fill in the details for creating new industry partner. Click "create" when you\'re done.'}
              </DialogDescription>
              <fieldset disabled={isLoading} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Optional" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    name="companyContactNumber"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Contact No.</FormLabel>
                        <FormControl>
                          <Input
                            value={formatPhone(field.value ?? "")}
                            placeholder="Optional"
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
                          <Input {...field} placeholder="Optional" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dateOfSigning"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Signing</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="moaFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MOA File</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => field.onChange(e.target.files?.[0])}
                        />
                      </FormControl>
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
                  onClick={() => {
                    form.reset();
                    setOpen(false);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                size={"sm"}
                form="add-partner-form"
                className="cursor-pointer"
                disabled={isLoading}
              >
                {isLoading
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
}
