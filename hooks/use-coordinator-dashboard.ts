import { useQuery } from "@tanstack/react-query";

import { InternshipCode } from "@/lib/constants";

import { useSupabase } from "@/utils/supabase/hooks/use-supabase";
import { Database, Tables } from "@/utils/supabase/supabase.types";

const queryKey = ["supabase:coordinaor_overview_dashboard_view"];

export interface CoordinatorDashboardData {
  dashboardStats: DashboardStats;
  recentActivities: RecentActivity[];
  sectionProgress: SectionProgress[];
}

interface DashboardStats {
  totalStudents: number;
  totalSections: number;
  pendingRequirements: number;
  activeBatches: number;
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

interface SectionProgress {
  program: string;
  internship_code: InternshipCode;
  progress_percentage: number;
}

const createDefaultCoordinatorDashboardData = (): CoordinatorDashboardData => ({
  dashboardStats: {
    totalSections: 0,
    totalStudents: 0,
    pendingRequirements: 0,
    activeBatches: 0,
  },
  recentActivities: [],
  sectionProgress: [],
});

export function useFetchCoordinatorDashboard() {
  const client = useSupabase();

  const queryFn = async (): Promise<CoordinatorDashboardData> => {
    try {
      const response = await client.auth.getUser();

      if (response.error) {
        throw new Error(`Authentication error: ${response.error.message}`);
      }

      if (!response.data.user) {
        throw new Error("No authenticated user found");
      }

      const { data, error } = await client
        .from("coordinator_overview_dashboard")
        .select("*")
        .eq("coordinator_id", response.data.user.id)
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        return createDefaultCoordinatorDashboardData();
      }

      return transformCoordinatorDashboardData(data);
    } catch (error) {
      console.error("Error fetching coordinator dashboard data:", error);

      return createDefaultCoordinatorDashboardData();
    }
  };

  return useQuery({
    queryKey,
    queryFn,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes("Authentication error")) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Add meta for error handling
    meta: {
      errorMessage: "Failed to load dashboard data",
    },
  });
}

function transformCoordinatorDashboardData(
  data: Tables<"coordinator_overview_dashboard">
): CoordinatorDashboardData {
  const parseJsonField = <T>(field: unknown, fallback: T): T => {
    if (field === null) return fallback;

    if (typeof field === "object" && !Array.isArray(field)) {
      return field as T;
    }

    if (Array.isArray(field)) {
      return field as T;
    }

    if (typeof field === "string") {
      if (field.trim() === "" || field === "null") {
        return fallback;
      }

      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(fallback) && !Array.isArray(parsed)) {
          console.warn("Expected array but got non-array from JSON:", parsed);
          return fallback;
        }
        return parsed as T;
      } catch (error) {
        console.warn("Error parsing JSON field:", {
          field: field.substring(0, 100) + (field.length > 100 ? "..." : ""),
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return fallback;
      }
    }

    console.warn("Unexpected field type:", typeof field);
    return fallback;
  };

  const parsedDashboardStats = parseJsonField<any>(data.dashboard_stats, {});

  const safeDashboardStats: DashboardStats = {
    totalStudents:
      typeof parsedDashboardStats.total_students === "number"
        ? parsedDashboardStats.total_students
        : 0,
    totalSections:
      typeof parsedDashboardStats.total_sections === "number"
        ? parsedDashboardStats.total_sections
        : 0,
    pendingRequirements:
      typeof parsedDashboardStats.pending_requirements === "number"
        ? parsedDashboardStats.pending_requirements
        : 0,
    activeBatches:
      typeof parsedDashboardStats.active_batches === "number"
        ? parsedDashboardStats.active_batches
        : 0,
  };

  const result = {
    dashboardStats: safeDashboardStats,
    recentActivities: parseJsonField<RecentActivity[]>(
      data.recent_activities,
      []
    ).filter((activity) => activity?.id && activity?.title),
    sectionProgress: parseJsonField<SectionProgress[]>(
      data.section_progress,
      []
    ).filter(
      (progress) =>
        progress?.program && progress?.progress_percentage !== undefined
    ),
  };

  return result;
}
