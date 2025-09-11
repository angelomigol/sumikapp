import z from "zod";

const timeStringSchema = z
  .string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
  .nullable();

export const attendanceFormSchema = z.object({
  start_date: z.date(),
  end_date: z.date(),
});

export const deleteAttendanceReportSchema = z.object({
  id: z.uuid(),
});

export const insertAttendanceEntrySchema = z
  .object({
    entry_date: z.string(),
    time_in: timeStringSchema,
    time_out: timeStringSchema,
    total_hours: z.number().min(0).max(24),
    is_confirmed: z.boolean().default(false),
    status: z.string().nullable(),
    report_id: z.uuid(),
  })
  .refine(
    (data) => {
      if (data.time_in && data.time_out) {
        const [inHours, inMinutes] = data.time_in.split(":").map(Number);
        const [outHours, outMinutes] = data.time_out.split(":").map(Number);

        const inTotalMinutes = inHours * 60 + inMinutes;
        const outTotalMinutes = outHours * 60 + outMinutes;

        const diffMinutes =
          outTotalMinutes >= inTotalMinutes
            ? outTotalMinutes - inTotalMinutes
            : 24 * 60 - inTotalMinutes + outTotalMinutes;

        return diffMinutes <= 16 * 60;
      }
      return true;
    },
    {
      error: "Shift duration cannot exceed 16 hours",
      path: ["time_out"],
    }
  )
  .refine(
    (data) => {
      if (data.is_confirmed) {
        return data.time_in !== null && data.time_out !== null;
      }
      return true;
    },
    {
      error: "Both time in and time out are required to confirm entry",
      path: ["is_confirmed"],
    }
  );

export type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;
export type AttendanceEntrySchema = z.infer<typeof insertAttendanceEntrySchema>;
