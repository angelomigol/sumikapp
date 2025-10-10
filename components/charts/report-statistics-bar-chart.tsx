import React from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

interface ReportStatisticsBarChartProps {
  data?: {
    totalAttendanceReports: number;
    approvedAttendanceReports: number;
    pendingAttendanceReports: number;
    totalActivityReports: number;
    approvedActivityReports: number;
    pendingActivityeReports: number;
  };
}

export default function ReportStatisticsBarChart({
  data,
}: ReportStatisticsBarChartProps) {
  const reportData = [
    {
      type: "Attendance",
      approved: data?.approvedAttendanceReports,
      pending: data?.pendingAttendanceReports,
    },
    {
      type: "Accomplishment",
      approved: data?.approvedActivityReports,
      pending: data?.pendingActivityeReports,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={reportData}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray={1} stroke="#ccc" vertical={false} />
        <XAxis dataKey="type" tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            fontSize: "12px",
          }}
        />
        <Legend
          wrapperStyle={{
            paddingTop: "12px",
          }}
          iconType="rect"
          formatter={(value) => (
            <span className="text-muted-foreground text-xs">{value}</span>
          )}
        />
        <Bar dataKey="approved" fill="#4ade80" radius={4} />
        <Bar dataKey="pending" fill="#fbbf24" radius={4} />
      </BarChart>
    </ResponsiveContainer>
  );
}
