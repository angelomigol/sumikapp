import {
  ApiError,
  EvaluationScores,
  PredictionRequest,
  PredictionResponse,
  validateEvaluationScores,
} from "@/hooks/use-evaluation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:8000";

class EmployabilityPredictionService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Predict employability based on evaluation scores
   */
  async predictEmployability(
    evaluationScores: EvaluationScores
  ): Promise<PredictionResponse> {
    try {
      if (!validateEvaluationScores(evaluationScores)) {
        throw new Error("Invalid evaluation scores format");
      }

      const requestPayload: PredictionRequest = {
        evaluation_scores: evaluationScores,
      };

      console.log("Sending prediction request: ", requestPayload);

      const response = await fetch(`${this.baseUrl}/predict/employability`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(`API Error ${response.status}: ${errorData.detail}`);
      }

      const result: PredictionResponse = await response.json();

      console.log("Prediction response: ", result);

      return result;
    } catch (error) {
      console.error("Employability prediction failed: ", error);

      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Unknown error occured during prediction");
      }
    }
  }

  /**
   * Health check for the ML service
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Health check failed: ", error);
      throw error;
    }
  }

  async trainModel(): Promise<{ message: string; status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/train/model`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(
          `Training failed ${response.status}: ${errorData.detail}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Model training failed: ", error);
      throw error;
    }
  }
}

export const employabilityPrediction = new EmployabilityPredictionService();

export default EmployabilityPredictionService;
