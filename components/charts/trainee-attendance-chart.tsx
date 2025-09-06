import React from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { WeeklyAttendanceData } from "@/hooks/use-trainee-dashboard";

export default function TraineeAttendanceChart({
  entries = [],
}: {
  entries?: WeeklyAttendanceData[];
}) {
  const chartData = entries.map((entry) => ({
    displayDate: entry.day,
    hours: entry.hours,
    status: entry.status,
    date: entry.date,
  }));

  const getBarColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "bg-green-11 text-green-3";
      case "late":
        return "bg-amber-11 text-amber-3";
      case "absent":
        return "bg-red-11 text-red-3";
      case "holiday":
        return "bg-blue-11 text-blue-3";
      default:
        return "bg-gray-11 text-gray-3";
    }
  };

  return (
    <ResponsiveContainer width={"100%"} height={"100%"}>
      <BarChart
        title="Weekly Attendance Trend"
        desc="Your attendance trend for the past 7 days"
        accessibilityLayer
        barCategoryGap={"10%"}
        data={chartData}
        barGap={4}
        height={300}
        margin={{
          bottom: 5,
          left: 20,
          right: 30,
          top: 5,
        }}
        syncMethod="index"
        width={500}
      >
        <CartesianGrid strokeDasharray={"3 3"} vertical={false} />
        <XAxis
          dataKey={"displayDate"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-45}
          textAnchor="end"
        />
        <YAxis
          dataKey={"hours"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}h`}
          domain={[0, "dataMax + 2"]}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-background rounded-lg border p-3 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-muted-foreground text-xs capitalize">
                        Status: {data.status ? data.status : "No Data"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Hours:</span>
                      <span className="text-sm font-bold">{data.hours}h</span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey={"hours"} name={"Hours"} radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
