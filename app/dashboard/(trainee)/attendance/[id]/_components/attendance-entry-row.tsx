"use client";

import { AttendanceEntry } from "@/hooks/use-attendance-reports";

import { safeFormatDate } from "@/utils/shared";

import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import CheckboxEntryDialog from "@/components/sumikapp/checkbox-entry-dialog";

interface AttendanceEntryRowProps {
  entry: AttendanceEntry;
  isEditable: boolean;
  isLoading: boolean;
  onTimeInChange: (entryId: string, timeIn: string) => void;
  onTimeOutChange: (entryId: string, timeOut: string) => void;
  onConfirmEntry: (entryId: string) => void;
}

export default function AttendanceEntryRow({
  entry,
  isEditable,
  isLoading,
  onTimeInChange,
  onTimeOutChange,
  onConfirmEntry,
}: AttendanceEntryRowProps) {
  const isConfirmed = entry.is_confirmed;

  return (
    <TableRow>
      <TableCell className="min-w-[150px]">
        {safeFormatDate(entry.entry_date, "PP")}
      </TableCell>
      <TableCell>
        <Input
          type="time"
          value={entry.time_in || ""}
          onChange={(e) => onTimeInChange(entry.id, e.target.value)}
          disabled={isLoading || !isEditable}
          className={!isEditable ? "cursor-not-allowed" : ""}
        />
      </TableCell>
      <TableCell>
        <Input
          type="time"
          value={entry.time_out || ""}
          onChange={(e) => onTimeOutChange(entry.id, e.target.value)}
          disabled={isLoading || !isEditable}
          className={!isEditable ? "cursor-not-allowed" : ""}
        />
      </TableCell>
      <TableCell>
        <Input
          className="bg-muted w-fit"
          readOnly
          value={entry.total_hours > 0 ? `${entry.total_hours} hrs` : "0 hrs"}
        />
      </TableCell>
      <TableCell className="text-end">
        <CheckboxEntryDialog
          disabled={isLoading}
          isConfirmed={isConfirmed}
          canConfirm={isEditable && entry.time_in && entry.time_out}
          onConfirm={() => onConfirmEntry(entry.id)}
        />
      </TableCell>
    </TableRow>
  );
}
