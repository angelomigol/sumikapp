import React from "react";

export default function EvaluationLegend() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 space-y-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              score: 5,
              label: "Excellent",
              description: "Outstanding performance, exceeds expectations",
              color: "bg-green-100 border-green-300 text-green-800",
            },
            {
              score: 4,
              label: "Very Good",
              description: "Above average performance",
              color: "bg-blue-100 border-blue-300 text-blue-800",
            },
            {
              score: 3,
              label: "Good",
              description: "Meets expectations",
              color: "bg-yellow-100 border-yellow-300 text-yellow-800",
            },
            {
              score: 2,
              label: "Fair",
              description: "Below expectations, needs improvement",
              color: "bg-orange-100 border-orange-300 text-orange-800",
            },
            {
              score: 1,
              label: "Poor",
              description: "Unsatisfactory performance",
              color: "bg-red-100 border-red-300 text-red-800",
            },
          ].map((rating) => (
            <div
              key={rating.score}
              className={`rounded-lg border px-3 py-2 ${rating.color}`}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-lg font-bold">{rating.score}</span>
                <span className="text-xs font-semibold">{rating.label}</span>
              </div>
              <p className="text-xs opacity-90">{rating.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
