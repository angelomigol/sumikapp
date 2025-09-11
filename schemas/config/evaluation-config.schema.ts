import { z } from "zod";

export const EvaluationCriteriaSchema = z.object({
  key: z.string(), // unique key e.g. "courteous"
  label: z.string(), // criterion text
  maxScore: z.number().default(5),
  hasRemarks: z.boolean().default(true),
});

export const EvaluationSectionSchema = z.object({
  key: z.string(), // e.g. "work_attitude"
  title: z.string(), // e.g. "I. Work Attitude / Habits (50 pts)"
  weight: z.number(),
  criteria: z.array(EvaluationCriteriaSchema),
});

export const EvaluationConfigSchema = z.object({
  sections: z.array(EvaluationSectionSchema),
});

export type EvaluationConfig = z.infer<typeof EvaluationConfigSchema>;
