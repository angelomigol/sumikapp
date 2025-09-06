"use client";

import { useState } from "react";

import type { User } from "@supabase/supabase-js";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, TriangleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PasswordUpdateSchema } from "@/schemas/auth/update-password.schema";

import { If } from "../sumikapp/if";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
// import { useUpdateUser } from "@kit/supabase/hooks/use-update-user-mutation";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export const UpdatePasswordForm = ({
  user,
  callbackPath,
}: {
  user: User;
  callbackPath: string;
}) => {
  const updateUserMutation = useUpdateUser();
  const [needsReauthentication, setNeedsReauthentication] = useState(false);

  const updatePasswordFromCredential = (password: string) => {
    const redirectTo = [window.location.origin, callbackPath].join("");

    const promise = updateUserMutation
      .mutateAsync({ password, redirectTo })
      .catch((error) => {
        if (
          typeof error === "string" &&
          error?.includes("Password update requires reauthentication")
        ) {
          setNeedsReauthentication(true);
        } else {
          throw error;
        }
      });

    toast.promise(() => promise, {
      success: "Password update request successful",
      error: "Encountered an error. Please try again",
      loading: "Updating password...",
    });
  };

  const updatePasswordCallback = async ({
    newPassword,
  }: {
    newPassword: string;
  }) => {
    const email = user.email;

    // if the user does not have an email assigned, it's possible they
    // don't have an email/password factor linked, and the UI is out of sync
    if (!email) {
      return Promise.reject(
        "You cannot update your password because your account is not linked to any."
      );
    }

    updatePasswordFromCredential(newPassword);
  };

  const form = useForm({
    resolver: zodResolver(PasswordUpdateSchema),
    defaultValues: {
      newPassword: "",
      repeatPassword: "",
    },
  });

  return (
    <Form {...form}>
      <form
        data-test={"account-password-form"}
        onSubmit={form.handleSubmit(updatePasswordCallback)}
      >
        <div className={"flex flex-col space-y-4"}>
          <If condition={updateUserMutation.data}>
            <SuccessAlert />
          </If>

          <If condition={needsReauthentication}>
            <NeedsReauthenticationAlert />
          </If>

          <FormField
            name={"newPassword"}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>
                    <Label>New Password</Label>
                  </FormLabel>

                  <FormControl>
                    <Input
                      data-test={"account-password-form-password-input"}
                      required
                      type={"password"}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            name={"repeatPassword"}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>
                    <Label>Repeat Password</Label>
                  </FormLabel>

                  <FormControl>
                    <Input
                      data-test={"account-password-form-repeat-password-input"}
                      required
                      type={"password"}
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    Please repeat your new password to confirm it
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div>
            <Button disabled={updateUserMutation.isPending}>
              Update Password
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

function SuccessAlert() {
  return (
    <Alert>
      <Check className={"h-4"} />

      <AlertTitle>Password update request successful</AlertTitle>

      <AlertDescription>
        Your password has been successfully updated!
      </AlertDescription>
    </Alert>
  );
}

function NeedsReauthenticationAlert() {
  return (
    <Alert variant={"destructive"}>
      <TriangleAlert className={"h-4"} />

      <AlertTitle>Reauthentication Required</AlertTitle>

      <AlertDescription>
        You need to reauthenticate to change your password. Please sign out and
        sign in again to change your password.
      </AlertDescription>
    </Alert>
  );
}
