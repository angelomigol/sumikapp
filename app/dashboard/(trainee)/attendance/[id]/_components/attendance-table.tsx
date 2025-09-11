"use client";

import { AttendanceEntry } from "@/hooks/use-attendance-reports";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import AttendanceEntryRow from "./attendance-entry-row";

interface AttendanceTableProps {
  entries: AttendanceEntry[];
  status: string;
  isLoading: boolean;
  onTimeInChange: (entryId: string, timeIn: string) => void;
  onTimeOutChange: (entryId: string, timeOut: string) => void;
  onConfirmEntry: (entryId: string) => void;
}

export default function AttendanceTable({
  entries,
  status,
  isLoading,
  onTimeInChange,
  onTimeOutChange,
  onConfirmEntry,
}: AttendanceTableProps) {
  const canEditEntry = (entry: AttendanceEntry) => {
    return (
      !entry.is_confirmed &&
      (status === "not submitted" || status === "rejected")
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Time-In</TableHead>
          <TableHead>Time-Out</TableHead>
          <TableHead>Total Hours</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <AttendanceEntryRow
            key={entry.id}
            entry={entry}
            isEditable={canEditEntry(entry)}
            isLoading={isLoading}
            onTimeInChange={onTimeInChange}
            onTimeOutChange={onTimeOutChange}
            onConfirmEntry={onConfirmEntry}
          />
        ))}
      </TableBody>
    </Table>
  );
}
