"use client";

import React, { useState } from "react";

import pathsConfig from "@/config/paths.config";
import { useUnsavedChangesArray } from "@/hooks/use-unsaved-changes";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackButton from "@/components/sumikapp/back-button";
import SmartTraineeSearch, {
  SearchableTrainee,
} from "@/components/sumikapp/smart-trainee-search";

import BulkUploadTab from "./bulk-upload-tab";
import UnsavedStudentsTable from "./unsaved-students-table";

export default function AddSectionTraineesContainer(params: { slug: string }) {
  const [students, setStudents] = useState<SearchableTrainee[]>([]);

  const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsavedChangesArray({
    currentValues: students,
    originalValues: [],
    isEditing: true,
  });

  const removeRow = (index: number) => {
    setStudents((prev) => prev.filter((_, i) => i !== index));
  };

  const removeMultipleStudents = (indicesToRemove: number[]) => {
    setStudents((currentStudents) =>
      removeStudentsByIndices(currentStudents, indicesToRemove)
    );
  };

  const clearTable = () => {
    setStudents([]);
    setHasUnsavedChanges(false);
  };

  const handleTraineeSelect = (trainee: SearchableTrainee) => {
    // Check if trainee is already in the list
    const isAlreadyAdded = students.some(
      (student) => student.student_id_number === trainee.student_id_number
    );

    if (isAlreadyAdded) {
      // You might want to show a toast notification here
      console.warn("Student is already in the list");
      return;
    }

    // Add to the students list
    setStudents((prev) => [...prev, trainee]);
  };

  const handleBulkStudentsUploaded = (
    uploadedStudents: SearchableTrainee[]
  ) => {
    // Get existing student IDs and emails for duplicate checking
    const existingStudentIds = new Set(
      students.map((s) => s.student_id_number.toLowerCase())
    );
    const existingEmails = new Set(students.map((s) => s.email.toLowerCase()));

    // Filter out students that are already in the table
    const newStudents = uploadedStudents.filter((student) => {
      const isDuplicateId = existingStudentIds.has(
        student.student_id_number.toLowerCase()
      );
      const isDuplicateEmail = existingEmails.has(student.email.toLowerCase());

      if (isDuplicateId) {
        console.warn(
          `Skipping duplicate student ID: ${student.student_id_number}`
        );
      }
      if (isDuplicateEmail && !isDuplicateId) {
        console.warn(`Skipping duplicate email: ${student.email}`);
      }

      return !isDuplicateId && !isDuplicateEmail;
    });

    // Add new students to the table
    if (newStudents.length > 0) {
      setStudents((prev) => [...prev, ...newStudents]);
    }

    // Log statistics
    const skippedCount = uploadedStudents.length - newStudents.length;
    if (skippedCount > 0) {
      console.log(
        `Added ${newStudents.length} students, skipped ${skippedCount} duplicates`
      );
    }
  };

  return (
    <>
      <div className="flex flex-row items-center gap-2">
        <BackButton
          title="Add Students"
          link={pathsConfig.dynamic.sectionTrainees(params.slug)}
        />
      </div>

      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual" className="text-sm">
            Manual Entry
          </TabsTrigger>
          {/* <TabsTrigger value="bulk" className="text-sm">
            Bulk Entry
          </TabsTrigger> */}
        </TabsList>
        <TabsContent value="manual">
          <SmartTraineeSearch onSelect={handleTraineeSelect} />
        </TabsContent>
        {/* <TabsContent value="bulk">
          <BulkUploadTab onStudentsUploaded={handleBulkStudentsUploaded} />
        </TabsContent> */}
      </Tabs>

      <div className="leading-none">
        <div className="flex items-center gap-2">
          <p className="text-lg font-medium">Students</p>
          {hasUnsavedChanges && (
            <Badge className="bg-amber-3 text-amber-11">Unsaved</Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm">
          Review student details before saving. You can make changes directly in
          the table.
        </p>
      </div>

      <UnsavedStudentsTable
        trainee={students}
        onRemove={removeRow}
        onClearAll={clearTable}
        onRemoveMultiple={removeMultipleStudents}
        slug={params.slug}
      />
    </>
  );
}

function removeStudentsByIndices(
  students: SearchableTrainee[],
  indicesToRemove: number[]
): SearchableTrainee[] {
  // Sort indices in descending order to avoid index shifting issues
  const sortedIndices = [...indicesToRemove].sort((a, b) => b - a);

  // Create a copy of the array
  const updatedStudents = [...students];

  // Remove students starting from the highest index
  sortedIndices.forEach((index) => {
    if (index >= 0 && index < updatedStudents.length) {
      updatedStudents.splice(index, 1);
    }
  });

  return updatedStudents;
}
