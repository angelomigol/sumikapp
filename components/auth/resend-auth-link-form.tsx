"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";

import { useCaptchaToken } from "@/utils/captcha/client/use-captcha-token";
import { useSupabase } from "@/utils/supabase/hooks/use-supabase";

import { If } from "../sumikapp/if";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";

export function ResendAuthLinkForm(props: { redirectPath?: string }) {
  const resendLink = useResendLink();

  const form = useForm({
    resolver: zodResolver(z.object({ email: z.string().email() })),
    defaultValues: {
      email: "",
    },
  });

  if (resendLink.data && !resendLink.isPending) {
    return (
      <Alert>
        <AlertTitle>Check your email!</AlertTitle>

        <AlertDescription>
          We sent you a new link to your email! Follow the link to sign in.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form
        className={"flex flex-col space-y-2"}
        onSubmit={form.handleSubmit((data) => {
          return resendLink.mutate({
            email: data.email,
            redirectPath: props.redirectPath,
          });
        })}
      >
        <div className={"flex flex-col space-y-4"}>
          <FormField
            name={"email"}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="text-white">Email Address</FormLabel>

                  <FormControl>
                    <Input
                      className={cn(
                        "text-foreground dark:text-background bg-white dark:bg-white"
                      )}
                      required
                      type="email"
                      placeholder={"your@email.com"}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />

          <Button
            disabled={resendLink.isPending}
            className={cn(
              "bg-[#fab300] font-bold text-black hover:bg-[#d49000] hover:text-black"
            )}
          >
            <If condition={resendLink.isPending} fallback={"Resend Link"}>
              Resending Email Link...
            </If>
          </Button>
        </div>
      </form>
    </Form>
  );
}

function useResendLink() {
  const supabase = useSupabase();
  const { captchaToken } = useCaptchaToken();

  const mutationFn = async (props: {
    email: string;
    redirectPath?: string;
  }) => {
    const response = await supabase.auth.resend({
      email: props.email,
      type: "signup",
      options: {
        emailRedirectTo: props.redirectPath,
        captchaToken,
      },
    });

    if (response.error) {
      throw response.error;
    }

    return response.data;
  };

  return useMutation({
    mutationFn,
  });
}
