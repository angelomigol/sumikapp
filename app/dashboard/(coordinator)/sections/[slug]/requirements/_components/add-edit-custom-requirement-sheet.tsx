"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  useCreateCustomRequirement,
  useUpdateCustomRequirement,
} from "@/hooks/use-batch-requirements";

import { COMMON_FILE_TYPES, FILE_SIZE_OPTIONS } from "@/lib/constants";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { If } from "@/components/sumikapp/if";

import {
  CustomRequirementFormValues,
  customRequirementSchema,
} from "../../../schemas/requirement.schema";

interface AddEditCustomRequirementSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  editingRequirement?: {
    id: string;
    name: string;
    description?: string;
    allowedFileTypes: string[];
    maxFileSizeBytes: number;
  } | null;
  slug: string;
  handleAdd: () => void;
}

export default function AddEditCustomRequirementSheet({
  open,
  setOpen,
  editingRequirement,
  slug,
  handleAdd,
}: AddEditCustomRequirementSheetProps) {
  const createCustomRequirementMutation = useCreateCustomRequirement(slug);
  const updateCustomRequirementMutation = useUpdateCustomRequirement(slug);

  const isEditing = !!editingRequirement;

  const form = useForm<CustomRequirementFormValues>({
    resolver: zodResolver(customRequirementSchema),
    defaultValues: {
      id: editingRequirement?.id,
      name: "",
      description: "",
      allowedFileTypes: [".pdf"],
      maxFileSizeBytes: 5242880,
      slug: slug,
    },
  });

  useEffect(() => {
    if (open && editingRequirement) {
      form.reset({
        id: editingRequirement.id,
        name: editingRequirement.name || "",
        description: editingRequirement.description || "",
        allowedFileTypes: editingRequirement.allowedFileTypes || [],
        maxFileSizeBytes: editingRequirement.maxFileSizeBytes || 5242880,
        slug: slug,
      });
    } else if (open && !editingRequirement) {
      form.reset({
        id: undefined,
        name: "",
        description: "",
        allowedFileTypes: [".pdf"],
        maxFileSizeBytes: 5242880,
        slug: slug,
      });
    }
  }, [open, editingRequirement, form, slug]);

  async function onSubmit(data: CustomRequirementFormValues) {
    let promise;

    if (isEditing && editingRequirement) {
      promise = updateCustomRequirementMutation.mutateAsync({
        ...data,
      });

      toast.promise(promise, {
        loading: "Updating requirement...",
        success: "Requirement updated successfully!",
        error: (err) => {
          if (err instanceof Error) {
            return err.message;
          }
          return "Something went wrong while updating the requirement.";
        },
      });
    } else {
      promise = createCustomRequirementMutation.mutateAsync(data);

      toast.promise(promise, {
        loading: "Adding requirement...",
        success: "Requirement created successfully!",
        error: (err) => {
          if (err instanceof Error) {
            return err.message;
          }
          return "Something went wrong while adding the requirement.";
        },
      });
    }

    await promise;
    form.reset();
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Form {...form}>
        <form
          id="custom-requirement-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <SheetTrigger asChild>
            <Button size={"sm"} onClick={handleAdd}>
              <PlusCircle className="size-4" />
              Add Requirement
            </Button>
          </SheetTrigger>
          <SheetContent
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            className="min-w-1/2 gap-0 [&>button.absolute]:hidden"
          >
            <SheetHeader className="border-b">
              <SheetTitle>
                {isEditing ? "Edit" : "Create"} custom requirement
              </SheetTitle>
              <SheetDescription>
                {isEditing
                  ? 'Update the details for this custom requirement. Click "save changes" when you\'re done.'
                  : 'Fill in the details for the custom requirement. Click "create requirement" when you\'re done.'}
              </SheetDescription>
            </SheetHeader>
            <fieldset
              disabled={form.formState.isSubmitting}
              className="grid auto-rows-min items-start gap-6 overflow-y-auto p-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-start gap-4">
                    <FormLabel>Name</FormLabel>
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
                name="maxFileSizeBytes"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-start gap-4">
                    <FormLabel>File Size Limit</FormLabel>
                    <div className="col-span-2 space-y-2">
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FILE_SIZE_OPTIONS.map((item, index) => (
                            <SelectItem
                              key={index}
                              value={item.value.toString()}
                            >
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
                name="allowedFileTypes"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-start gap-4">
                    <FormLabel>Allowed File Types</FormLabel>
                    <div className="col-span-2 space-y-2">
                      <FormControl>
                        <div className="space-y-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                size={"sm"}
                                variant={"outline"}
                                className="text-muted-foreground w-full justify-start"
                              >
                                Select File Types
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent
                              className="w-full p-0"
                              align="start"
                              sideOffset={8}
                            >
                              <Command>
                                <CommandList>
                                  <CommandEmpty>
                                    No file types found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {COMMON_FILE_TYPES.map((type) => (
                                      <CommandItem
                                        key={type.value}
                                        value={type.value}
                                        onSelect={() => {
                                          const selected = field.value || [];
                                          if (selected.includes(type.value)) {
                                            field.onChange(
                                              selected.filter(
                                                (t) => t !== type.value
                                              )
                                            );
                                          } else {
                                            field.onChange([
                                              ...selected,
                                              type.value,
                                            ]);
                                          }
                                        }}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Checkbox
                                            checked={field.value.includes(
                                              type.value
                                            )}
                                          />
                                          <span>{type.label}</span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>

                                  {field.value?.length > 0 && (
                                    <>
                                      <CommandSeparator />
                                      <CommandGroup>
                                        <CommandItem
                                          onSelect={() => {
                                            field.onChange([]);
                                          }}
                                          className="justify-center text-center"
                                        >
                                          Clear all
                                        </CommandItem>
                                      </CommandGroup>
                                    </>
                                  )}
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {field.value?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {COMMON_FILE_TYPES.filter((type) =>
                                field.value.includes(type.value)
                              ).map((type) => (
                                <Badge
                                  key={type.value}
                                  className="rounded-sm px-1"
                                >
                                  {type.label}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
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
                  form="custom-requirement-form"
                  disabled={form.formState.isSubmitting}
                >
                  <If
                    condition={form.formState.isSubmitting}
                    fallback={
                      <If condition={isEditing} fallback={"Create Requirement"}>
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
