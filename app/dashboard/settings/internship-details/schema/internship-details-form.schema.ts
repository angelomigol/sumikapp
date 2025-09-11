import z from "zod";

const phoneRegex = /^[0-9]+$/;

export const internshipDetailsFormSchema = z
  .object({
    id: z.uuid().optional(),
    companyName: z.string().min(1, "Company name is required"),
    contactNumber: z
      .string()
      .regex(phoneRegex, { message: "Contact number must contain only digits" })
      .length(11, {
        message: "Contact number must be 11 digits (e.g. 09xxxxxxxxx)",
      }),
    natureOfBusiness: z.string().min(1, "Nature of business is required"),
    companyAddress: z.string().min(1, "Company address is required"),
    supervisorEmail: z.email("Please enter a valid email address"),
    jobRole: z.string().min(1, "Job role is required"),
    customJobRole: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    dailySchedule: z.array(z.string()).min(1, "Please select at least one day"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  })
  .refine(
    (data) => {
      if (data.jobRole === "others") {
        return data.customJobRole && data.customJobRole.trim().length > 0;
      }
      return true;
    },
    {
      error: "Custom job role is required when 'Others' is selected",
      path: ["customJobRole"],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      error: "End date must be after start date",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      error: "End time must be after start time",
      path: ["endTime"],
    }
  );

export type InternshipDetailsFormValues = z.infer<
  typeof internshipDetailsFormSchema
>;
