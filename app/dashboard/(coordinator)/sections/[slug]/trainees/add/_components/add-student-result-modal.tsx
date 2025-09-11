"use client";

import React from "react";

import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { AddStudentsResult } from "../schema/add-student-form.schema";

interface AddStudentsResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AddStudentsResult | null;
}

export default function AddStudentResultModal({
  isOpen,
  onClose,
  result,
}: AddStudentsResultModalProps) {
  if (!result) return null;

  const { successful, failed, total } = result.results;
  const successCount = successful.length;
  const failureCount = failed.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[80vh] max-w-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {failureCount === 0 ? (
              <CheckCircle className="size-5 text-green-500" />
            ) : successCount === 0 ? (
              <XCircle className="size-5 text-red-500" />
            ) : (
              <AlertCircle className="size-5 text-yellow-500" />
            )}
            Student Addition Results
          </DialogTitle>
          <DialogDescription>
            {failureCount === 0
              ? `Successfully added all ${successCount} students to the batch.`
              : successCount === 0
                ? `Failed to add all ${failureCount} students.`
                : `Added ${successCount} of ${total} students. ${failureCount} students failed to be added.`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-96 pr-4">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="mr-1 size-3" />
                {successCount} Successful
              </Badge>
              {failureCount > 0 && (
                <Badge variant="outline" className="text-red-600">
                  <XCircle className="mr-1 size-3" />
                  {failureCount} Failed
                </Badge>
              )}
            </div>

            {/* Successfully Added Students */}
            {successCount > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-green-600">
                  <CheckCircle className="size-4" />
                  Successfully Added ({successCount})
                </h4>
                <div className="space-y-2 rounded-lg bg-green-50 p-3">
                  {successful.map((item, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">
                        {item.trainee.first_name} {item.trainee.last_name}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {item.trainee.student_id_number} • {item.trainee.email}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed Students */}
            {failureCount > 0 && (
              <>
                {successCount > 0 && <Separator />}
                <div className="space-y-2">
                  <h4 className="flex items-center gap-1 text-sm font-medium text-red-600">
                    <XCircle className="size-4" />
                    Failed to Add ({failureCount})
                  </h4>
                  <div className="space-y-4 rounded-lg bg-red-50 p-3">
                    {failed.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="text-sm">
                          <div className="font-medium">
                            {item.trainee.first_name} {item.trainee.last_name}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {item.trainee.student_id_number} •{" "}
                            {item.trainee.email}
                          </div>
                        </div>
                        <div className="rounded border-l-2 border-red-400 bg-red-100 p-2 text-xs text-red-600">
                          <strong>Error:</strong> {item.error}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button size={"sm"} onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
