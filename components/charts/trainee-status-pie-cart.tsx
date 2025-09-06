"use client";

import React, { useEffect, useState } from "react";

import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";

const mockData = [
  { name: "Active", value: 45, color: "#22c55e" },
  { name: "Completed", value: 32, color: "#3b82f6" },
  { name: "Dropped", value: 8, color: "#ef4444" },
  { name: "Not Started", value: 15, color: "#f59e0b" },
];

interface TraineeStatusData {
  name: string;
  value: number;
  color: string;
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
        <div className="grid gap-1.5">
          {payload.map((entry: any, index: number) => (
            <div
              key={`tooltip-item-${index}`}
              className="flex w-full flex-wrap items-center gap-2"
            >
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: entry.payload.color,
                  border: `1px solid ${entry.payload.color}`,
                }}
              />

              <div className="flex flex-1 items-center justify-between leading-none">
                <span className="text-muted-foreground">{entry.name}</span>
                <span className="text-foreground font-mono font-medium tabular-nums">
                  {entry.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function TraineeStatusPieChart() {
  const [data, setData] = useState<TraineeStatusData[]>(mockData);
  const [isLoading, setIsLoading] = useState(false);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Function to fetch real data from your database
  const fetchTraineeStatusData = async (batchId?: string) => {
    setIsLoading(true);
    try {
      // Replace this with your actual Supabase query
      // const { data: batchData } = await supabase
      //   .from('program_batch_overview_dashboard')
      //   .select('active_trainees, completed_trainees, dropped_trainees, not_started_trainees')
      //   .eq('batch_id', batchId)
      //   .single();

      // For now, using mock data
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      // Transform your database data to chart format
      // const chartData = [
      //   { name: "Active", value: batchData.active_trainees || 0, color: "#22c55e" },
      //   { name: "Completed", value: batchData.completed_trainees || 0, color: "#3b82f6" },
      //   { name: "Dropped", value: batchData.dropped_trainees || 0, color: "#ef4444" },
      //   { name: "Not Started", value: batchData.not_started_trainees || 0, color: "#f59e0b" }
      // ];

      setData(mockData);
    } catch (error) {
      console.error("Error fetching trainee status data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTraineeStatusData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart width={250} height={250}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={96}
          innerRadius={60}
          dataKey="value"
          stroke="none"
          isAnimationActive={true}
        >
          {data.map((entry, index) => (
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
                      1,125
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
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
