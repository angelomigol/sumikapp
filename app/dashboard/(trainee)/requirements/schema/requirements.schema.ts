import z from "zod";

export const UploadRequirementSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.type === "application/pdf", {
      message: "Only PDF files are allowed",
    })
    .refine((file) => file.size <= 50 * 1024 * 1024, {
      message: "File size must be less than 50MB",
    })
    .refine((file) => file.size > 0, {
      message: "File cannot be empty",
    }),
  requirement_name: z.string({ error: "Requirement name is required" }),
});
