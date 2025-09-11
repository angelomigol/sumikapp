export interface EvaluationScores {
  work_attitude: {
    courteous_with_superiors_peers: number;
    interest_patience_in_tasks: number;
    accepts_constructive_feedback: number;
    punctuality: number;
    trustworthy: number;
  };

  personal_appearance: {
    good_grooming: number;
    decent_dress_code: number;
    poise_self_confidence: number;
    stability_under_pressure: number;
  };

  professional_competence: {
    understands_instructions: number;
    submits_work_on_time: number;
    quality_work_performance: number;
  };

  overall_rating: number;

  trainee_id?: string;
  evaluator_id?: string;
  evaluation_date?: string;
}

export interface CriterionResponse {
  key: string;
  score: number;
  remarks?: string;
}

export interface SectionResponse {
  key: string;
  scores: Record<string, number>;
  remarks?: Record<string, string>;
}

export interface EvaluationFormResponse {
  sections: {
    work_attitude: Record<string, number>;
    personal_appearance: Record<string, number>;
    professional_competence: Record<string, number>;
  };
  overall_performance: number;
  remarks: Record<string, string>;
  metadata?: {
    trainee_id?: string;
    evaluator_id?: string;
    evaluation_date?: string;
  };
}

export interface PredictionRequest {
  evaluation_scores: EvaluationScores;
}

export interface PredictionResponse {
  prediction_class: boolean;
  prediction_label: "Employable" | "Less Employable";
  prediction_probability: number;
  confidence_level: "High" | "Medium" | "Low";
  original_scores: EvaluationScores;
  mapped_features: Record<string, number>;
  analysis: {
    overall_statistics: {
      original_scores_avg: number;
      mapped_features_avg: number;
      score_consistency: number;
      total_criteria_evaluated: number;
    };
    weak_areas: Array<{
      area: string;
      score: number;
      severity: "High" | "Medium" | "Low";
      description: string;
    }>;
    strong_areas: Array<{
      area: string;
      score: number;
      description: string;
    }>;
    feature_breakdown: Record<string, number>;
  };
  recommendations: Array<{
    category: string;
    priority: "High" | "Medium" | "Low";
    recommendation: string;
    action_items: string[];
  }>;
  model_info: {
    model_type: string;
    model_id: string;
    training_date: string;
    model_accuracy: string | number;
    prediction_date: string;
    ai_recommendations_used: boolean;
  };
  prediction_id?: string;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

export const validateEvaluationScores = (
  scores: any
): scores is EvaluationScores => {
  if (!scores || typeof scores !== "object") return false;

  if (!scores.work_attitude || typeof scores.work_attitude !== "object")
    return false;

  const workAttitudeKeys = [
    "courteous_with_superiors_peers",
    "interest_patience_in_tasks",
    "accepts_constructive_feedback",
    "punctuality",
    "trustworthy",
  ];
  for (const key of workAttitudeKeys) {
    if (
      typeof scores.work_attitude[key] !== "number" ||
      scores.work_attitude[key] < 1 ||
      scores.work_attitude[key] > 5
    ) {
      return false;
    }
  }

  if (
    !scores.personal_appearance ||
    typeof scores.personal_appearance !== "object"
  )
    return false;

  const appearanceKeys = [
    "good_grooming",
    "decent_dress_code",
    "poise_self_confidence",
    "stability_under_pressure",
  ];
  for (const key of appearanceKeys) {
    if (
      typeof scores.personal_appearance[key] !== "number" ||
      scores.personal_appearance[key] < 1 ||
      scores.personal_appearance[key] > 5
    ) {
      return false;
    }
  }

  if (
    !scores.professional_competence ||
    typeof scores.professional_competence !== "object"
  )
    return false;

  const competenceKeys = [
    "understands_instructions",
    "submits_work_on_time",
    "quality_work_performance",
  ];
  for (const key of competenceKeys) {
    if (
      typeof scores.professional_competence[key] !== "number" ||
      scores.professional_competence[key] < 1 ||
      scores.professional_competence[key] > 5
    ) {
      return false;
    }
  }

  if (
    typeof scores.overall_rating !== "number" ||
    scores.overall_rating < 1 ||
    scores.overall_rating > 5
  ) {
    return false;
  }

  return true;
};

export const transformFormToApiPayload = (
  formResponses: Record<string, number>,
  metadata?: { trainee_id?: string; evaluator_id?: string }
): EvaluationScores => {
  return {
    work_attitude: {
      courteous_with_superiors_peers:
        formResponses["courteous_with_superiors_peers"] || 0,
      interest_patience_in_tasks:
        formResponses["interest_patience_in_tasks"] || 0,
      accepts_constructive_feedback:
        formResponses["accepts_constructive_feedback"] || 0,
      punctuality: formResponses["punctuality"] || 0,
      trustworthy: formResponses["trustworthy"] || 0,
    },
    personal_appearance: {
      good_grooming: formResponses["good_grooming"] || 0,
      decent_dress_code: formResponses["decent_dress_code"] || 0,
      poise_self_confidence: formResponses["poise_self_confidence"] || 0,
      stability_under_pressure: formResponses["stability_under_pressure"] || 0,
    },
    professional_competence: {
      understands_instructions: formResponses["understands_instructions"] || 0,
      submits_work_on_time: formResponses["submits_work_on_time"] || 0,
      quality_work_performance: formResponses["quality_work_performance"] || 0,
    },
    overall_rating: formResponses["overall_performance"] || 0,
    trainee_id: metadata?.trainee_id,
    evaluator_id: metadata?.evaluator_id,
    evaluation_date: new Date().toISOString(),
  };
};