"use client";

import { Label } from "@/components/ui/label";

interface AttendanceSummaryProps {
  previousTotal: number;
  periodTotal: number;
  totalHoursServed: number;
}

export default function AttendanceSummary({
  previousTotal,
  periodTotal,
  totalHoursServed,
}: AttendanceSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label>Previous Total</Label>
        <span className="font-medium">{previousTotal}</span>
      </div>
      <div className="space-y-2">
        <Label>Total this Period</Label>
        <span className="font-medium">{periodTotal}</span>
      </div>
      <div className="space-y-2">
        <Label>Total Hours Served</Label>
        <span className="font-medium">{totalHoursServed}</span>
      </div>
    </div>
  );
}
