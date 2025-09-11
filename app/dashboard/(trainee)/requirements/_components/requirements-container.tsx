"use client";

import React from "react";

import { AlertTriangle } from "lucide-react";

import { useFetchRequirements } from "@/hooks/use-requirements";

import { cn } from "@/lib/utils";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import CompletionProgressBar from "./completion-progress-bar";
import RequirementItem from "./requirement-item";

export default function RequirementsContainer() {
  const requirements = useFetchRequirements();

  if (!requirements.data || requirements.isLoading) {
    return <LoadingOverlay fullPage />;
  }
  const totalRequirements = requirements.data.length;
  const completedRequirements = requirements.data.filter(
    (req) => req.status === "approved"
  ).length;
  const missingRequirements = requirements.data.filter(
    (req) => req.status === "not submitted"
  ).length;

  const completionPercentage =
    totalRequirements > 0
      ? Math.round((completedRequirements / totalRequirements) * 100)
      : 0;

  const requirementDataMap = new Map(
    requirements.data.map((req) => [req.requirement_name.toLowerCase(), req])
  );

  const uniqueRequirements = Array.from(
    new Set(requirements.data.map((req) => req.requirement_name))
  ).sort();

  return (
    <>
      <div>
        <PageTitle text={"My Requirements"} />
        <p className="text-muted-foreground text-sm">
          Submit all the documents required on your OJT program.
        </p>
      </div>

      <If condition={missingRequirements > 0}>
        <MissingRequirementsAlert missingCount={missingRequirements} />
      </If>

      <CompletionProgressBar value={completionPercentage.toString()} />
      <Card className={cn("py-0")}>
        <CardContent className={cn("px-0")}>
          {uniqueRequirements.map((requirementName, index) => {
            const requirementData = requirementDataMap.get(
              requirementName.toLowerCase()
            );

            return (
              <RequirementItem
                key={index}
                title={requirementName}
                requirement={
                  requirementData || {
                    id: `placeholder-${requirementName}`,
                    requirement_name: requirementName,
                    requirement_description: null,
                    file_name: null,
                    file_size: null,
                    file_type: null,
                    submitted_at: null,
                    status: "not submitted",
                    history: [],
                  }
                }
              />
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}

function MissingRequirementsAlert({
  missingCount = 0,
}: {
  missingCount?: number;
}) {
  const x = missingCount;
  return (
    <Alert variant="destructive" className="border-destructive">
      <AlertTriangle className="size-4" />
      <AlertTitle>Missing Requirements</AlertTitle>
      <AlertDescription>
        You have {x} missing requirement{x !== 1 ? "s" : ""} that{" "}
        {x === 1 ? "needs" : "need"} to be submitted. Please upload all required
        documents.
      </AlertDescription>
    </Alert>
  );
}
