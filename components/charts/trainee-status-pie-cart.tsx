"use client";

import React from "react";

import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";

interface TraineeStatusPieChartProps {
  data?: {
    totalTrainees: number;
    activeTrainees: number;
    completedTrainees: number;
    notStartedTrainees: number;
    droppedTrainees: number;
  };
}

export default function TraineeStatusPieChart({
  data,
}: TraineeStatusPieChartProps) {
  const total = data?.totalTrainees ?? 0;

  const chartData = [
    { name: "Active", value: data?.activeTrainees ?? 0, color: "#22c55e" },
    {
      name: "Completed",
      value: data?.completedTrainees ?? 0,
      color: "#3b82f6",
    },
    {
      name: "Not Started",
      value: data?.notStartedTrainees ?? 0,
      color: "#facc15",
    },
    { name: "Dropped", value: data?.droppedTrainees ?? 0, color: "#ef4444" },
  ];

  const allZero = chartData.every((d) => d.value === 0);
  const finalChartData = allZero
    ? [{ name: "No Data", value: 1, color: "#e5e7eb" }]
    : chartData;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart width={250} height={250}>
        <Pie
          data={finalChartData}
          cx="50%"
          cy="50%"
          outerRadius={96}
          innerRadius={60}
          dataKey="value"
          stroke="none"
          isAnimationActive
        >
          {finalChartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              className="focus:outline-none"
            />
          ))}

          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                const { cx, cy } = viewBox;
                return (
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={cx}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {total}
                    </tspan>
                    <tspan
                      x={cx}
                      dy="1.5em"
                      className="fill-muted-foreground text-sm"
                    >
                      Students
                    </tspan>
                  </text>
                );
              }
              return null;
            }}
          />
        </Pie>
        <Tooltip content={CustomTooltip} />
      </PieChart>
    </ResponsiveContainer>
  );
}

const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const isNoData = entry.name === "No Data";

    return (
      <div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
        <div className="grid gap-1.5">
          {isNoData ? (
            <div className="text-muted-foreground flex w-full items-center justify-center">
              No Data
            </div>
          ) : (
            payload.map((item, index: number) => (
              <div
                key={`tooltip-item-${index}`}
                className="flex w-full flex-wrap items-center gap-2"
              >
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.payload.color,
                    border: `1px solid ${item.payload.color}`,
                  }}
                />
                <div className="flex flex-1 items-center justify-between leading-none">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="text-foreground font-mono font-medium tabular-nums">
                    {item.value}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
  return null;
};
