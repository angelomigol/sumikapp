import React from "react";

import { cn } from "@/lib/utils";

import { safeFormatDate } from "@/utils/shared";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AccountDangerZone({
  deletedAt,
}: {
  deletedAt?: string;
}) {
  if (deletedAt) {
    return (
      <Card className="border-destructive bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">Account Deleted</CardTitle>
          <CardDescription>
            This account was permanently deleted on{" "}
            <span className="font-medium">
              {safeFormatDate(deletedAt, "PPPPpppp")}
            </span>
            . No further actions can be taken.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      {/* <Card className="border-destructive">
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
                Archive Account
              </p>
              <p className="text-muted-foreground text-sm">
                Hide the account from active views. Can be restored anytime.
              </p>
            </div>
            <Button variant={"destructive"} size={"sm"}>
              Archive
            </Button>
          </div>

          <Separator orientation="horizontal" className="bg-destructive" />

          <div className="flex items-center justify-between px-6">
            <div className="grid gap-1.5">
              <p className="text-sm leading-none font-medium">
                Suspend Account
              </p>
              <p className="text-muted-foreground text-sm">
                Temporarily restrict access. Can be reactivated later.
              </p>
            </div>
            <Button variant={"destructive"} size={"sm"}>
              Suspend
            </Button>
          </div>

          <Separator orientation="horizontal" className="bg-destructive" />

          <div className="flex items-center justify-between px-6">
            <div className="grid gap-1.5">
              <p className="text-sm leading-none font-medium">
                Deactivate Account
              </p>
              <p className="text-muted-foreground text-sm">
                Permanently disable the account. Cannot be undone.
              </p>
            </div>
            <Button variant={"destructive"} size={"sm"}>
              Deactivate
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </>
  );
}
