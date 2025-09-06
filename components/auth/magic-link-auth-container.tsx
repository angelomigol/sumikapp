"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { cn } from "@/lib/utils";

import { useCaptchaToken } from "@/utils/captcha/client/use-captcha-token";
import { useSignInWithOtp } from "@/utils/supabase/hooks/use-sign-in-with-otp";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { If } from "@/components/sumikapp/if";

import { AuthErrorAlert } from "./auth-error-alert";

export function MagicLinkAuthContainer({
  redirectUrl,
  defaultValues,
  shouldCreateUser,
}: {
  redirectUrl: string;
  shouldCreateUser: boolean;

  defaultValues?: {
    email: string;
  };
}) {
  const { captchaToken, resetCaptchaToken } = useCaptchaToken();
  const signInWithOtpMutation = useSignInWithOtp();

  const form = useForm({
    resolver: zodResolver(
      z.object({
        email: z.email(),
      })
    ),
    defaultValues: {
      email: defaultValues?.email ?? "",
    },
  });

  const onSubmit = ({ email }: { email: string }) => {
    const url = new URL(redirectUrl);
    const emailRedirectTo = url.href;

    const promise = async () => {
      await signInWithOtpMutation.mutateAsync({
        email,
        options: {
          emailRedirectTo,
          captchaToken,
          shouldCreateUser,
        },
      });
    };

    toast.promise(promise, {
      loading: "Sending Email Link...",
      success: "Link successfully sent",
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while sending your link. Please try again.";
      },
    });

    resetCaptchaToken();
  };

  if (signInWithOtpMutation.data) {
    return <SuccessAlert />;
  }

  return (
    <Form {...form}>
      <form
        className={"w-full space-y-10"}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <If condition={signInWithOtpMutation.error}>
          <AuthErrorAlert error={signInWithOtpMutation.error} />
        </If>

        <div className={"flex flex-col space-y-4"}>
          <FormField
            name={"email"}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email Address</FormLabel>

                <FormControl>
                  <Input
                    className={cn(
                      "text-foreground dark:text-background bg-white dark:bg-white"
                    )}
                    data-test={"email-input"}
                    required
                    type="email"
                    placeholder={"your@email.com"}
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className={cn(
              "bg-[#fab300] font-bold text-black hover:bg-[#d49000] hover:text-black"
            )}
            disabled={signInWithOtpMutation.isPending}
          >
            <If
              condition={signInWithOtpMutation.isPending}
              fallback={"Send Email Link"}
            >
              Sending Email Link...
            </If>
          </Button>
        </div>
      </form>
    </Form>
  );
}

function SuccessAlert() {
  return (
    <Alert>
      <CheckIcon className={"h-4"} />

      <AlertTitle className={cn("line-clamp-2")}>
        We sent you a link by email
      </AlertTitle>

      <AlertDescription>
        Check your email, we just sent you a link. Follow the link to sign in.
      </AlertDescription>
    </Alert>
  );
}
