"use client";

import React, { useState } from "react";

import { Loader2, Save } from "lucide-react";
import z from "zod";

import { evaluationConfig } from "@/config/evaluation-config";
import pathsConfig from "@/config/paths.config";
import {
  EvaluationScores,
  transformFormToApiPayload,
} from "@/hooks/use-evaluation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

import { employabilityPrediction } from "@/app/dashboard/(supervisor)/evaluations/server/services/employability-prediction.service";

import EvaluationLegend from "./evaluation-legend";
import EvaluationStatusDialog from "./evaluation-status-dialog";

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

      // Make remarks required for all criteria
      schemaObject[`${criterion.key}_remarks`] = z
        .string()
        .min(1, "Remarks are required for this criterion")
        .min(3, "Remarks must be at least 3 characters long");
    });
  });

  schemaObject["overall_rating"] = z
    .string()
    .min(1, "Overall performance rating is required")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 5, {
      message: "Score must be between 1 and 5",
    });

  // Make overall performance remarks required
  schemaObject["overall_rating_remarks"] = z
    .string()
    .min(1, "Overall performance remarks are required")
    .min(3, "Remarks must be at least 3 characters long");

  return z.object(schemaObject);
};

const evaluationSchema = createEvaluationSchema();
type EvaluationFormValues = z.infer<typeof evaluationSchema>;

