import z from "zod";

export const activityFormSchema = z.object({
  start_date: z.date(),
  end_date: z.date(),
});

export const deleteActivityReportSchema = z.object({
  id: z.uuid(),
});

export const insertActivityEntrySchema = z
  .object({
    entry_date: z.string(),
    daily_accomplishments: z.string().nullable(),
    no_of_working_hours: z.number().min(0).max(24),
    is_confirmed: z.boolean().default(false),
    status: z.string().nullable(),
    report_id: z.uuid(),
  })
  .refine(
    (data) => {
      if (data.is_confirmed) {
        return (
          data.daily_accomplishments !== null &&
          data.no_of_working_hours !== null
        );
      }
      return true;
    },
    {
      error:
        "Both daily accomplishments and no. of working hours are required to confirm entry",
      path: ["is_confirmed"],
    }
  );

export type ActivityFormValues = z.infer<typeof activityFormSchema>;
export type ActivityEntrySchema = z.infer<typeof insertActivityEntrySchema>;
