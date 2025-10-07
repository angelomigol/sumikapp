import { searchableTrainee, SearchableTrainee } from "@/components/sumikapp/smart-trainee-search";
import z from "zod";

export const addStudentSchema = z.object({
  first_name: z.string().min(1, { error: "First name is required" }),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, { error: "Last name is required" }),
  student_id_number: z
    .string()
    .min(1, { error: "Student ID number is required" })
    .max(11, { error: "Student ID number must be 11 characters long" }),
  email: z.email({ error: "Invalid email address" }),
  course: z.enum(["BSIT-MWA", "BSCS-ML"], {
    error: "Program/Course is required",
  }),
  section: z.string().min(1, { error: "Section is required" }),
});

export const addStudentsResult = z.object({
  success: z.boolean(),
  message: z.string(),
  results: z.object({
    successful: z.array(
      z.object({
        trainee: searchableTrainee,
        userId: z.string(),
        studentId: z.string(),
      })
    ),
    failed: z.array(
      z.object({
        trainee: searchableTrainee,
        error: z.string(),
      })
    ),
    total: z.number(),
  }),
});

export type AddStudentFormValues = z.infer<typeof addStudentSchema>;
export type AddStudentsResult = z.infer<typeof addStudentsResult>;
