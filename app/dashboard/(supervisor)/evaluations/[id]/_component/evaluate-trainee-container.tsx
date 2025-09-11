"use client";

import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup } from "@radix-ui/react-radio-group";
import { Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";

import { evaluationConfig } from "@/config/evaluation-config";
import pathsConfig from "@/config/paths.config";
import {
  EvaluationScores,
  PredictionResponse,
  transformFormToApiPayload,
} from "@/hooks/use-evaluation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import BackButton from "@/components/sumikapp/back-button";

import { employabilityPrediction } from "@/app/dashboard/(coordinator)/sections/[slug]/(overview)/server/services/employability-prediction.service";

const createEvaluationSchema = () => {
  const schemaObject: Record<string, z.ZodTypeAny> = {};

  evaluationConfig.sections.forEach((section) => {
    section.criteria.forEach((criterion) => {
      schemaObject[criterion.key] = z
        .string()
        .min(1, "This field is required")
        .transform((val) => parseInt(val, 10))
        .refine((val) => val >= 1 && val <= 5, {
          message: "Score must be between 1 and 5",
        });

      if (criterion.hasRemarks) {
        schemaObject[`${criterion.key}_remarks`] = z.string().optional();
      }
    });
  });

  schemaObject["overall_performance"] = z
    .string()
    .min(1, "Overall performance rating is required")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 5, {
      message: "Score must be between 1 and 5",
    });

  schemaObject["overall_performance_remarks"] = z.string().optional();

  return z.object(schemaObject);
};

const evaluationSchema = createEvaluationSchema();
type EvaluationFormValues = z.infer<typeof evaluationSchema>;

