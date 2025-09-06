"use client";

import { useCallback, useState } from "react";

import type { Factor } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";

import { useFetchAuthFactors } from "@/utils/supabase/hooks/use-fetch-mfa-factors";
import { useSupabase } from "@/utils/supabase/hooks/use-supabase";
import { useFactorsMutationKey } from "@/utils/supabase/hooks/use-user-factors-mutation-key";

import { If } from "../sumikapp/if";
import { Spinner } from "../sumikapp/spinner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { MultiFactorAuthSetupDialog } from "./multi-factor-auth-setup-dialog";

export function MultiFactorAuthFactorsList(props: { userId: string }) {
  return (
    <div className={"flex flex-col space-y-4"}>
      <FactorsTableContainer userId={props.userId} />

      <div>
        <MultiFactorAuthSetupDialog userId={props.userId} />
      </div>
    </div>
  );
}

function FactorsTableContainer(props: { userId: string }) {
  const {
    data: factors,
    isLoading,
    isError,
  } = useFetchAuthFactors(props.userId);

  if (isLoading) {
    return (
      <div className={"flex items-center space-x-4"}>
        <Spinner />
        Loading factors...
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <Alert variant={"destructive"}>
          <TriangleAlert className={"h-4"} />

          <AlertTitle>Error loading factors list</AlertTitle>

          <AlertDescription>
            Sorry, we couldn't load the factors list. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const allFactors = factors?.all ?? [];

  if (!allFactors.length) {
    return (
      <div className={"flex flex-col space-y-4"}>
        <Alert>
          <ShieldCheck className={"h-4"} />

          <AlertTitle>
            Secure your account with Multi-Factor Authentication
          </AlertTitle>

          <AlertDescription>
            Set up Multi-Factor Authentication method to further secure your
            account
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <FactorsTable factors={allFactors} userId={props.userId} />;
}

function ConfirmUnenrollFactorModal(
  props: React.PropsWithChildren<{
    factorId: string;
    userId: string;
    setIsModalOpen: (isOpen: boolean) => void;
  }>
) {
  const unEnroll = useUnenrollFactor(props.userId);

  const onUnenrollRequested = useCallback(
    (factorId: string) => {
      if (unEnroll.isPending) return;

      const promise = unEnroll.mutateAsync(factorId).then((response) => {
        props.setIsModalOpen(false);

        if (!response.success) {
          const errorCode = response.data;

          throw errorCode ?? "Unenrolling factor failed";
        }
      });

      toast.promise(promise, {
        loading: "Unenrolling factor...",
        success: "Factor successfully unenrolled",
        error: (error: string) => {
          return error;
        },
      });
    },
    [props, unEnroll]
  );

  return (
    <AlertDialog open={!!props.factorId} onOpenChange={props.setIsModalOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unenroll Factor</AlertDialogTitle>

          <AlertDialogDescription>
            You're about to unenroll this factor. You will not be able to use it
            to login to your account.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            type={"button"}
            disabled={unEnroll.isPending}
            onClick={() => onUnenrollRequested(props.factorId)}
          >
            Yes, unenroll factor
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function FactorsTable({
  factors,
  userId,
}: React.PropsWithChildren<{
  factors: Factor[];
  userId: string;
}>) {
  const [unEnrolling, setUnenrolling] = useState<string>();

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Factor Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>

            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {factors.map((factor) => (
            <TableRow key={factor.id}>
              <TableCell>
                <span className={"block truncate"}>{factor.friendly_name}</span>
              </TableCell>

              <TableCell>
                <Badge className={"inline-flex uppercase"}>
                  {factor.factor_type}
                </Badge>
              </TableCell>

              <td>
                <Badge
                  className={"inline-flex capitalize"}
                  // variant={factor.status === "verified" ? "success" : "outline"}
                >
                  {factor.status}
                </Badge>
              </td>

              <td className={"flex justify-end"}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={"ghost"}
                        size={"icon"}
                        onClick={() => setUnenrolling(factor.id)}
                      >
                        <X className={"h-4"} />
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent>Unenroll this factor</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </td>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <If condition={unEnrolling}>
        {(factorId) => (
          <ConfirmUnenrollFactorModal
            userId={userId}
            factorId={factorId}
            setIsModalOpen={() => setUnenrolling(undefined)}
          />
        )}
      </If>
    </>
  );
}

function useUnenrollFactor(userId: string) {
  const queryClient = useQueryClient();
  const client = useSupabase();
  const mutationKey = useFactorsMutationKey(userId);

  const mutationFn = async (factorId: string) => {
    const { data, error } = await client.auth.mfa.unenroll({
      factorId,
    });

    if (error) {
      return {
        success: false as const,
        data: error.code as string,
      };
    }

    return {
      success: true as const,
      data,
    };
  };

  return useMutation({
    mutationFn,
    mutationKey,
    onSuccess: () => {
      return queryClient.refetchQueries({
        queryKey: mutationKey,
      });
    },
  });
}
