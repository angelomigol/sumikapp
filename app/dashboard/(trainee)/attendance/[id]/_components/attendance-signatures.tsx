"use client";

import { safeFormatDate } from "@/utils/shared";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AttendanceSignaturesProps {
  allEntriesConfirmed: boolean;
  isInternSigned: boolean;
  isLoading: boolean;
  status: string;
  supervisorApprovedAt?: string | null;
  onInternSignChange: (checked: boolean) => void;
}

export default function AttendanceSignatures({
  allEntriesConfirmed,
  isInternSigned,
  isLoading,
  status,
  supervisorApprovedAt,
  onInternSignChange,
}: AttendanceSignaturesProps) {
  return (
    <div className="justify-between space-y-8 md:flex md:gap-8">
      <div className="space-y-2">
        <Label>Intern Signature</Label>
        <Label
          htmlFor="internSignature"
          className={`${!allEntriesConfirmed ? "text-muted-foreground" : "text-foreground"}`}
        >
          <Checkbox
            id="internSignature"
            checked={isInternSigned}
            disabled={
              !allEntriesConfirmed ||
              isLoading ||
              status === "pending" ||
              status === "approved"
            }
            onCheckedChange={(checked) => onInternSignChange(checked === true)}
          />
          I verify that the above information is correct
        </Label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="supervisor-signature">Supervisor Signature</Label>
        {supervisorApprovedAt ? (
          <Label>
            Approved by your Supervisor on{" "}
            {safeFormatDate(supervisorApprovedAt, "PP")}
          </Label>
        ) : (
          <Label className="text-muted-foreground italic">
            (To be reviewed by your supervisor)
          </Label>
        )}
      </div>
    </div>
  );
}
