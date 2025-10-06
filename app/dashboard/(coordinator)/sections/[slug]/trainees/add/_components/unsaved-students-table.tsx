"use client";

import React, { useState } from "react";

import { IconClearAll } from "@tabler/icons-react";
import { Loader2, SaveAll, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAddAllStudents } from "@/hooks/use-section-trainees";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { If } from "@/components/sumikapp/if";
import { SearchableTrainee } from "@/components/sumikapp/smart-trainee-search";

import { AddStudentsResult } from "../schema/add-student-form.schema";
import AddStudentResultModal from "./add-student-result-modal";

interface UnsavedStudentsTableProps {
  trainee: SearchableTrainee[];
  onRemove: (index: number) => void;
  onClearAll: () => void;
  onRemoveMultiple: (indicesToRemove: number[]) => void;
  slug: string;
}

export default function UnsavedStudentsTable({
  trainee,
  onRemove,
  onClearAll,
  onRemoveMultiple,
  slug,
}: UnsavedStudentsTableProps) {
  const [resultModal, setResultModal] = useState<{
    isOpen: boolean;
    result: AddStudentsResult | null;
  }>({
    isOpen: false,
    result: null,
  });

  const addAllStudentsMutation = useAddAllStudents(slug);

  const duplicateInfo = findDuplicates(trainee);

  const handleDelete = (index: number) => {
    onRemove(index);
    toast.success("Student removed successfully");
  };

  const handleAddAll = async () => {
    if (trainee.length === 0) {
      toast.error("No students to add");
      return;
    }

    if (duplicateInfo.hasDuplicates) {
      toast.error(
        "Cannot add students: Duplicate student IDs or email addresses found. Please resolve duplicates first."
      );
      return;
    }

    try {
      const result = await addAllStudentsMutation.mutateAsync({
        trainees: trainee,
        slug,
      });

      setResultModal({
        isOpen: true,
        result: result,
      });

      const successfulStudentIds = result.results.successful.map(
        (item) => item.trainee.student_id_number
      );

      const indicesToRemove = trainee
        .map((student, index) =>
          successfulStudentIds.includes(student.student_id_number) ? index : -1
        )
        .filter((index) => index !== -1);

      if (indicesToRemove.length > 0) {
        onRemoveMultiple(indicesToRemove);
      }

      const { successful, failed } = result.results;
      if (failed.length === 0) {
        toast.success(`Successfully added all ${successful.length} students!`);
      } else if (successful.length === 0) {
        toast.error(
          `Failed to add all ${failed.length} students. Check the details for more information.`
        );
      } else {
        toast.success(
          `Added ${successful.length} students successfully. ${failed.length} failed - check details.`
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to add students: ${errorMessage}`);
    }
  };

  return (
    <>
      <Card className="py-3">
        <CardContent>
          {trainee.length === 0 ? (
            <div className="text-muted-foreground justify-self-center py-10 text-sm">
              No Students Added.
            </div>
          ) : (
            <Table>
              <TableCaption className="text-left">
                Total Students: {trainee.length}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID Number</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Middle Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainee.map((trainee, index) => (
                  <TableRow key={index}>
                    <TableCell>{trainee.student_id_number}</TableCell>
                    <TableCell>{trainee.first_name}</TableCell>
                    <TableCell>{trainee.middle_name}</TableCell>
                    <TableCell>{trainee.last_name}</TableCell>
                    <TableCell>{trainee.email}</TableCell>
                    <TableCell>{trainee.course ?? ""}</TableCell>
                    <TableCell>{trainee.section ?? ""}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size={"icon"}
                        variant={"ghost"}
                        className="hover:text-destructive"
                        onClick={() => handleDelete(index)}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        <If condition={trainee.length > 0}>
          <CardFooter className="justify-between">
            <Button
              variant={"destructive"}
              size={"sm"}
              type="button"
              disabled={
                trainee.length === 0 || addAllStudentsMutation.isPending
              }
              onClick={onClearAll}
            >
              <IconClearAll className="size-4" />
              Clear All
            </Button>
            <Button
              type="button"
              size={"sm"}
              disabled={
                trainee.length === 0 || addAllStudentsMutation.isPending
              }
              onClick={handleAddAll}
            >
              {addAllStudentsMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <SaveAll className="size-4" />
              )}
              Add All
            </Button>
          </CardFooter>
        </If>
      </Card>

      <AddStudentResultModal
        isOpen={resultModal.isOpen}
        onClose={() =>
          setResultModal({
            isOpen: false,
            result: null,
          })
        }
        result={resultModal.result}
      />
    </>
  );
}

/**
 * Check for duplicates in the students array
 * @param students - Array of students to check
 * @returns Object with duplicate information
 */
function findDuplicates(students: SearchableTrainee[]) {
  const duplicates = {
    studentIds: new Map<string, number[]>(),
    emails: new Map<string, number[]>(),
  };

  students.forEach((student, index) => {
    // Check student ID duplicates
    if (student.student_id_number) {
      const existingStudentIdIndices =
        duplicates.studentIds.get(student.student_id_number) || [];
      existingStudentIdIndices.push(index);
      duplicates.studentIds.set(
        student.student_id_number,
        existingStudentIdIndices
      );
    }

    // Check email duplicates
    if (student.email) {
      const existingEmailIndices =
        duplicates.emails.get(student.email.toLowerCase()) || [];
      existingEmailIndices.push(index);
      duplicates.emails.set(student.email.toLowerCase(), existingEmailIndices);
    }
  });

  // Filter out non-duplicates (arrays with length 1)
  const studentIdDuplicates = new Map(
    [...duplicates.studentIds].filter(([, indices]) => indices.length > 1)
  );
  const emailDuplicates = new Map(
    [...duplicates.emails].filter(([, indices]) => indices.length > 1)
  );

  return {
    studentIds: studentIdDuplicates,
    emails: emailDuplicates,
    hasDuplicates: studentIdDuplicates.size > 0 || emailDuplicates.size > 0,
  };
}