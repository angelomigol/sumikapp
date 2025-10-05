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

  work_attitude_remarks: {
    courteous_with_superiors_peers_remarks: string;
    interest_patience_in_tasks_remarks: string;
    accepts_constructive_feedback_remarks: string;
    punctuality_remarks: string;
    trustworthy_remarks: string;
  };

  personal_appearance_remarks: {
    good_grooming_remarks: string;
    decent_dress_code_remarks: string;
    poise_self_confidence_remarks: string;
    stability_under_pressure_remarks: string;
  };

  professional_competence_remarks: {
    understands_instructions_remarks: string;
    submits_work_on_time_remarks: string;
    quality_work_performance_remarks: string;
  };

  overall_rating: number;
  overall_rating_remarks: string;

  tbe_id?: string;
  evaluator_id?: string;
  evaluation_date?: string;
}

export interface CriterionResponse {
  key: string;
  score: number;
  remarks: string;
}

export interface SectionResponse {
  key: string;
  scores: Record<string, number>;
  remarks: Record<string, string>;
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
    tbe_id?: string;
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

  if (
    !scores.work_attitude_remarks ||
    typeof scores.work_attitude_remarks !== "object"
  )
    return false;

  const workAttitudeRemarkKeys = [
    "courteous_with_superiors_peers_remarks",
    "interest_patience_in_tasks_remarks",
    "accepts_constructive_feedback_remarks",
    "punctuality_remarks",
    "trustworthy_remarks",
  ];
  for (const key of workAttitudeRemarkKeys) {
    if (
      typeof scores.work_attitude_remarks[key] !== "string" ||
      scores.work_attitude_remarks[key].trim().length < 3
    ) {
      return false;
    }
  }

  if (
    !scores.personal_appearance_remarks ||
    typeof scores.personal_appearance_remarks !== "object"
  )
    return false;

  const appearanceRemarkKeys = [
    "good_grooming_remarks",
    "decent_dress_code_remarks",
    "poise_self_confidence_remarks",
    "stability_under_pressure_remarks",
  ];
  for (const key of appearanceRemarkKeys) {
    if (
      typeof scores.personal_appearance_remarks[key] !== "string" ||
      scores.personal_appearance_remarks[key].trim().length < 3
    ) {
      return false;
    }
  }

  if (
    !scores.professional_competence_remarks ||
    typeof scores.professional_competence_remarks !== "object"
  )
    return false;

  const competenceRemarkKeys = [
    "understands_instructions_remarks",
    "submits_work_on_time_remarks",
    "quality_work_performance_remarks",
  ];
  for (const key of competenceRemarkKeys) {
    if (
      typeof scores.professional_competence_remarks[key] !== "string" ||
      scores.professional_competence_remarks[key].trim().length < 3
    ) {
      return false;
    }
  }

  if (
    typeof scores.overall_rating_remarks !== "string" ||
    scores.overall_rating_remarks.trim().length < 3
  ) {
    return false;
  }

  return true;
};

export const transformFormToApiPayload = (
  formResponses: Record<string, number>,
  remarks: Record<string, string>,
  metadata: { tbe_id: string; evaluator_id: string }
): EvaluationScores => {
  console.log("🔍 Transform Debug - Input formResponses:", formResponses);
  console.log("🔍 Transform Debug - Input remarks:", remarks);
  console.log("🔍 Transform Debug - Metadata:", metadata);

  const result = {
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
    work_attitude_remarks: {
      courteous_with_superiors_peers_remarks:
        remarks["courteous_with_superiors_peers"] || "",
      interest_patience_in_tasks_remarks:
        remarks["interest_patience_in_tasks"] || "",
      accepts_constructive_feedback_remarks:
        remarks["accepts_constructive_feedback"] || "",
      punctuality_remarks: remarks["punctuality"] || "",
      trustworthy_remarks: remarks["trustworthy"] || "",
    },
    personal_appearance_remarks: {
      good_grooming_remarks: remarks["good_grooming"] || "",
      decent_dress_code_remarks: remarks["decent_dress_code"] || "",
      poise_self_confidence_remarks: remarks["poise_self_confidence"] || "",
      stability_under_pressure_remarks:
        remarks["stability_under_pressure"] || "",
    },
    professional_competence_remarks: {
      understands_instructions_remarks:
        remarks["understands_instructions"] || "",
      submits_work_on_time_remarks: remarks["submits_work_on_time"] || "",
      quality_work_performance_remarks:
        remarks["quality_work_performance"] || "",
    },
    overall_rating: formResponses["overall_rating"] || 0,
    overall_rating_remarks: remarks["overall_rating"] || "",
    tbe_id: metadata.tbe_id,
    evaluator_id: metadata.evaluator_id,
    evaluation_date: new Date().toISOString(),
  };

  const totalScores =
    Object.values(result.work_attitude).reduce((sum, val) => sum + val, 0) +
    Object.values(result.personal_appearance).reduce(
      (sum, val) => sum + val,
      0
    ) +
    Object.values(result.professional_competence).reduce(
      (sum, val) => sum + val,
      0
    ) +
    result.overall_rating;

  console.log("✅ Transform Debug - Output result:", result);
  console.log("✅ Transform Debug - Total scores:", totalScores);

  if (totalScores === 0) {
    console.error(
      "❌ Transform Error: All scores are 0! Check form key mapping." 
    );
    console.error("Available formResponses keys:", Object.keys(formResponses));
  }


  return result;
};
