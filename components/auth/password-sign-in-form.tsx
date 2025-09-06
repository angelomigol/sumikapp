"use client";

import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { cn } from "@/lib/utils";

import { PasswordSignInSchema } from "@/schemas/auth/password-sign-in.schema";

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

export function PasswordSignInForm({
  onSubmit,
  loading,
}: {
  onSubmit: (params: z.infer<typeof PasswordSignInSchema>) => unknown;
  loading: boolean;
}) {
  const form = useForm<z.infer<typeof PasswordSignInSchema>>({
    resolver: zodResolver(PasswordSignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form
        className={"w-full space-y-4"}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
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

        <FormField
          control={form.control}
          name={"password"}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Password</FormLabel>

              <FormControl>
                <Input
                  className={cn(
                    "text-foreground dark:text-background bg-white dark:bg-white"
                  )}
                  required
                  data-test={"password-input"}
                  type="password"
                  placeholder={""}
                  {...field}
                />
              </FormControl>

              <FormMessage />

              <Link
                href={"/auth/password-reset"}
                className="text-muted-foreground w-fit text-right text-xs"
              >
                Password forgotten?
              </Link>
            </FormItem>
          )}
        />

        <Button
          data-test="auth-submit-button"
          className={
            "group w-full bg-[#fab300] font-bold text-black hover:bg-[#d49000] hover:text-black"
          }
          type="submit"
          disabled={loading}
        >
          <If
            condition={loading}
            fallback={
              <>
                Sign in with Email
                <ArrowRight
                  className={
                    "zoom-in animate-in slide-in-from-left-2 fill-mode-both h-4 delay-500 duration-500"
                  }
                />
              </>
            }
          >
            Signing in...
          </If>
        </Button>
      </form>
    </Form>
  );
}
