import React from "react";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";

import { Card } from "../ui/card";

type EvaluationScores = {
  [key: string]:
    | number
    | {
        [key: string]: number;
      };
};

type ChartData = {
  subject: string;
  score: number;
};

export default function EvaluationScoresRadialChart({
  evaluation_scores,
}: {
  evaluation_scores: EvaluationScores | null;
}) {
  if (!evaluation_scores) {
    return (
      <p className="text-muted-foreground">No evaluation scores available</p>
    );
  }

  const prepareData = (scores: EvaluationScores): ChartData[] => {
    const data: ChartData[] = [];

    Object.entries(scores).forEach(([category, value]) => {
      if (category === "overall_rating") return;

      if (typeof value === "number") {
        data.push({
          subject: category.replace(/_/g, " "),
          score: value,
        });
      } else if (typeof value === "object") {
        Object.entries(value).forEach(([subKey, subValue]) => {
          data.push({
            subject: subKey.replace(/_/g, " "),
            score: subValue,
          });
        });
      }
    });

    return data;
  };

  const chartData = prepareData(evaluation_scores);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-2 shadow-md">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-primary font-bold">Score: {payload[0].value}</p>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#6366F1" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 12, fill: "#374151" }}
          />
          <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Evaluation"
            dataKey="score"
            stroke="#6366F1"
            fill="url(#radarGradient)"
            fillOpacity={0.8}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
