"use client";

import { useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, FileText, PlusCircle, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  IndustryPartner,
  useCreateIndustryPartner,
  useUpdateIndustryPartner,
} from "@/hooks/use-industry-partner";

import { COMMON_FILE_TYPES, FILE_SIZE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { formatFileSize, formatPhone } from "@/utils/shared";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { If } from "@/components/sumikapp/if";

import {
  IndustryPartnerFormValues,
  industryPartnerSchema,
} from "../schema/industry-partner.schema";

const MAX_FILE_SIZE = FILE_SIZE_OPTIONS[FILE_SIZE_OPTIONS.length - 1].value; // 50MB
const ALLOWED_EXTENSIONS = COMMON_FILE_TYPES.map((type) => type.value);
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

interface AddEditIndustryPartnerSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  editingPartner?: IndustryPartner | null;
  handleAdd: () => void;
}

export default function AddEditIndustryPartnerSheet({
  open,
  setOpen,
  editingPartner,
  handleAdd,
}: AddEditIndustryPartnerSheetProps) {
  const createPartnerMutation = useCreateIndustryPartner();
  const updatePartnerMutation = useUpdateIndustryPartner();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);

  const isEditing = !!editingPartner;

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
        id: editingPartner.id,
        companyName: editingPartner.company_name || "",
        companyAddress: editingPartner.company_address || "",
        companyContactNumber: editingPartner.company_contact_number || "",
        natureOfBusiness: editingPartner.nature_of_business || "",
        dateOfSigning: editingPartner.date_of_signing
          ? new Date(editingPartner.date_of_signing)
          : new Date(),
      });
      setExistingFileName(editingPartner.file_name || null);
      setSelectedFile(null);
    } else if (open && !editingPartner) {
      form.reset({
        id: undefined,
        companyName: "",
        companyAddress: "",
        companyContactNumber: "",
        natureOfBusiness: "",
        dateOfSigning: new Date(),
      });
      setExistingFileName(null);
      setSelectedFile(null);
    }
  }, [open, editingPartner, form]);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds the maximum limit of ${formatFileSize(MAX_FILE_SIZE)}.`;
    }

    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const isValidType =
      ALLOWED_FILE_TYPES.includes(file.type) ||
      ALLOWED_EXTENSIONS.includes(fileExtension);

    if (!isValidType) {
      return `Unsupported file type. Please upload PDF or image files only.`;
    }

    return null;
  };

  const handleFileSelect = (file: File | undefined) => {
    if (file) {
      const validationError = validateFile(file);

      if (validationError) {
        setSelectedFile(null);
        form.setValue("moaFile", undefined);
        toast.error(validationError);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setSelectedFile(file);
      form.setValue("moaFile", file);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    form.setValue("moaFile", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function onSubmit(data: IndustryPartnerFormValues) {
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

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
    setSelectedFile(null);
    setExistingFileName(null);
    setOpen(false);
  }

  const renderFileSelection = () => {
    if (selectedFile) {
      return (
        <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
          <div className="flex items-center space-x-2">
            <FileText className="size-4 text-gray-400" />
            <span className="text-sm font-medium">{selectedFile.name}</span>
            <span className="text-xs text-gray-500">
              {formatFileSize(selectedFile.size)}
            </span>
          </div>

          <Button
            type="button"
            variant={"ghost"}
            size={"sm"}
            onClick={handleFileRemove}
            className="size-8 p-0"
          >
            <X className="size-4" />
          </Button>
        </div>
      );
    }

    if (isEditing && existingFileName) {
      return (
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center space-x-2">
            <FileText className="size-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-900">
              {existingFileName}
            </span>
            <span className="text-xs text-blue-600">(Current File)</span>
          </div>
          <Button
            type="button"
            variant={"outline"}
            size={"sm"}
            onClick={() => fileInputRef.current?.click()}
            className="h-8 border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <Upload className="m-1 size-3" />
            Replace
          </Button>
        </div>
      );
    }

    return (
      <div
        onClick={() => fileInputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-gray-400 hover:bg-gray-50"
      >
        <Upload className="mb-2 size-8 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">
          Click to upload MOA file
        </span>
        <span className="mt-1 text-center text-xs text-gray-500">
          PDF and Image files are supported <br />
          Max File Size: 50MB
        </span>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Form {...form}>
        <form id="industry-partner-form" onSubmit={form.handleSubmit(onSubmit)}>
          <SheetTrigger asChild>
            <Button size={"sm"} onClick={handleAdd}>
              <PlusCircle className="size-4" />
              New Partner
            </Button>
          </SheetTrigger>
          <SheetContent
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            className="min-w-1/2 gap-0 [&>button.absolute]:hidden"
          >
            <SheetHeader className="border-b">
              <SheetTitle>
                {isEditing ? "Edit" : "Add"} Industry Partner
              </SheetTitle>
              <SheetDescription>
                {isEditing
                  ? `Update the details for ${editingPartner?.company_name}. Click "update" when you're done.`
                  : 'Fill in the details for creating new industry partner. Click "create" when you\'re done.'}
              </SheetDescription>
            </SheetHeader>
            <fieldset
              disabled={form.formState.isSubmitting}
              className="grid auto-rows-min items-start gap-6 overflow-y-auto p-4"
            >
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-start gap-4">
                    <FormLabel>Company name</FormLabel>
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
                name="companyAddress"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-start gap-4">
                    <Label>Address</Label>
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
                name="companyContactNumber"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-start gap-4">
                    <Label>Company Contact No.</Label>
                    <div className="col-span-2 space-y-2">
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
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="natureOfBusiness"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-start gap-4">
                    <Label>Nature of Business</Label>
                    <div className="col-span-2 space-y-2">
                      <FormControl>
                        <Input {...field} placeholder="Optional" />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfSigning"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-start gap-4">
                    <FormLabel>Date of Signing</FormLabel>
                    <div className="col-span-2 items-end space-y-2">
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
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="moaFile"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Memorandum of Agreement</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {renderFileSelection()}
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf, image/*"
                          onChange={(e) =>
                            handleFileSelect(e.target.files?.[0])
                          }
                          className="hidden"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
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
                    className="cursor-pointer"
                    onClick={() => {
                      form.reset();

                      setSelectedFile(null);
                      setExistingFileName(null);
                      setOpen(false);
                    }}
                    disabled={form.formState.isSubmitting}
                  >
                    Cancel
                  </Button>
                </SheetClose>
                <Button
                  size={"sm"}
                  type="submit"
                  form="industry-partner-form"
                  className="cursor-pointer"
                  disabled={form.formState.isSubmitting}
                >
                  <If
                    condition={form.formState.isSubmitting}
                    fallback={
                      <If condition={isEditing} fallback={"Create Partner"}>
                        Save Changes
                      </If>
                    }
                  >
                    <If condition={isEditing} fallback={"Creating..."}>
                      Updating...
                    </If>
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
