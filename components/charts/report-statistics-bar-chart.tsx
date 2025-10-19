import React from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
} from "recharts";

interface ReportStatisticsBarChartProps {
  data?: Array<{
    week: string;
    week_number: number;
    start_date: string;
    end_date: string | null;
    approved: number;
    pending: number;
    rejected: number;
    total: number;
  }>;
}

export default function ReportStatisticsBarChart({
  data,
}: ReportStatisticsBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray={1} stroke="#ccc" vertical={false} />
        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
        <Legend
          wrapperStyle={{
            paddingTop: "10px",
          }}
          iconType="rect"
          formatter={(value) => (
            <span className="text-muted-foreground text-xs capitalize">
              {value}
            </span>
          )}
        />

        <Bar
          dataKey="approved"
          fill="#4ade80"
          name="Approved"
          radius={[6, 6, 0, 0]}
        />
        <Bar
          dataKey="pending"
          fill="#fbbf24"
          name="Pending"
          radius={[6, 6, 0, 0]}
        />
        <Bar
          dataKey="rejected"
          fill="#f87171"
          name="Rejected"
          radius={[6, 6, 0, 0]}
        />
        <Tooltip content={CustomTooltip} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
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
            <div>
              {payload.map((item, index: number) => (
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
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};
