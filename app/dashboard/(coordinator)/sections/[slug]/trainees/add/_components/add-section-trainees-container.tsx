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

import { AddStudentFormValues } from "../schema/add-student-form.schema";
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
          <TabsTrigger value="bulk" className="text-sm" disabled>
            Bulk Entry
          </TabsTrigger>
        </TabsList>
        <TabsContent value="manual">
          <SmartTraineeSearch onSelect={handleTraineeSelect} />
        </TabsContent>
        <TabsContent value="bulk">
          <BulkUploadTab />
        </TabsContent>
      </Tabs>

      <div className="leading-none">
        <div className="flex items-center gap-2">
          <p className="text-lg font-medium">Students</p>
          {hasUnsavedChanges && (
            <Badge className="bg-amber-3 text-amber-11">Unsaved</Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm">
          Review and edit student details before saving. You can make changes
          directly in the table.
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
