import { z } from "zod";

export const LogsFilterConfigSchema = z.object({
  filters: z.array(
    z.object({
      key: z.string(), // e.g., "timeline", "logLevel"
      label: z.string(), // e.g., "Timeline", "Log Level"
      type: z.enum(["select", "date", "checkbox", "toggle"]),
      options: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
          })
        )
        .optional(),
      defaultValue: z.string().optional(),
      group: z.string().optional(), // optional grouping like "Basic", "Advanced"
    })
  ),
});


