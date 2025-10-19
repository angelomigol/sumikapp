import z from "zod";

import { InternshipCode } from "@/lib/constants";

import { Constants, Tables } from "@/utils/supabase/supabase.types";

const EntryStatus = Constants.public.Enums.entry_status as readonly string[];

const timeStringSchema = z
  .string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
  .nullable();

export const weeklyReportFormSchema = z
  .object({
    start_date: z.date(),
    end_date: z.date(),
  })
  .refine(
    (data) => {
      const diffTime = Math.abs(
        data.end_date.getTime() - data.start_date.getTime()
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays === 6;
    },
    {
      message: "Date range must be exactly 7 days",
      path: ["start_date"],
    }
  );

export const deleteWeeklyReportSchema = z.object({
  id: z.uuid(),
});

export const entryUploadedFileSchema = z.object({
  entry_id: z.uuid(),
  file: z
    .any()
    .refine((file) => file == null || file instanceof File, {
      error: "Invalid file type.",
    })
    .optional(),
  file_name: z.string(),
  file_size: z.number(),
  file_type: z.string(),
  file_path: z.string(),
});

export const insertDailyEntrySchema = z
  .object({
    report_id: z.uuid(),
    entry_date: z.string(),
    time_in: timeStringSchema,
    time_out: timeStringSchema,
    daily_accomplishments: z.string().nullable(),
    total_hours: z.number().min(0).max(24),
    is_confirmed: z.boolean().default(false),
    status: z.enum(EntryStatus).nullable(),
    additional_notes: z
      .string()
      .max(1000, "Additional notes must not exceed 1000 characters")
      .nullable(),
    files: z.array(entryUploadedFileSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.time_in || !data.time_out) return;

    const [inHours, inMinutes] = data.time_in.split(":").map(Number);
    const [outHours, outMinutes] = data.time_out.split(":").map(Number);

    const inTotalMinutes = inHours * 60 + inMinutes;
    const outTotalMinutes = outHours * 60 + outMinutes;

    // Check if time_out is after time_in (same day only)
    if (outTotalMinutes <= inTotalMinutes) {
      ctx.addIssue({
        code: "custom",
        message:
          "Time out must be later than time in on the same day. Overnight shifts are not allowed.",
        path: ["time_out"],
      });
      return;
    }

    // Check shift duration (max 16 hours, same day)
    const diffMinutes = outTotalMinutes - inTotalMinutes;
    if (diffMinutes > 16 * 60) {
      ctx.addIssue({
        code: "custom",
        message: "Shift duration cannot exceed 16 hours",
        path: ["time_out"],
      });
    }
  });

export type WeeklyReportFormValues = z.infer<typeof weeklyReportFormSchema>;
export type DailyEntrySchema = z.infer<typeof insertDailyEntrySchema>;
export type WeeklyReportEntryWithFiles = WeeklyReportEntry & {
  files?: EntryUploadedFile[];
};
export type WeeklyReport = Tables<"weekly_reports"> & {
  internship_code: InternshipCode;
};
export type WeeklyReportEntry = Tables<"weekly_report_entries">;
export type NormalizedWeeklyReport = WeeklyReport & {
  company_name: string;
  lunch_break: number;
  weekly_report_entries: WeeklyReportEntry[];
  file_attachments: EntryUploadedFile[];
};
export type EntryUploadedFile = z.infer<typeof entryUploadedFileSchema>;
