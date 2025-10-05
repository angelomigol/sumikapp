import React from "react";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Gauge,
  Percent,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EvaluationScoresRadialChart from "@/components/charts/evaluation-scores-radial-chart";

export default function EvaluationResultsTabContent({
  results,
}: {
  results?: {
    prediction_label: string | null;
    prediction_probability: number | null;
    confidence_level: string | null;
    prediction_date: string | null;
    evaluation_scores: Record<string, any> | null;
    feature_scores: Record<string, any> | null;
    recommendations: Record<string, any> | null;
    risk_factors: Record<string, any> | null;
  };
}) {
  if (!results) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="text-muted-foreground mx-auto mb-4 size-12" />
          <h3 className="mb-2 text-lg font-semibold">No Evaluation Result</h3>
          <p className="text-muted-foreground">
            No evaluation results are available for this trainee yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-lg p-2">
              <Clock className="text-primary size-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Prediction Result</p>
              <p className="text-2xl font-bold">{results.prediction_label}</p>
            </div>
          </div>
        </div>

        {/* <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-lg p-2">
              <Percent className="text-primary size-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Probability</p>
              <p className="text-2xl font-bold">
                {results.prediction_probability
                  ? (results.prediction_probability * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div> */}

        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-lg p-2">
              <Gauge className="text-primary size-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Confidence Level</p>
              <p className="text-2xl font-bold">{results.confidence_level}</p>
            </div>
          </div>
        </div>
      </div>

      <EvaluationScoresRadialChart
        evaluation_scores={results.evaluation_scores}
      />

      {/* Recommendations */}
      {results.recommendations && (
        <Card className="border-none py-0 shadow-none">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Suggested actions to improve employability
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-4">
              {Array.isArray(results.recommendations)
                ? results.recommendations.map((rec, index) =>
                    typeof rec === "object" ? (
                      <div
                        key={index}
                        className="space-y-2 rounded-lg border bg-blue-50 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">
                            {rec.recommendation}
                          </h4>
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                              rec.priority === "High"
                                ? "bg-red-100 text-red-700"
                                : rec.priority === "Medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          <strong>Area:</strong> {rec.area} |{" "}
                          <strong>Category:</strong> {rec.category}
                        </p>
                        {rec.specific_actions &&
                          Array.isArray(rec.specific_actions) && (
                            <ul className="list-inside list-disc space-y-1 text-sm text-blue-900">
                              {rec.specific_actions.map((action, i) => (
                                <li key={i}>{action}</li>
                              ))}
                            </ul>
                          )}
                        {rec.confidence_score !== undefined && (
                          <p className="text-muted-foreground text-xs">
                            Confidence:{" "}
                            {(rec.confidence_score * 100).toFixed(1)}%
                            {rec.ai_generated && " • AI Suggested"}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg bg-blue-50 p-3"
                      >
                        <CheckCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                        <span className="text-sm">{String(rec)}</span>
                      </div>
                    )
                  )
                : Object.entries(results.recommendations).map(
                    ([category, items]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-medium capitalize">
                          {category.replace(/_/g, " ")}
                        </h4>
                        <div className="space-y-1 pl-4">
                          {Array.isArray(items) ? (
                            items.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 text-sm"
                              >
                                <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                                <span>
                                  {typeof item === "object"
                                    ? JSON.stringify(item)
                                    : String(item)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm">{String(items)}</span>
                          )}
                        </div>
                      </div>
                    )
                  )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