export default function EvaluateTraineeContainer(params: {
  tbeId: string;
  evaluatorId: string;
}) {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [showModal, setShowModal] = useState(false);
  const [modalState, setModalState] = useState<
    "processing" | "success" | "error"
  >("processing");

  const getTotalCriteriaCount = () => {
    const sectionCriteria = evaluationConfig.sections.reduce(
      (sum, section) => sum + section.criteria.length,
      0
    );
    return sectionCriteria + 1; // +1 for overall_rating
  };

  const totalCriteria = getTotalCriteriaCount();

  const results = computeEvaluationScore(responses);

  const handleScoreChange = (criterionKey: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [criterionKey]: Number(value),
    }));

    // Clear validation error for this field
    if (validationErrors[criterionKey]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[criterionKey];
        return newErrors;
      });
    }
  };

  const handleRemarksChange = (criterionKey: string, value: string) => {
    setRemarks((prev) => ({
      ...prev,
      [criterionKey]: value,
    }));

    // Clear validation error for this field
    const remarksKey = `${criterionKey}_remarks`;
    if (validationErrors[remarksKey]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[remarksKey];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Check if all criteria have scores
    const requiredKeys = evaluationConfig.sections.flatMap((section) =>
      section.criteria.map((criterion) => criterion.key)
    );
    requiredKeys.push("overall_rating");

    for (const key of requiredKeys) {
      if (!responses[key] || responses[key] < 1 || responses[key] > 5) {
        errors[key] = "Score is required and must be between 1 and 5";
      }
    }

    // Check if all criteria have remarks
    const remarksKeys = evaluationConfig.sections.flatMap((section) =>
      section.criteria.map((criterion) => `${criterion.key}_remarks`)
    );
    remarksKeys.push("overall_rating_remarks");

    for (const key of remarksKeys) {
      const criterionKey = key.replace("_remarks", "");
      if (!remarks[criterionKey] || remarks[criterionKey].trim().length < 3) {
        errors[key] =
          "Remarks are required and must be at least 3 characters long";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setShowModal(true);
      setModalState("processing");

      // Validate form completion
      if (!validateForm()) {
        throw new Error(
          "Please complete all evaluation criteria and provide remarks before submitting"
        );
      }

      // Transform form data to API payload
      const evaluationScores: EvaluationScores = transformFormToApiPayload(
        responses,
        remarks,
        { tbe_id: params.tbeId, evaluator_id: params.evaluatorId }
      );

      console.log("Submitting evaluation scores:", evaluationScores);

      // Make API call for prediction
      const predictionResult =
        await employabilityPrediction.predictEmployability(evaluationScores);

      setModalState("success");

      console.log("Prediction completed:", predictionResult);
    } catch (err) {
      console.error("Submission failed:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
      setModalState((prev) => (prev === "processing" ? "error" : prev));
    }
  };

  const resetForm = () => {
    setResponses({});
    setRemarks({});
    setError(null);
    setValidationErrors({});
  };

  const isFormValid = () => {
    // Check scores
    const requiredKeys = evaluationConfig.sections.flatMap((section) =>
      section.criteria.map((criterion) => criterion.key)
    );
    requiredKeys.push("overall_rating");

    const hasAllScores = requiredKeys.every(
      (key) => responses[key] && responses[key] >= 1 && responses[key] <= 5
    );

    // Check remarks
    const remarksKeys = evaluationConfig.sections.flatMap((section) =>
      section.criteria.map((criterion) => criterion.key)
    );
    remarksKeys.push("overall_rating");

    const hasAllRemarks = remarksKeys.every(
      (key) => remarks[key] && remarks[key].trim().length >= 3
    );

    return hasAllScores && hasAllRemarks;
  };

  return (
    <>
      <div>
        <BackButton title="Go Back" link={pathsConfig.app.evaluations} />
      </div>

      <EvaluationLegend />

      <Card>
        <CardContent className="space-y-10">
          {/* Display validation errors at the top */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <h4 className="mb-2 text-sm font-medium text-red-800">
                Please fix the following errors:
              </h4>
              <ul className="space-y-1 text-sm text-red-700">
                {Object.entries(validationErrors).map(([key, message]) => (
                  <li key={key}>• {message}</li>
                ))}
              </ul>
            </div>
          )}

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
                        {5 - i}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.criteria.map((criterion) => (
                    <React.Fragment key={criterion.key}>
                      <TableRow
                        className={
                          validationErrors[criterion.key] ? "bg-red-50" : ""
                        }
                      >
                        <TableCell className="w-full">
                          <div className="flex flex-col">
                            <span>{criterion.label}</span>
                            {validationErrors[criterion.key] && (
                              <span className="mt-1 text-xs text-red-600">
                                {validationErrors[criterion.key]}
                              </span>
                            )}
                          </div>
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
                                  value={String(5 - i)}
                                  id={`${criterion.key}-${5 - i}`}
                                />
                              </TableCell>
                            )
                          )}
                        </RadioGroup>
                      </TableRow>

                      <TableRow key={`${criterion.key}-remarks`}>
                        <TableCell colSpan={criterion.maxScore + 1}>
                          <div className="space-y-2">
                            <Textarea
                              placeholder={`Remarks for: ${criterion.label} (Required - minimum 3 characters)`}
                              value={remarks[criterion.key] || ""}
                              onChange={(e) =>
                                handleRemarksChange(
                                  criterion.key,
                                  e.target.value
                                )
                              }
                              className={
                                validationErrors[`${criterion.key}_remarks`]
                                  ? "border-red-300 focus:border-red-500"
                                  : ""
                              }
                              required
                            />
                            {validationErrors[`${criterion.key}_remarks`] && (
                              <span className="text-xs text-red-600">
                                {validationErrors[`${criterion.key}_remarks`]}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
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
                  {["Excellent", "Very Good", "Good", "Fair", "Poor"].map(
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
                <TableRow
                  className={
                    validationErrors["overall_rating"] ? "bg-red-50" : ""
                  }
                >
                  <RadioGroup
                    className="contents"
                    orientation="horizontal"
                    value={String(responses["overall_rating"] ?? "")}
                    onValueChange={(val) =>
                      handleScoreChange("overall_rating", val)
                    }
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableCell
                        key={`overall-score-${i}`}
                        className="text-center"
                      >
                        <RadioGroupItem value={String(5 - i)} />
                      </TableCell>
                    ))}
                  </RadioGroup>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Remarks for: Overall performance rating (Required - minimum 3 characters)"
                        value={remarks["overall_rating"] || ""}
                        onChange={(e) =>
                          handleRemarksChange("overall_rating", e.target.value)
                        }
                        className={
                          validationErrors["overall_rating_remarks"]
                            ? "border-red-300 focus:border-red-500"
                            : ""
                        }
                        required
                      />
                      {validationErrors["overall_rating_remarks"] && (
                        <span className="text-xs text-red-600">
                          {validationErrors["overall_rating_remarks"]}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <Separator />
        </CardContent>
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
                {responses["overall_rating"] || "—"}
              </span>
              <span className="font-semibold">Total:</span>
              <span className="font-semibold">
                {results.total.toFixed(0)} / {results.maxTotal}
              </span>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="w-full space-y-2">
            <Label className="text-sm">Form Completion Status</Label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span>Scores completed:</span>
              <span
                className={`font-medium ${
                  Object.keys(responses).length >= totalCriteria
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              >
                {Object.keys(responses).length} / {totalCriteria}
              </span>
              <span>Remarks completed:</span>
              <span
                className={`font-medium ${
                  Object.keys(remarks).filter(
                    (key) => remarks[key]?.trim().length >= 3
                  ).length >= totalCriteria
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              >
                {
                  Object.keys(remarks).filter(
                    (key) => remarks[key]?.trim().length >= 3
                  ).length
                }{" "}
                / {totalCriteria}
              </span>
            </div>
          </div>

          <div className="flex w-full justify-between">
            <Button size={"sm"} variant={"destructive"} onClick={resetForm}>
              Reset
            </Button>

            <Button
              type="button"
              size={"sm"}
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !isFormValid()}
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
          {/* Error display */}
          {error && (
            <div className="w-full rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </CardFooter>
      </Card>

      <EvaluationStatusDialog
        open={showModal}
        onOpenChange={setShowModal}
        state={modalState}
        error={error}
      />
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
