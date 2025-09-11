"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  useCreateCustomRequirement,
  useUpdateCustomRequirement,
} from "@/hooks/use-batch-requirements";

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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  CustomRequirementFormValues,
  customRequirementSchema,
} from "../../../schemas/requirement.schema";

interface AddEditCustomRequirementDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  editingRequirement?: {
    id: string;
    name: string;
    description?: string;
  } | null;
  handleAdd: () => void;
  slug: string;
}

export default function AddEditCustomRequirementDialog({
  open,
  setOpen,
  editingRequirement,
  handleAdd,
  slug,
}: AddEditCustomRequirementDialogProps) {
  const createCustomRequirementMutation = useCreateCustomRequirement(slug);
  const updateCustomRequirementMutation = useUpdateCustomRequirement(slug);

  const isEditing = !!editingRequirement;
  const isLoading =
    createCustomRequirementMutation.isPending ||
    updateCustomRequirementMutation.isPending;

  const form = useForm<CustomRequirementFormValues>({
    resolver: zodResolver(customRequirementSchema),
    defaultValues: {
      id: editingRequirement?.id,
      name: "",
      description: "",
      slug: slug,
    },
  });

  useEffect(() => {
    if (open && editingRequirement) {
      form.reset({
        id: editingRequirement.id,
        name: editingRequirement.name || "",
        description: editingRequirement.description || "",
        slug: slug,
      });
    } else if (open && !editingRequirement) {
      form.reset({
        id: undefined,
        name: "",
        description: "",
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
        success: "Requirement successfully updated!",
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
        success: "Requirement successfully created!",
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
    <Dialog open={open} onOpenChange={setOpen}>
      <Form {...form}>
        <form id="requirement-form" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogTrigger asChild>
            <Button size={"sm"}>
              <PlusCircle className="size-4" />
              Add Requirement
            </Button>
          </DialogTrigger>
          <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit" : "Create"} custom requirement
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Update the details for this custom requirement. Click "save changes" when you\'re done.'
                  : 'Fill in the details for the custom requirement. Click "create requirement" when you\'re done.'}
              </DialogDescription>
            </DialogHeader>
            <fieldset disabled={isLoading} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
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
                    <Label>Description</Label>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        className="max-h-40 min-h-20"
                        placeholder="Optional"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>
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
                form="requirement-form"
                className="cursor-pointer"
                disabled={isLoading}
              >
                {isLoading
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Requirement"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
}
