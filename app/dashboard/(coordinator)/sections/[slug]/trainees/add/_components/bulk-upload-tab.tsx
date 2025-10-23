"use client";

import React, { useRef, useState } from "react";

import {
  AlertCircle,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import * as motion from "motion/react-client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { If } from "@/components/sumikapp/if";
import { SearchableTrainee } from "@/components/sumikapp/smart-trainee-search";

import { AddStudentFormValues } from "../schema/add-student-form.schema";

interface BulkUploadTabProps {
  onStudentsUploaded: (students: SearchableTrainee[]) => void;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

interface ParseResult {
  valid: SearchableTrainee[];
  invalid: ValidationError[];
  total: number;
}

export default function BulkUploadTab({
  onStudentsUploaded,
}: BulkUploadTabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_ROWS = 500;

  /**
   * Download the student template file
   */
  const handleDownloadTemplate = () => {
    // Create template data
    const templateData = [
      {
        "Student ID Number": "",
        "First Name": "",
        "Middle Name": "",
        "Last Name": "",
        "Email Address": "",
        Course: "",
        Section: "",
      },
    ];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    // Set column widths
    ws["!cols"] = [
      { wch: 20 }, // Student ID Number
      { wch: 15 }, // First Name
      { wch: 15 }, // Middle Name
      { wch: 15 }, // Last Name
      { wch: 30 }, // Email Address
      { wch: 12 }, // Course
      { wch: 10 }, // Section
    ];

    // Generate and download file
    XLSX.writeFile(wb, "student_bulk_upload_template.xlsx");
    toast.success("Template downloaded successfully");
  };

  /**
   * Validate file before processing
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!validExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: "Please upload an Excel (.xlsx, .xls) or CSV file",
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      };
    }

    // Check if file is empty
    if (file.size === 0) {
      return { valid: false, error: "File is empty" };
    }

    return { valid: true };
  };

  /**
   * Validate individual student data
   */
  const validateStudent = (
    row: any,
    rowIndex: number
  ): {
    valid: boolean;
    student?: SearchableTrainee;
    errors: ValidationError[];
  } => {
    const errors: ValidationError[] = [];

    // Required fields validation
    const requiredFields = {
      "Student ID Number": "student_id_number",
      "First Name": "first_name",
      "Last Name": "last_name",
      "Email Address": "email",
      Course: "course",
      Section: "section",
    };

    for (const [excelField, dbField] of Object.entries(requiredFields)) {
      const value = row[excelField];
      if (!value || String(value).trim() === "") {
        errors.push({
          row: rowIndex,
          field: excelField,
          message: `${excelField} is required`,
        });
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Extract and clean values
    const studentIdNumber = String(row["Student ID Number"]).trim();
    const firstName = String(row["First Name"]).trim();
    const middleName = row["Middle Name"]
      ? String(row["Middle Name"]).trim()
      : "";
    const lastName = String(row["Last Name"]).trim();
    const email = String(row["Email Address"]).trim().toLowerCase();
    const course = String(row["Course"]).trim();
    const section = String(row["Section"]).trim();

    // Validate student ID format (11 characters)
    if (studentIdNumber.length !== 11) {
      errors.push({
        row: rowIndex,
        field: "Student ID Number",
        message: "Student ID must be 11 characters",
        value: studentIdNumber,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({
        row: rowIndex,
        field: "Email Address",
        message: "Invalid email format",
        value: email,
      });
    }

    // Validate course
    const validCourses = ["BSIT-MWA", "BSCS-ML"];
    if (!validCourses.includes(course)) {
      errors.push({
        row: rowIndex,
        field: "Course",
        message: `Course must be one of: ${validCourses.join(", ")}`,
        value: course,
      });
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Create student object
    const student: SearchableTrainee = {
      student_id_number: studentIdNumber,
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      email: email,
      course: course as "BSIT-MWA" | "BSCS-ML",
      section: section,
    };

    return { valid: true, student, errors: [] };
  };

  /**
   * Parse and validate the uploaded file
   */
  const parseFile = async (file: File): Promise<ParseResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });

          // Get first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            defval: "",
          });

          if (jsonData.length === 0) {
            reject(new Error("File is empty or has no data"));
            return;
          }

          if (jsonData.length > MAX_ROWS) {
            reject(
              new Error(`File contains too many rows. Maximum is ${MAX_ROWS}`)
            );
            return;
          }

          // Validate required columns
          const firstRow = jsonData[0] as any;
          const requiredColumns = [
            "Student ID Number",
            "First Name",
            "Last Name",
            "Email Address",
            "Course",
            "Section",
          ];

          const missingColumns = requiredColumns.filter(
            (col) => !(col in firstRow)
          );

          if (missingColumns.length > 0) {
            reject(
              new Error(
                `Missing required columns: ${missingColumns.join(", ")}`
              )
            );
            return;
          }

          // Validate each row
          const validStudents: SearchableTrainee[] = [];
          const allErrors: ValidationError[] = [];

          jsonData.forEach((row, index) => {
            const rowNumber = index + 2; // +2 because Excel rows start at 1 and we have a header
            const validation = validateStudent(row, rowNumber);

            if (validation.valid && validation.student) {
              validStudents.push(validation.student);
            } else {
              allErrors.push(...validation.errors);
            }
          });

          // Check for duplicate student IDs within the file
          const studentIds = new Map<string, number[]>();
          validStudents.forEach((student, index) => {
            const existingIndices =
              studentIds.get(student.student_id_number) || [];
            existingIndices.push(index + 2);
            studentIds.set(student.student_id_number, existingIndices);
          });

          const duplicateIds = [...studentIds].filter(
            ([, indices]) => indices.length > 1
          );
          duplicateIds.forEach(([id, indices]) => {
            allErrors.push({
              row: indices[1],
              field: "Student ID Number",
              message: `Duplicate Student ID: ${id} (also found in rows ${indices.join(", ")})`,
            });
          });

          // Check for duplicate emails within the file
          const emails = new Map<string, number[]>();
          validStudents.forEach((student, index) => {
            const existingIndices =
              emails.get(student.email.toLowerCase()) || [];
            existingIndices.push(index + 2);
            emails.set(student.email.toLowerCase(), existingIndices);
          });

          const duplicateEmails = [...emails].filter(
            ([, indices]) => indices.length > 1
          );
          duplicateEmails.forEach(([email, indices]) => {
            allErrors.push({
              row: indices[1],
              field: "Email Address",
              message: `Duplicate Email: ${email} (also found in rows ${indices.join(", ")})`,
            });
          });

          resolve({
            valid: validStudents,
            invalid: allErrors,
            total: jsonData.length,
          });
        } catch (error) {
          reject(
            new Error(
              `Failed to parse file: ${error instanceof Error ? error.message : "Unknown error"}`
            )
          );
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsBinaryString(file);
    });
  };

  /**
   * Handle file selection
   */
  const handleFileSelection = async (uploadedFile: File) => {
    setError(null);
    setParseResult(null);

    const validation = validateFile(uploadedFile);

    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    setFile(uploadedFile);
    setIsProcessing(true);

    try {
      const result = await parseFile(uploadedFile);
      setParseResult(result);

      if (result.invalid.length === 0) {
        toast.success(
          `Successfully validated ${result.valid.length} students. Click "Import Students" to add them.`
        );
      } else {
        toast.warning(
          `Found ${result.valid.length} valid students and ${result.invalid.length} errors. Review and fix errors before importing.`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process file";
      setError(errorMessage);
      toast.error(errorMessage);
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle import students
   */
  const handleImportStudents = () => {
    if (!parseResult || parseResult.valid.length === 0) {
      toast.error("No valid students to import");
      return;
    }

    if (parseResult.invalid.length > 0) {
      toast.error("Please fix all validation errors before importing students");
      return;
    }

    // Pass the valid students to the parent component
    onStudentsUploaded(parseResult.valid);

    toast.success(
      `Successfully imported ${parseResult.valid.length} students to the table`
    );

    // Reset state
    handleRemoveFile();
  };

  /**
   * Handle remove file
   */
  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setParseResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const uploadedFile = e.dataTransfer.files[0];
      handleFileSelection(uploadedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFile = e.target.files[0];
      handleFileSelection(uploadedFile);
    }
  };

  const handleDropZoneClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardAction>
          <Button
            size={"sm"}
            className="transition-none"
            onClick={handleDownloadTemplate}
            asChild
          >
            <motion.button whileTap={{ scale: 0.85 }}>
              <Download className="size-4" />
              Download Template
            </motion.button>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Alert */}
        <If condition={!!error}>
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </If>

        {/* Validation Results */}
        <If condition={!!parseResult}>
          <Alert
            className={
              parseResult && parseResult.invalid.length === 0
                ? "border-green-500 bg-green-50 text-green-900"
                : "border-yellow-500 bg-yellow-50 text-yellow-900"
            }
          >
            <CheckCircle className="size-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">
                  Validation Results: {parseResult?.valid.length} valid,{" "}
                  {parseResult?.invalid.length} errors
                </p>
                {parseResult && parseResult.invalid.length > 0 && (
                  <div className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs">
                    <p className="font-medium">Errors found:</p>
                    {parseResult.invalid.slice(0, 10).map((err, idx) => (
                      <div
                        key={idx}
                        className="rounded border-l-2 border-yellow-600 bg-yellow-100 p-2"
                      >
                        <strong>Row {err.row}:</strong> {err.field} -{" "}
                        {err.message}
                        {err.value && (
                          <span className="text-muted-foreground ml-1">
                            ({err.value})
                          </span>
                        )}
                      </div>
                    ))}
                    {parseResult.invalid.length > 10 && (
                      <p className="text-muted-foreground">
                        ... and {parseResult.invalid.length - 10} more errors
                      </p>
                    )}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </If>

        {/* Drop Zone */}
        <div
          className={`cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/10"
              : isProcessing
                ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-50"
                : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleDropZoneClick}
          role="button"
          tabIndex={isProcessing ? -1 : 0}
          aria-label="Upload area for student bulk import file"
        >
          <FileSpreadsheet className="text-muted-foreground mx-auto size-12" />
          <h3 className="mt-4 font-semibold">Drag and drop your file here</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            or click to browse your files
          </p>
          <Input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".xlsx"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={isProcessing}
          />

          <Button
            variant="outline"
            className="mt-4"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 size-4" />
                Select File
              </>
            )}
          </Button>
        </div>
      </CardContent>

      {/* Footer with file info and action buttons */}
      <If condition={file !== null}>
        <CardFooter className="flex-col gap-4">
          {/* File info */}
          <div className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="size-4 text-gray-500" />
              <div className="text-sm">
                <span className="text-muted-foreground">Selected file: </span>
                <span className="font-medium">{file?.name}</span>
                <span className="text-muted-foreground ml-2 text-xs">
                  ({file && (file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              disabled={isProcessing}
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Import button */}
          <If condition={parseResult !== null && !isProcessing}>
            <div className="flex w-full gap-2">
              <Button
                onClick={handleImportStudents}
                disabled={
                  !parseResult ||
                  parseResult.valid.length === 0 ||
                  parseResult.invalid.length > 0
                }
                className="flex-1"
              >
                <Upload className="mr-2 size-4" />
                Import {parseResult?.valid.length || 0} Students
              </Button>
            </div>
          </If>
        </CardFooter>
      </If>
    </Card>
  );
}