export default function EvaluateTraineeContainer(params: {
  traineeId: string;
  evaluatorId: string;
}) {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const results = computeEvaluationScore(responses);

  const handleScoreChange = (criterionKey: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [criterionKey]: Number(value),
    }));
  };

  const handleRemarksChange = (criterionKey: string, value: string) => {
    setRemarks((prev) => ({
      ...prev,
      [criterionKey]: value,
    }));
  };

  const validateForm = (): boolean => {
    // Check if all criteria have scores
    const requiredKeys = evaluationConfig.sections.flatMap((section) =>
      section.criteria.map((criterion) => criterion.key)
    );
    requiredKeys.push("overall_performance");

    for (const key of requiredKeys) {
      if (!responses[key] || responses[key] < 1 || responses[key] > 5) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate form completion
      if (!validateForm()) {
        throw new Error(
          "Please complete all evaluation criteria before submitting"
        );
      }

      // Transform form data to API payload
      const evaluationScores: EvaluationScores = transformFormToApiPayload(
        responses,
        { trainee_id: params.traineeId, evaluator_id: params.evaluatorId }
      );

      console.log("Submitting evaluation scores:", evaluationScores);

      // Make API call for prediction
      const predictionResult =
        await employabilityPrediction.predictEmployability(evaluationScores);

      setPrediction(predictionResult);
      setShowResults(true);

      console.log("Prediction completed:", predictionResult);
    } catch (err) {
      console.error("Submission failed:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setResponses({});
    setRemarks({});
    setPrediction(null);
    setError(null);
    setShowResults(false);
  };

  console.log(prediction);
  

  return (
    <>
      <div>
        <BackButton title="Go Back" link={pathsConfig.app.evaluations} />
      </div>

      <Card>
        <CardContent className="space-y-10">
          {evaluationConfig.sections.map((section) => (
            <div key={section.key} className="space-y-4">
              <h2 className="text-lg font-semibold">{section.title}</h2>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-muted-foreground w-full text-left">
                      Criteria
                    </TableHead>
                    {[...Array(5)].map((_, i) => (
                      <TableHead
                        key={`header-${section.key}-${i}`}
                        className="min-w-[60px] text-center"
                      >
                        {i + 1}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.criteria.map((criterion) => (
                    <React.Fragment key={criterion.key}>
                      <TableRow>
                        <TableCell className="w-full">
                          {criterion.label}
                        </TableCell>
                        <RadioGroup
                          className="contents"
                          orientation="horizontal"
                          value={String(responses[criterion.key] ?? "")}
                          onValueChange={(val) =>
                            handleScoreChange(criterion.key, val)
                          }
                        >
                          {Array.from({ length: criterion.maxScore }).map(
                            (_, i) => (
                              <TableCell
                                key={`criterion-${criterion.key}-${i}`}
                                className="text-center"
                              >
                                <RadioGroupItem
                                  value={String(i + 1)}
                                  id={`${criterion.key}-${i + 1}`}
                                />
                              </TableCell>
                            )
                          )}
                        </RadioGroup>
                      </TableRow>

                      {criterion.hasRemarks && (
                        <TableRow key={`${criterion.key}-remarks`}>
                          <TableCell colSpan={criterion.maxScore + 1}>
                            <Textarea
                              placeholder={`Remarks for: ${criterion.label}`}
                              value={remarks[criterion.key] || ""}
                              onChange={(e) =>
                                handleRemarksChange(
                                  criterion.key,
                                  e.target.value
                                )
                              }
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}

          {/* Overall Performance Rating */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              Overall Performance Rating
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  {["Poor", "Fair", "Good", "Very Good", "Excellent"].map(
                    (label, i) => (
                      <TableHead
                        key={`overall-head-${i}`}
                        className="text-center"
                      >
                        {label}
                      </TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <RadioGroup
                    className="contents"
                    orientation="horizontal"
                    value={String(responses["overall_performance"] ?? "")}
                    onValueChange={(val) =>
                      handleScoreChange("overall_performance", val)
                    }
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableCell
                        key={`overall-score-${i}`}
                        className="text-center"
                      >
                        <RadioGroupItem value={String(i + 1)} />
                      </TableCell>
                    ))}
                  </RadioGroup>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={6}>
                    <Textarea
                      placeholder="Remarks for: Overall performance rating"
                      value={remarks["overall_performance"] || ""}
                      onChange={(e) =>
                        handleRemarksChange(
                          "overall_performance",
                          e.target.value
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* Score Summary */}
          <CardFooter className="flex flex-col space-y-6">
            <div className="w-full space-y-2">
              <Label>Score Summary</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {results.sections.map((s) => (
                  <React.Fragment key={s.key}>
                    <span>{s.title}</span>
                    <span className="font-medium">
                      {s.weightedScore.toFixed(0)} / {s.weightedMax}
                    </span>
                  </React.Fragment>
                ))}
                <span>Overall Performance Rating:</span>
                <span className="font-medium">
                  {responses["overall_performance"] || "—"}
                </span>
                <span className="font-semibold">Total:</span>
                <span className="font-semibold">
                  {results.total.toFixed(0)} / {results.maxTotal}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 self-end">
              {showResults && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                >
                  New Evaluation
                </Button>
              )}

              <Button
                type="button"
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting || !validateForm()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Submit Evaluation
                  </>
                )}
              </Button>
            </div>
          </CardFooter>

           {prediction && showResults && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">Employability Prediction Results</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Prediction Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Classification:</span>
                        <span className={`font-medium ${
                          prediction.prediction_class ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {prediction.prediction_label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span>{(prediction.prediction_probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reliability:</span>
                        <span>{prediction.confidence_level}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Key Insights</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-green-600">Strong Areas:</span>
                        <span className="ml-1">{prediction.analysis.strong_areas.length}</span>
                      </div>
                      <div>
                        <span className="text-orange-600">Areas for Improvement:</span>
                        <span className="ml-1">{prediction.analysis.weak_areas.length}</span>
                      </div>
                      <div>
                        <span>Overall Score:</span>
                        <span className="ml-1">{prediction.analysis.overall_statistics.mapped_features_avg.toFixed(1)}/5.0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              {prediction.recommendations && prediction.recommendations.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">AI-Generated Recommendations</h4>
                    <div className="space-y-3">
                      {prediction.recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{rec.category}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              rec.priority === 'High' ? 'bg-red-100 text-red-700' :
                              rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {rec.priority} Priority
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{rec.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export function computeEvaluationScore(responses: Record<string, number>) {
  const sectionResults = evaluationConfig.sections.map((section) => {
    const rawScore = section.criteria.reduce(
      (sum, c) => sum + (responses[c.key] ?? 0),
      0
    );

    const rawMax = section.criteria.reduce((sum, c) => sum + c.maxScore, 0);

    const weightedScore = rawScore * section.weight;
    const weightedMax = rawMax * section.weight;

    return {
      key: section.key,
      title: section.title,
      rawScore,
      rawMax,
      weightedScore,
      weightedMax,
      percentage: weightedMax > 0 ? (weightedScore / weightedMax) * 100 : 0,
    };
  });

  const total = sectionResults.reduce((sum, s) => sum + s.weightedScore, 0);
  const maxTotal = sectionResults.reduce((sum, s) => sum + s.weightedMax, 0);

  return {
    sections: sectionResults,
    total,
    maxTotal,
    percentage: maxTotal > 0 ? (total / maxTotal) * 100 : 0,
  };
}
