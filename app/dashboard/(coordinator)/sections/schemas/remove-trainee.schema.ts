import z from "zod";

export const removeTraineeSchema = z.object({
  sectionName: z.string().min(1, "Section name is requied"),
  traineeId: z.uuid({ error: "Trainee ID is required" }),
});

export type RemoveTraineeSchema = z.infer<typeof removeTraineeSchema>;
