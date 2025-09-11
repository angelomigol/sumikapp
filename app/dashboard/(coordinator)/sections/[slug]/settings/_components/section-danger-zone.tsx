"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import pathsConfig from "@/config/paths.config";

import { cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";

import {
  DeleteSectionSchema,
  deleteSectionSchema,
} from "../../../schemas/delete-section.schema";
import { deleteSectionAction } from "../server/server-actions";

export default function SectionDangerZone(params: {
  id: string;
  isEdit: boolean;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <>
      <If condition={isDeleting}>
        <LoadingOverlay fullPage className="opacity-50" />
      </If>

      <Card className="border-destructive max-w-2xl">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            These actions are permanent or disruptive. Proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className={cn("space-y-4 px-0")}>
          <div className="flex items-center justify-between px-6">
            <div className="grid gap-1.5">
              <p className="text-sm leading-none font-medium">
                Archive Section
              </p>
              <p className="text-muted-foreground text-sm">
                Hide this section from active views. Can be restored anytime.
              </p>
            </div>
            <Button variant={"destructive"} size={"sm"}>
              Archive
            </Button>
          </div>

          <Separator orientation="horizontal" className="bg-destructive" />

          <div className="flex items-center justify-between px-6">
            <div className="grid gap-1.5">
              <p className="text-sm leading-none font-medium">Delete Section</p>
              <p className="text-muted-foreground text-sm">
                Permanently delete the section. Cannot be undone.
              </p>
            </div>

            <DeleteAccountModal
              id={params.id}
              isDeleting={isDeleting}
              setIsDeleting={setIsDeleting}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function DeleteAccountModal({
  id,
  isDeleting,
  setIsDeleting,
}: {
  id: string;
  isDeleting: boolean;
  setIsDeleting: (isDeleting: boolean) => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          data-test={"delete-account-button"}
          size={"sm"}
          variant={"destructive"}
        >
          Delete
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Section</AlertDialogTitle>
        </AlertDialogHeader>

        <DeleteSectionForm
          id={id}
          isDeleting={isDeleting}
          setIsDeleting={setIsDeleting}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteSectionForm({
  id,
  isDeleting,
  setIsDeleting,
}: {
  id: string;
  isDeleting: boolean;
  setIsDeleting: (isDeleting: boolean) => void;
}) {
  const router = useRouter();

  const form = useForm<DeleteSectionSchema>({
    resolver: zodResolver(deleteSectionSchema),
    defaultValues: {
      confirmation: "" as "DELETE",
      id: id,
    },
  });

  const onSubmit = async (data: DeleteSectionSchema) => {
    if (data.confirmation !== "DELETE") {
      form.setError("confirmation", {
        message: "Please type DELETE to confirm",
      });

      return;
    }

    setIsDeleting(true);

    const formData = new FormData();
    formData.append("confirmation", data.confirmation);
    formData.append("id", data.id);

    const promise = async () => {
      await deleteSectionAction(formData);
    };

    toast.promise(promise, {
      loading: "Deleting section...",
      success: () => {
        setTimeout(() => {
          router.push(pathsConfig.app.sections);
          router.refresh();
        }, 500);
        return "Section deleted successfully!";
      },
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while deleting section. Please try again.";
      },
    });
  };

  return (
    <Form {...form}>
      <form
        data-test={"delete-section-form"}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-4"
      >
        <div className="flex flex-col space-y-6">
          <div className="border-destructive text-destructive rounded-md border p-4 text-sm">
            <div className="flex flex-col space-y-2">
              <div>
                This will delete your section and other data associated with it.
                This action cannot be undone.
              </div>

              <div>Are you sure you want to continue?</div>
            </div>
          </div>

          <input type="hidden" name="id" value={id} />

          <FormField
            control={form.control}
            name="confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type DELETE to confirm</FormLabel>
                <FormControl>
                  <Input
                    data-test={"delete-account-input-field"}
                    autoComplete={"off"}
                    required
                    type={"text"}
                    className={"w-full"}
                    placeholder={""}
                    pattern={`DELETE`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

          <Button
            data-test={"confirm-delete-section-button"}
            type={"submit"}
            disabled={form.watch("confirmation") !== "DELETE" || isDeleting}
            variant={"destructive"}
          >
            {isDeleting ? "Deleting Section..." : "Delete Section"}
          </Button>
        </AlertDialogFooter>
      </form>
    </Form>
  );
}
