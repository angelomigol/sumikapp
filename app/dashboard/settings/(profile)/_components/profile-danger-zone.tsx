import React from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfileDangerZone() {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          These actions are permanent or disruptive. Proceed with caution.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("px-0")}>
        <div className="flex items-center justify-between px-6">
          <div className="grid gap-1.5">
            <p className="text-sm leading-none font-medium">
              Deactivate Account
            </p>
            <p className="text-muted-foreground text-sm max-w-md">
              This will request account deactivation and notify the
              administrator for review and permanent deletion.
            </p>
          </div>
          <Button variant={"destructive"} size={"sm"}>
            Deactivate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
