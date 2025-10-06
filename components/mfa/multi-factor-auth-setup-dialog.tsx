"use client";

import { useCallback, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, TriangleAlert } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useSupabase } from "@/utils/supabase/hooks/use-supabase";
import { useFactorsMutationKey } from "@/utils/supabase/hooks/use-user-factors-mutation-key";

import { refreshAuthSession } from "@/app/dashboard/(admin)/users/server/server-actions";

import { If } from "../sumikapp/if";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import Image from "next/image";

export function MultiFactorAuthSetupDialog(props: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const onEnrollSuccess = useCallback(() => {
    setIsOpen(false);

    return toast.success("Factor successfully enrolled");
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Setup a new Factor</Button>
      </DialogTrigger>

      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Setup a new Factor</DialogTitle>

          <DialogDescription>
            Set up Multi-Factor Authentication method to further secure your
            account
          </DialogDescription>
        </DialogHeader>

        <div>
          <MultiFactorAuthSetupForm
            userId={props.userId}
            onCancel={() => setIsOpen(false)}
            onEnrolled={onEnrollSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MultiFactorAuthSetupForm({
  onEnrolled,
  onCancel,
  userId,
}: React.PropsWithChildren<{
  userId: string;
  onCancel: () => void;
  onEnrolled: () => void;
}>) {
  const verifyCodeMutation = useVerifyCodeMutation(userId);

  const verificationCodeForm = useForm({
    resolver: zodResolver(
      z.object({
        factorId: z.string().min(1),
        verificationCode: z.string().min(6).max(6),
      })
    ),
    defaultValues: {
      factorId: "",
      verificationCode: "",
    },
  });

  const [state, setState] = useState({
    loading: false,
    error: "",
  });

  const factorId = useWatch({
    name: "factorId",
    control: verificationCodeForm.control,
  });

  const onSubmit = useCallback(
    async ({
      verificationCode,
      factorId,
    }: {
      verificationCode: string;
      factorId: string;
    }) => {
      setState({
        loading: true,
        error: "",
      });

      try {
        await verifyCodeMutation.mutateAsync({
          factorId,
          code: verificationCode,
        });

        await refreshAuthSession();

        setState({
          loading: false,
          error: "",
        });

        onEnrolled();
      } catch (error) {
        const message = (error as Error).message || `Unknown error`;

        setState({
          loading: false,
          error: message,
        });
      }
    },
    [onEnrolled, verifyCodeMutation]
  );

  if (state.error) {
    return <ErrorAlert />;
  }

  return (
    <div className={"flex flex-col space-y-4"}>
      <div className={"flex justify-center"}>
        <FactorQrCode
          userId={userId}
          onCancel={onCancel}
          onSetFactorId={(factorId) =>
            verificationCodeForm.setValue("factorId", factorId)
          }
        />
      </div>

      <If condition={factorId}>
        <Form {...verificationCodeForm}>
          <form
            onSubmit={verificationCodeForm.handleSubmit(onSubmit)}
            className={"w-full"}
          >
            <div className={"flex flex-col space-y-8"}>
              <FormField
                render={({ field }) => {
                  return (
                    <FormItem
                      className={
                        "mx-auto flex flex-col items-center justify-center"
                      }
                    >
                      <FormControl>
                        <InputOTP {...field} maxLength={6} minLength={6}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>

                      <FormDescription>
                        Enter the verification code generated by your
                        authenticator app
                      </FormDescription>

                      <FormMessage />
                    </FormItem>
                  );
                }}
                name={"verificationCode"}
              />

              <div className={"flex justify-end space-x-2"}>
                <Button type={"button"} variant={"ghost"} onClick={onCancel}>
                  Cancel
                </Button>

                <Button
                  disabled={
                    !verificationCodeForm.formState.isValid || state.loading
                  }
                  type={"submit"}
                >
                  {state.loading ? "Verifying code..." : "Enable Factor"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </If>
    </div>
  );
}

function FactorQrCode({
  onSetFactorId,
  onCancel,
  userId,
}: React.PropsWithChildren<{
  userId: string;
  onCancel: () => void;
  onSetFactorId: (factorId: string) => void;
}>) {
  const enrollFactorMutation = useEnrollFactor(userId);
  const [error, setError] = useState<string>("");

  const form = useForm({
    resolver: zodResolver(
      z.object({
        factorName: z.string().min(1),
        qrCode: z.string().min(1),
      })
    ),
    defaultValues: {
      factorName: "",
      qrCode: "",
    },
  });

  const factorName = useWatch({ name: "factorName", control: form.control });

  if (error) {
    return (
      <div className={"flex w-full flex-col space-y-2"}>
        <Alert variant={"destructive"}>
          <TriangleAlert className={"h-4"} />

          <AlertTitle>QR Code Error</AlertTitle>

          <AlertDescription>
            {error ?? "Sorry, we weren't able to generate the QR code"}
          </AlertDescription>
        </Alert>

        <div>
          <Button variant={"outline"} onClick={onCancel}>
            <ArrowLeftIcon className={"h-4"} />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!factorName) {
    return (
      <FactorNameForm
        onCancel={onCancel}
        onSetFactorName={async (name) => {
          const response = await enrollFactorMutation.mutateAsync(name);

          if (!response.success) {
            return setError(response.data as string);
          }

          const data = response.data;

          if (data.type === "totp") {
            form.setValue("factorName", name);
            form.setValue("qrCode", data.totp.qr_code);
          }

          // dispatch event to set factor ID
          onSetFactorId(data.id);
        }}
      />
    );
  }

  return (
    <div className={"flex flex-col space-y-4"}>
      <p>
        <span className={"text-muted-foreground text-sm"}>
          Use your authenticator app to scan the QR code below. Then enter the
          code generated.
        </span>
      </p>

      <div className={"flex justify-center"}>
        <QrImage src={form.getValues("qrCode")} />
      </div>
    </div>
  );
}

function FactorNameForm(
  props: React.PropsWithChildren<{
    onSetFactorName: (name: string) => void;
    onCancel: () => void;
  }>
) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1),
      })
    ),
    defaultValues: {
      name: "",
    },
  });

  return (
    <Form {...form}>
      <form
        className={"w-full"}
        onSubmit={form.handleSubmit((data) => {
          props.onSetFactorName(data.name);
        })}
      >
        <div className={"flex flex-col space-y-4"}>
          <FormField
            name={"name"}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>
                    A memorable name to identify this factor
                  </FormLabel>

                  <FormControl>
                    <Input autoComplete={"off"} required {...field} />
                  </FormControl>

                  <FormDescription>
                    Use an easy-to-remember name to easily identify this factor
                    in the future. Ex. iPhone 14
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div className={"flex justify-end space-x-2"}>
            <Button type={"button"} variant={"ghost"} onClick={props.onCancel}>
              Cancel
            </Button>

            <Button type={"submit"}>Set factor name</Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

function QrImage({ src }: { src: string }) {
  return (
    <Image
      alt={"QR Code"}
      src={src}
      width={160}
      height={160}
      className={"bg-white p-2"}
    />
  );
}

function useEnrollFactor(userId: string) {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const mutationKey = useFactorsMutationKey(userId);

  const mutationFn = async (factorName: string) => {
    const response = await client.auth.mfa.enroll({
      friendlyName: factorName,
      factorType: "totp",
    });

    if (response.error) {
      return {
        success: false as const,
        data: response.error.code,
      };
    }

    return {
      success: true as const,
      data: response.data,
    };
  };

  return useMutation({
    mutationFn,
    mutationKey,
    onSuccess() {
      return queryClient.refetchQueries({
        queryKey: mutationKey,
      });
    },
  });
}

function useVerifyCodeMutation(userId: string) {
  const mutationKey = useFactorsMutationKey(userId);
  const queryClient = useQueryClient();
  const client = useSupabase();

  const mutationFn = async (params: { factorId: string; code: string }) => {
    const challenge = await client.auth.mfa.challenge({
      factorId: params.factorId,
    });

    if (challenge.error) {
      throw challenge.error;
    }

    const challengeId = challenge.data.id;

    const verify = await client.auth.mfa.verify({
      factorId: params.factorId,
      code: params.code,
      challengeId,
    });

    if (verify.error) {
      throw verify.error;
    }

    return verify;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      return queryClient.refetchQueries({ queryKey: mutationKey });
    },
  });
}

function ErrorAlert() {
  return (
    <Alert variant={"destructive"}>
      <TriangleAlert className={"h-4"} />

      <AlertTitle>Setup Failed</AlertTitle>

      <AlertDescription>
        Sorry, there was an error while setting up your factor. Please try
        again.
      </AlertDescription>
    </Alert>
  );
}
