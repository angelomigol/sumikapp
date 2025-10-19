import { useQuery } from "@tanstack/react-query";

import { useSupabase } from "@/utils/supabase/hooks/use-supabase";
import { Database, Tables } from "@/utils/supabase/supabase.types";

const queryKey = ["supabase:supervisor_overview_dashboard_view"];

export interface SupervisorDashboardData {
  supervisorId: string;
  supervisorName: string;
  supervisorEmail: string;
  companyName: string;
  department: string;
  position: string;

  totalActiveTrainees: number;
  currentlyActiveTrainees: number;
  completedTrainees: number;

  totalPendingReports: number;
  pendingEvaluationsCount: number;

  recentActivities: RecentActivity[];
  traineesPendingEvaluation: TraineesPendingEval[];
}

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "activity" | "attendance" | "document" | "announcement";
  activity_type: Database["public"]["Enums"]["activity_type_enum"];
  user_name: string;
}

interface TraineesPendingEval {
  trainee_id: string;
  trainee_name: string;
  course: string;
  section: string;
}

export function useFetchSupervisorDashboard() {
  const client = useSupabase();

  const queryFn = async (): Promise<SupervisorDashboardData | null> => {
    const response = await client.auth.getUser();

    if (response.error) {
      throw new Error(`Authentication error: ${response.error.message}`);
    }

    if (!response.data.user) {
      throw new Error("No authenticated user found");
    }

    const { data, error } = await client
      .from("supervisor_overview_dashboard")
      .select("*")
      .eq("supervisor_id", response.data.user.id)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return transformSupervisorDashboardData(data);
  };

  return useQuery({
    queryKey,
    queryFn,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

function transformSupervisorDashboardData(
  data: Tables<"supervisor_overview_dashboard">
): SupervisorDashboardData {
  const parseJsonField = <T>(field: unknown, fallback: T): T => {
    if (!field) return fallback;

    if (typeof field === "object") {
      return field as T;
    }

    if (typeof field === "string") {
      try {
        return JSON.parse(field) as T;
      } catch (error) {
        console.warn("Error parsing JSON field:", error);
        return fallback;
      }
    }

    return fallback;
  };

  const jsonFields = {
    recentActivities: parseJsonField<RecentActivity[]>(
      data.recent_activities,
      []
    ),
    traineePendingEvaluation: parseJsonField<TraineesPendingEval[]>(
      data.trainees_pending_evaluation,
      []
    ),
  };

  return {
    supervisorId: data.supervisor_id || "",
    supervisorName: data.supervisor_name || "",
    supervisorEmail: data.supervisor_email || "",
    companyName: data.company_name || "",
    department: data.department || "",
    position: data.position || "",

    totalActiveTrainees: data.total_active_trainees || 0,
    currentlyActiveTrainees: data.currently_active_trainees || 0,
    completedTrainees: data.completed_trainees || 0,

    totalPendingReports: data.pending_weekly_reports || 0,
    pendingEvaluationsCount: data.pending_evaluations || 0,

    recentActivities: jsonFields.recentActivities,
    traineesPendingEvaluation: jsonFields.traineePendingEvaluation,
  };
}
