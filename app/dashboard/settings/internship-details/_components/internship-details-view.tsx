"use client";

import React, { useState } from "react";

import {
  Briefcase,
  Building,
  Calendar,
  Clock,
  Edit,
  MapPin,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  InternshipDetails,
  useRevalidateFetchInternships,
  useSubmitInternshipForm,
} from "@/hooks/use-internship-details";

import { getDocumentStatusConfig, jobRoles } from "@/lib/constants";

import { safeFormatDate } from "@/utils/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ConfirmationDialog from "@/components/sumikapp/confirmation-dialog";
import { If } from "@/components/sumikapp/if";

import { deleteInternshipAction } from "../server/server-actions";

interface InternshipDetailsViewProps {
  selectedInternship: InternshipDetails;
  allInternships: InternshipDetails[];
  onEdit: () => void;
  onClose: () => void;
}

export default function InternshipDetailsView({
  selectedInternship,
  allInternships,
  onEdit,
  onClose,
}: InternshipDetailsViewProps) {
  const submitInternshipFormMutation = useSubmitInternshipForm();
  const revalidateInternships = useRevalidateFetchInternships();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText: string;
    variant: "default" | "destructive";
  } | null>(null);

  const hasPendingInternship = allInternships.some(
    (int) => int.status === "pending" && int.id !== selectedInternship.id
  );

  const hasApprovedInternship = allInternships.some(
    (int) => int.status === "approved"
  );

  const openConfirmDialog = (config: typeof dialogConfig) => {
    setDialogConfig(config);
    setDialogOpen(true);
  };

  const getJobRoleDisplay = () => {
    if (!selectedInternship.job_role) return "Not specified";

    const predefinedRole = jobRoles.find(
      (role) => role.value === selectedInternship.job_role
    );
    return predefinedRole ? predefinedRole.label : selectedInternship.job_role;
  };

  const getScheduleDisplay = () => {
    if (
      !selectedInternship.dailySchedule ||
      selectedInternship.dailySchedule.length === 0
    ) {
      return "Not specified";
    }

    return selectedInternship.dailySchedule.join(", ");
  };

  const formatTime = (time: string | null) => {
    if (!time) return "Not specified";

    try {
      const timeOnly = time.includes(":")
        ? time.split("T")[1]?.split(".")[0] || time
        : time;

      const [hours, minutes] = timeOnly.split(":");
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? "PM" : "AM";

      return `${hour12}:${minutes} ${ampm}`;
    } catch (e) {
      console.error(e);
      return time;
    }
  };

  const handleSubmitForm = () => {
    const promise = async () => {
      await submitInternshipFormMutation.mutateAsync(selectedInternship.id);
    };

    toast.promise(promise, {
      loading: "Submitting internship form...",
      success: () => {
        onClose();
        return "Internship form successfully submitted!";
      },
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Something went wrong while submitting internship form.";
      },
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              className={`${getDocumentStatusConfig(selectedInternship.status)?.badgeColor} capitalize`}
            >
              {selectedInternship.status}
            </Badge>
          </div>

          <If
            condition={
              selectedInternship.status === "not submitted" ||
              selectedInternship.status === "rejected"
            }
          >
            <div>
              <Button variant={"ghost"} size={"sm"} onClick={onEdit}>
                <Edit />
                Edit
              </Button>
              <Button
                variant={"ghost"}
                size={"sm"}
                onClick={() => {
                  openConfirmDialog({
                    title: `Delete Internship Form`,
                    description: `Are you sure you want to delete this internship form? This action cannot be undone.`,
                    onConfirm: () => {
                      toast.promise(
                        deleteInternshipAction(selectedInternship.id),
                        {
                          loading: `Deleting internship form...`,
                          success: () => {
                            revalidateInternships();
                            return `Internship form deleted successfully!`;
                          },
                          error: (err) =>
                            err instanceof Error
                              ? err.message
                              : `Something went wrong while deleting internship form.`,
                        }
                      );
                    },
                    confirmText: "Delete",
                    variant: "destructive",
                  });
                }}
              >
                <Trash2 />
                Delete
              </Button>
            </div>
          </If>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="size-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                  Company Name
                </h4>
                <p className="text-sm">
                  {selectedInternship.companyName || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                  Contact Number
                </h4>
                <p className="text-sm">
                  {selectedInternship.contactNumber || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                  Nature of Business
                </h4>
                <p className="text-sm">
                  {selectedInternship.natureOfBusiness || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                  Address
                </h4>
                <p className="flex items-start gap-1 text-sm">
                  <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
                  {selectedInternship.companyAddress || "Not specified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="size-5" />
              Training Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                  Job Role
                </h4>
                <p className="text-sm">{getJobRoleDisplay()}</p>
              </div>
              <div>
                <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                  Supervisor Email
                </h4>
                <p className="text-sm">{selectedInternship.supervisorEmail}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-muted-foreground mb-1 flex items-center gap-1 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  Duration
                </h4>
                <p className="text-sm">
                  {safeFormatDate(selectedInternship.startDate, "PP")} -{" "}
                  {safeFormatDate(selectedInternship.endDate, "PP")}
                </p>
              </div>
              <div>
                <h4 className="text-muted-foreground mb-1 flex items-center gap-1 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Working Hours
                </h4>
                <p className="text-sm">
                  {formatTime(selectedInternship.startTime)} -{" "}
                  {formatTime(selectedInternship.endTime)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                  Schedule
                </h4>
                <p className="text-sm">{getScheduleDisplay()}</p>
              </div>
              <div>
                <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                  Lunch Break
                </h4>
                <p className="text-sm">
                  {selectedInternship.lunchBreak} Minutes
                </p>
              </div>
            </div>
          </CardContent>

          <If
            condition={
              (selectedInternship.status === "rejected" ||
                selectedInternship.status === "not submitted") &&
              !hasApprovedInternship
            }
          >
            <CardFooter className="flex justify-end">
              <Button
                size={"sm"}
                onClick={handleSubmitForm}
                disabled={submitInternshipFormMutation.isPending}
              >
                Submit
              </Button>
            </CardFooter>
          </If>
        </Card>
      </div>

      {dialogConfig && (
        <ConfirmationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={dialogConfig.title}
          description={dialogConfig.description}
          onConfirm={() => {
            dialogConfig.onConfirm();
            setDialogOpen(false);
          }}
          confirmText={dialogConfig.confirmText}
          variant={dialogConfig.variant}
        />
      )}
    </>
  );
}
