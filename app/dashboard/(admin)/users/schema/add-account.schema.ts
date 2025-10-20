import { z } from "zod";

const phoneRegex = /^[0-9]+$/;

// Helper function to handle optional strings that might be empty or undefined
const optionalString = z.string().optional().or(z.literal(""));
const optionalPhoneNumber = z
  .string()
  .refine((val) => !val || (phoneRegex.test(val) && val.length === 11), {
    error: "Phone number must be 11 digits (e.g. 09xxxxxxxxx)",
  })
  .optional()
  .or(z.literal(""));

const baseUserSchema = {
  firstName: z.string().min(1, { error: "First name is required" }),
  middleName: optionalString,
  lastName: z.string().min(1, { error: "Last name is required" }),
  email: z.email({ error: "Valid email is required" }),
};

// Trainee schema
const traineeSchema = z.object({
  ...baseUserSchema,
  role: z.literal("trainee", { error: "Role is required" }),
  studentIdNumber: z
    .string()
    .length(11, { message: "Student ID number must be exactly 11 digits" }),
  course: z.enum(["BSIT-MWA", "BSCS"], { error: "Course is required" }),
  section: z.string().min(1, { error: "Section is required" }),
  address: optionalString,
  mobileNumber: optionalPhoneNumber,
});

// Coordinator schema
const coordinatorSchema = z.object({
  ...baseUserSchema,
  role: z.literal("coordinator", { error: "Role is required" }),
  coordinatorDepartment: z.enum(["SECA"], { error: "Department is required" }),
});

// Supervisor schema
const supervisorSchema = z.object({
  ...baseUserSchema,
  role: z.literal("supervisor", { error: "Role is required" }),
  position: z.string().min(1, { error: "Position is required" }),
  supervisorDepartment: z.string().min(1, { error: "Department is required" }),
  telephoneNumber: z
    .string()
    .min(1, { error: "Telephone number is required" })
    .regex(phoneRegex, { error: "Telephone number must contain only digits" })
    .length(11, {
      error: "Telephone number must be 11 digits (e.g. 09xxxxxxxxx)",
    }),
  companyName: optionalString,
  companyContactNo: optionalPhoneNumber,
  companyAddress: optionalString,
  natureOfBusiness: optionalString,
});

// Admin schema
const adminSchema = z.object({
  ...baseUserSchema,
  role: z.literal("admin", { error: "Role is required" }),
});

// Use a more robust approach for the discriminated union
export const addAccountSchema = z
  .union([traineeSchema, coordinatorSchema, supervisorSchema, adminSchema])
  .superRefine((data, ctx) => {
    // Additional validation can be added here if needed
    if (!data.role) {
      ctx.addIssue({
        code: "custom",
        message: "Role is required",
        path: ["role"],
      });
    }

    if (data.role === "trainee") {
      const allowedDomain = "@students.nu-dasma.edu.ph";
      if (!data.email.endsWith(allowedDomain)) {
        ctx.addIssue({
          code: "custom",
          message: `Trainee email must end with ${allowedDomain}`,
          path: ["email"],
        });
      }
    }
  });

export const updateAccountSchema = z
  .union([
    traineeSchema.partial(),
    coordinatorSchema.partial(),
    supervisorSchema.partial(),
    adminSchema.partial(),
  ])
  .superRefine((data, ctx) => {
    if (data.role === "trainee" && data.email) {
      const allowedDomain = "@students.nu-dasma.edu.ph";
      if (!data.email.endsWith(allowedDomain)) {
        ctx.addIssue({
          code: "custom",
          message: `Trainee email must end with ${allowedDomain}`,
          path: ["email"],
        });
      }
    }
  });

export type UpdateAccountFormValues = z.infer<typeof updateAccountSchema>;
export type AddAccountFormValues = z.infer<typeof addAccountSchema>;
