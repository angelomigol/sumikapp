import { EvaluationConfigSchema } from "@/schemas/config/evaluation-config.schema";

export const evaluationConfig = EvaluationConfigSchema.parse({
  sections: [
    {
      key: "work_attitude",
      title: "I. Work Attitude / Habits (50 pts)",
      weight: 2,
      criteria: [
        {
          key: "courteous_with_superiors_peers",
          label: "Courteous with superiors/peers",
          maxScore: 5,
        },
        {
          key: "interest_patience_in_tasks",
          label: "Shows interest/patience in tasks assigned",
          maxScore: 5,
        },
        {
          key: "accepts_constructive_feedback",
          label: "Accepts constructive criticisms/suggestions",
          maxScore: 5,
        },
        { key: "punctuality", label: "Reports for work on time", maxScore: 5 },
        { key: "trustworthy", label: "Trustworthy", maxScore: 5 },
      ],
    },
    {
      key: "personal_appearance",
      title: "II. Personal Appearance (25 pts)",
      weight: 1.25,
      criteria: [
        { key: "good_grooming", label: "Displays good grooming", maxScore: 5 },
        { key: "decent_dress_code", label: "Is decently dressed", maxScore: 5 },
        {
          key: "poise_self_confidence",
          label: "Shows poise and self-confidence",
          maxScore: 5,
        },
        {
          key: "stability_under_pressure",
          label: "Shows strength and stability under pressure",
          maxScore: 5,
        },
      ],
    },
    {
      key: "professional_competence",
      title: "III. Professional Competence (25 pts)",
      weight: 25 / 15,
      criteria: [
        {
          key: "understands_instructions",
          label: "Readily understands instructions",
          maxScore: 5,
        },
        {
          key: "submits_work_on_time",
          label: "Submits work on time",
          maxScore: 5,
        },
        {
          key: "quality_work_performance",
          label: "Renders quality work performance",
          maxScore: 5,
        },
      ],
    },
  ],
});
