"use client";

import React, { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Announcement,
  useCreateAnnouncement,
  useUpdateAnnouncement,
} from "@/hooks/use-announcements";

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
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/rich-text-editor";

import {
  AnnouncementFormValues,
  announcementSchema,
} from "../schema/announcement.schema";

interface AddEditAnnouncementDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  editingAnnouncement?: Announcement | null;
  handleAdd: () => void;
  slug: string;
}

export default function AddEditAnnouncementDialog({
  open,
  setOpen,
  editingAnnouncement,
  handleAdd,
  slug,
}: AddEditAnnouncementDialogProps) {
  const createAnnouncementMutation = useCreateAnnouncement(slug);
  const updateAnnouncementMutation = useUpdateAnnouncement(slug);

  const isEditing = !!editingAnnouncement;
  const isLoading =
    createAnnouncementMutation.isPending ||
    updateAnnouncementMutation.isPending;

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      id: editingAnnouncement?.id,
      title: "",
      content: "",
      slug: slug,
    },
  });

  useEffect(() => {
    if (open && editingAnnouncement) {
      form.reset({
        id: editingAnnouncement.id,
        title: editingAnnouncement.title || "",
        content: editingAnnouncement.content || "",
        slug: slug,
      });
    } else if (open && !editingAnnouncement) {
      form.reset({
        id: undefined,
        title: "",
        content: "",
        slug: slug,
      });
    }
  }, [open, editingAnnouncement, form, slug]);

  async function onSubmit(data: AnnouncementFormValues) {
    let promise;

    if (isEditing && editingAnnouncement) {
      promise = updateAnnouncementMutation.mutateAsync({
        ...data,
      });

      toast.promise(promise, {
        loading: "Updating announcement...",
        success: "Announcement updated successfully!",
        error: (err) => {
          if (err instanceof Error) {
            return err.message;
          }
          return "Something went wrong while updating announcement.";
        },
      });
    } else {
      promise = createAnnouncementMutation.mutateAsync({ ...data });

      toast.promise(promise, {
        loading: "Posting announcement...",
        success: "Annnoucement posted successfully!",
        error: (error) => {
          if (error instanceof Error) {
            return error.message;
          }
          return "Something went wrong while posting announcement.";
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
        <form id="announcement-form" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogTrigger asChild>
            <Button size={"sm"} onClick={handleAdd}>
              <PlusCircle className="size-4" />
              Add Announcement
            </Button>
          </DialogTrigger>
          <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            className="w-full"
          >
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit" : "Add"} Announcement
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? `Update the details for this announcement. Click "update" when you're done.`
                  : 'Fill in the details for creating new announcement. Click "create" when you\'re done.'}
              </DialogDescription>
            </DialogHeader>
            <fieldset disabled={isLoading} className="w-full space-y-6 pt-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Announcement title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="h-40 max-h-40 resize-none"
                      />
                      {/* <RichTextEditor {...field} /> */}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>
            <DialogFooter className="md:justify-between">
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
                form="announcement-form"
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
