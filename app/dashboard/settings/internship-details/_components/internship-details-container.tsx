"use client";

import React, { useState } from "react";

import { ChevronLeft } from "lucide-react";

import {
  InternshipDetails,
  useFetchInternships,
} from "@/hooks/use-internship-details";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";

import InternshipDetailsForm from "./internship-details-form";
import InternshipDetailsList from "./internship-details-list";
import InternshipDetailsView from "./internship-details-view";

type ViewMode = "list" | "view" | "edit" | "create";

export default function InternshipDetailsContainer() {
  const [mode, setMode] = useState<ViewMode>("list");
  const [selectedInternship, setSelectedInternship] =
    useState<InternshipDetails | null>(null);

  const { data: internships = [], isLoading } = useFetchInternships();

  console.log(internships);
  

  if (isLoading) {
    return <LoadingOverlay />;
  }

  const getCardTitle = () => {
    switch (mode) {
      case "view":
        return "View Internship Details";
      case "edit":
        return "Edit Internship Details";
      case "create":
        return "Create Internship Details";
      default:
        return "Internship Details";
    }
  };

  const getCardDescription = () => {
    switch (mode) {
      case "view":
        return "Review your internship placement details.";
      case "edit":
        return "Update your internship placement details.";
      case "create":
        return "Enter the necessary details about your internship placement, including company, role, and duration.";
      default:
        return "View and manage your internship placement details.";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <If condition={mode !== "list"}>
              <Button
                size={"icon"}
                variant={"ghost"}
                onClick={() => {
                  setMode("list");
                  setSelectedInternship(null);
                }}
              >
                <ChevronLeft />
              </Button>
            </If>
            {getCardTitle()}
          </CardTitle>
          <CardDescription>{getCardDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "list" && (
            <InternshipDetailsList
              onViewInternship={(internship: InternshipDetails) => {
                setSelectedInternship(internship);
                setMode("view");
              }}
              onCreateInternship={() => {
                setSelectedInternship(null);
                setMode("create");
              }}
              internships={internships}
            />
          )}

          {mode === "view" && selectedInternship && (
            <InternshipDetailsView
              internship={selectedInternship}
              allInternships={internships}
              onEdit={() => setMode("edit")}
              onClose={() => {
                setMode("list");
                setSelectedInternship(null);
              }}
            />
          )}

          {(mode === "edit" || mode === "create") && (
            <InternshipDetailsForm
              key={selectedInternship?.id || "new"}
              internship={selectedInternship}
              onClose={() => {
                setMode("list");
                setSelectedInternship(null);
              }}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
