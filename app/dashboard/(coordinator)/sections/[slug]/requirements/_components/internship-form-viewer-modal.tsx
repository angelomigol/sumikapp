"use client";

import React, { useEffect, useState } from "react";

import {
  AlertCircle,
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  useApproveInternshipForm,
  useRejectInternshipForm,
} from "@/hooks/use-batch-requirements";

import { DocumentStatus, jobRoles } from "@/lib/constants";

import { displayDays, safeFormatDate } from "@/utils/shared";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { If } from "@/components/sumikapp/if";

interface InternshipFormViewerModalProps {
  isOpen: boolean;
  onClose: () => void;

  internshipId: string;
  dailySchedule: string[] | null;
  jobRole: string | null;
  companyName: string | null;
  contactNumber: string | null;
  natureOfBusiness: string | null;
  companyAddress: string | null;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  supervisorEmail: string | null;
  status: DocumentStatus;

  slug: string;
}

export default function InternshipFormViewerModal({
  isOpen,
  onClose,
  internshipId,
  dailySchedule,
  jobRole,
  companyName,
  contactNumber,
  natureOfBusiness,
  companyAddress,
  startDate,
  endDate,
  startTime,
  endTime,
  supervisorEmail,
  status,
  slug,
}: InternshipFormViewerModalProps) {
  const [feedback, setFeedback] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const approveFormMutation = useApproveInternshipForm(slug);
  const rejectFormMutation = useRejectInternshipForm(slug);

  useEffect(() => {
    if (isOpen) {
      setFeedback("");
      setShowFeedbackForm(false);
    }
  }, [isOpen]);
  
  const getJobRoleDisplay = () => {
    if (!jobRole) return "Not specified";

    const predefinedRole = jobRoles.find((role) => role.value === jobRole);
    return predefinedRole ? predefinedRole.label : jobRole;
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
      return time;
    }
  };

  const handleApproveForm = () => {
    const promise = async () => {
      await approveFormMutation.mutateAsync(internshipId);
    };

    toast.promise(promise, {
      loading: "Updating internship form...",
      success: "Intership form successfully approved",
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while updating internship form. Please try again.";
      },
    });
  };

  const handleRejectForm = () => {
    const promise = async () => {
      await rejectFormMutation.mutateAsync({
        internshipId,
        feedback,
      });
    };

    toast.promise(promise, {
      loading: "Updating internship form...",
      success: `Internship form successfully rejected`,
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while updating internship form. Please try again.";
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="gap-0 p-0"
      >
        <DialogHeader className="p-6">
          <DialogTitle>Internship Form</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-60 flex-col">
          <ScrollArea className="flex flex-col overflow-hidden px-6 pb-4">
            <div className="space-y-6">
              <div className="flex items-center gap-2 leading-none font-semibold">
                <Building className="size-5" />
                Company Information
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                      Company Name
                    </h4>
                    <p className="text-sm">{companyName || "Not specified"}</p>
                  </div>
                  <div>
                    <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                      Contact Number
                    </h4>
                    <p className="text-sm">
                      {contactNumber || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                      Nature of Business
                    </h4>
                    <p className="text-sm">
                      {natureOfBusiness || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                      Address
                    </h4>
                    <p className="flex items-start gap-1 text-sm">
                      <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
                      {companyAddress || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />
              <div className="flex items-center gap-2 leading-none font-semibold">
                <Briefcase className="size-5" />
                Training Details
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                      Job Role
                    </h4>
                    <p className="text-sm">{getJobRoleDisplay()}</p>
                  </div>
                  <div>
                    <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                      Supervisor Email Address
                    </h4>
                    <p className="text-sm">
                      {supervisorEmail || "Not specified"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-muted-foreground mb-1 flex items-center gap-1 text-sm font-medium">
                      <Calendar className="size-4" />
                      Duration
                    </h4>
                    <p className="text-sm">
                      {safeFormatDate(startDate, "PP")} -{" "}
                      {safeFormatDate(endDate, "PP")}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-muted-foreground mb-1 flex items-center gap-1 text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      Working Hours
                    </h4>
                    <p className="text-sm">
                      {formatTime(startTime)} - {formatTime(endTime)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                    Schedule
                  </h4>
                  <p className="text-sm">
                    {dailySchedule?.length
                      ? displayDays(dailySchedule)
                      : "Not Specified"}
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
        <If condition={status === "pending"}>
          <DialogFooter className="border-t p-6 sm:justify-between">
            <If
              condition={showFeedbackForm}
              fallback={
                <>
                  <Button
                    variant={"destructive"}
                    size={"sm"}
                    onClick={() => setShowFeedbackForm(true)}
                    disabled={
                      approveFormMutation.isPending ||
                      rejectFormMutation.isPending
                    }
                    className="cursor-pointer"
                  >
                    <XCircle className="size-4" />
                    Reject
                  </Button>

                  <Button
                    size={"sm"}
                    className="bg-green-600 hover:bg-green-600/80"
                    disabled={
                      approveFormMutation.isPending ||
                      rejectFormMutation.isPending
                    }
                    onClick={handleApproveForm}
                  >
                    <CheckCircle className="size-4" />
                    Approve
                  </Button>
                </>
              }
            >
              <div className="w-full space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4" />
                  <Label htmlFor="feedback" className="text-base font-medium">
                    Rejection Feedback
                  </Label>
                </div>
                <div>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Please provide specific feedback explaining why this internship form is being rejected. This will help the student understand what needs to be corrected."
                    className="max-h-32 resize-none"
                    maxLength={500}
                  />
                  <span className="text-muted-foreground text-xs">
                    {feedback.length}/500 characters
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant={"outline"}
                    size={"sm"}
                    onClick={() => {
                      setShowFeedbackForm(false);
                      setFeedback("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={"destructive"}
                    size={"sm"}
                    className="gap-2"
                    onClick={handleRejectForm}
                    disabled={
                      approveFormMutation.isPending ||
                      rejectFormMutation.isPending
                    }
                  >
                    <AlertCircle className="size-4" />
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            </If>
          </DialogFooter>
        </If>
      </DialogContent>
    </Dialog>
  );
}
