import { useQuery } from "@tanstack/react-query";

import { useSupabase } from "@/utils/supabase/hooks/use-supabase";
import { Database, Tables } from "@/utils/supabase/supabase.types";
import { Role } from "@/lib/constants";

const queryKey = ["supabase:admin_overview_dashboard_view"];

export interface AdminDashboardData {
  totalTrainees: number;
  totalCoordinators: number;
  totalSupervisors: number;
  totalAdmins: number;
  totalIndustryPartners: number;
  recentActivities: RecentActivity[];
}

interface RecentActivity {
  id: string;
  type: "reports" | "documents" | "internship" | "batch" | "announcement" | "user" | "system" | "general";
  title: string;
  description: string | null;
  timestamp: string;
  activity_type: Database["public"]["Enums"]["activity_type_enum"];
  user_name: string | null;
  user_role: Role;
  program_batch_id: string | null;
  batch_title: string | null;
}

// Safe default object factory
const createDefaultAdminDashboardData = (): AdminDashboardData => ({
  totalTrainees: 0,
  totalCoordinators: 0,
  totalSupervisors: 0,
  totalAdmins: 0,
  totalIndustryPartners: 0,
  recentActivities: [],
});

export function useFetchAdminDashboard() {
  const client = useSupabase();

  const queryFn = async (): Promise<AdminDashboardData> => {
    try {
      const { data, error } = await client
        .from("admin_overview_dashboard")
        .select("*")
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        return createDefaultAdminDashboardData();
      }

      return transformAdminDashboardData(data);
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
      return createDefaultAdminDashboardData();
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
      // Retry up to 3 times for database errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Add meta for error handling
    meta: {
      errorMessage: "Failed to load admin dashboard data",
    },
  });
}

function transformAdminDashboardData(
  data: Tables<"admin_overview_dashboard">
): AdminDashboardData {
  // Safe JSON parser with comprehensive error handling
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

  const recentActivities = parseJsonField<RecentActivity[]>(
    data.recent_activities,
    []
  ).filter((activity) => activity?.id && activity?.title); // Filter out invalid entries

  const safeNumber = (value: unknown, fallback: number = 0): number => {
    if (typeof value === "number" && !isNaN(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  };

  return {
    totalTrainees: safeNumber(data.total_trainees),
    totalCoordinators: safeNumber(data.total_coordinators),
    totalSupervisors: safeNumber(data.total_supervisors),
    totalAdmins: safeNumber(data.total_admins),
    totalIndustryPartners: safeNumber(data.total_industry_partners),
    recentActivities,
  };
}