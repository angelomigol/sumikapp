import z from "zod";

export const announcementSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().min(1, { error: "Title is required" }),
  content: z.string().min(1, { error: "Content is required" }),
  slug: z.string().min(1, { error: "Section is required" }),
});

export const deleteAnnouncementSchema = z.object({
  id: z.uuid(),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;
