import { QueryClient, useQuery } from "@tanstack/react-query";

import { useSupabase } from "@/utils/supabase/hooks/use-supabase";
import { Database, Tables } from "@/utils/supabase/supabase.types";

export interface SectionDashboardData {
  totalTrainees: number;
  activeTrainees: number;
  completedTrainees: number;
  droppedTrainees: number;
  notStartedTrainees: number;

  totalRequirements: number;
  mandatoryRequirements: number;
  optionalRequirements: number;

  avgComplianceRate: number;

  totalInternshipForms: number;
  approvedInternshipForms: number;
  pendingInternshipForms: number;
  rejectedInternshipForms: number;

  totalCompanies: number;
  companies: {
    companyName: string;
    traineeCount: number;
  }[];

  jobRoles: string[];

  totalHoursLogged: number;
  avgHoursPerTrainee: number;
  completionPercentage: number;
  avgAttendanceRate: number;

  totalWeeklyReports: number;
  approvedWeeklyReports: number;
  pendingWeeklyReports: number;
  rejectedWeeklyReports: number;

  weeklyReportStatistics: Array<{
    week: string;
    week_number: number;
    start_date: string;
    end_date: string | null;
    approved: number;
    pending: number;
    rejected: number;
    total: number;
  }>;

  recentActivities: RecentActivity[];
}

// Safe default object factory
const createDefaultSectionDashboardData = (): SectionDashboardData => ({
  totalTrainees: 0,
  activeTrainees: 0,
  completedTrainees: 0,
  droppedTrainees: 0,
  notStartedTrainees: 0,

  totalRequirements: 0,
  mandatoryRequirements: 0,
  optionalRequirements: 0,

  avgComplianceRate: 0,

  totalInternshipForms: 0,
  approvedInternshipForms: 0,
  pendingInternshipForms: 0,
  rejectedInternshipForms: 0,

  totalCompanies: 0,
  companies: [],

  jobRoles: [],

  totalHoursLogged: 0,
  avgHoursPerTrainee: 0,
  completionPercentage: 0,
  avgAttendanceRate: 0,

  totalWeeklyReports: 0,
  approvedWeeklyReports: 0,
  pendingWeeklyReports: 0,
  rejectedWeeklyReports: 0,

  weeklyReportStatistics: [],
  recentActivities: [],
});

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "activity" | "attendance" | "document" | "announcement";
  activity_type: Database["public"]["Enums"]["activity_type_enum"];
  user_name: string;
}

export function useFetchSectionDashboard(slug: string) {
  const client = useSupabase();

  const queryFn = async (): Promise<SectionDashboardData> => {
    try {
      const response = await client.auth.getUser();

      if (response.error)
        throw new Error(`Authentication error: ${response.error.message}`);
      if (!response.data.user) throw new Error("No authenticated user found");

      const { data, error } = await client
        .from("program_batch_overview_dashboard")
        .select("*")
        .eq("batch_title", slug)
        .eq("coordinator_id", response.data.user.id)
        .single();

      if (error) throw new Error(`Database error: ${error.message}`);

      if (!data) return createDefaultSectionDashboardData();

      return transformTraineeDashboardData(data);
    } catch (error) {
      console.error("Error fetching section dashboard data:", error);
      return createDefaultSectionDashboardData();
    }
  };

  const queryKey = ["sectionDashboard", slug];

  return useQuery({
    queryKey,
    queryFn,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error.message?.includes("Authentication error")) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      errorMessage: "Failed to load dashboard data",
    },
  });
}

export async function prefetchSectionDashboard(
  queryClient: QueryClient,
  slug: string
) {
  const client = useSupabase();

  const queryFn = async (): Promise<SectionDashboardData> => {
    try {
      const response = await client.auth.getUser();

      if (response.error)
        throw new Error(`Authentication error: ${response.error.message}`);
      if (!response.data.user) throw new Error("No authenticated user found");

      const { data, error } = await client
        .from("program_batch_overview_dashboard")
        .select("*")
        .eq("batch_title", slug)
        .eq("coordinator_id", response.data.user.id)
        .single();

      if (error) throw new Error(`Database error: ${error.message}`);

      if (!data) return createDefaultSectionDashboardData();

      return transformTraineeDashboardData(data);
    } catch (error) {
      console.error("Error prefetching section dashboard data:", error);
      return createDefaultSectionDashboardData();
    }
  };

  const queryKey = ["sectionDashboard", slug];

  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000,
  });
}

function transformTraineeDashboardData(
  data: Tables<"program_batch_overview_dashboard">
): SectionDashboardData {
  // Safe JSON parser with comprehensive error handling
  const parseJsonField = <T>(field: unknown, fallback: T): T => {
    // Handle null/undefined
    if (field == null) return fallback;

    // Handle already parsed objects
    if (typeof field === "object" && !Array.isArray(field)) {
      return field as T;
    }

    // Handle arrays (some JSON fields might be arrays)
    if (Array.isArray(field)) {
      return field as T;
    }

    // Handle string JSON
    if (typeof field === "string") {
      // Handle empty strings
      if (field.trim() === "" || field === "null") {
        return fallback;
      }

      try {
        const parsed = JSON.parse(field);
        // Validate parsed data is the expected type
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

    // Fallback for any other type
    console.warn("Unexpected field type:", typeof field);
    return fallback;
  };

  // Parse JSON fields with safe defaults
  const jsonFields = {
    companies: parseJsonField<{ companyName: string; traineeCount: number }[]>(
      data.top_companies,
      []
    ).filter((company) => company?.companyName && company?.traineeCount), // Filter out invalid entries
    recent_activities: parseJsonField<RecentActivity[]>(
      data.recent_activities,
      []
    ),
    job_role_distribution: parseJsonField<string[]>(
      data.job_role_distribution,
      []
    ),
    weekly_report_statistics: parseJsonField<
      {
        week: string;
        week_number: number;
        start_date: string;
        end_date: string | null;
        approved: number;
        pending: number;
        rejected: number;
        total: number;
      }[]
    >(data.weekly_report_statistics, []),
  };

  // Safe number parsing with defaults
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

  // Calculate progress and metrics with safe math
  const totalTrainees = safeNumber(data.total_enrolled_trainees);
  const activeTrainees = safeNumber(data.active_trainees);
  const completedTrainees = safeNumber(data.completed_trainees);
  const notStartedTrainees = safeNumber(data.not_started_trainees);
  const droppedTrainees = safeNumber(data.dropped_trainees);

  const totalRequirements = safeNumber(data.total_requirements);
  const mandatoryRequirements = safeNumber(data.mandatory_requirements);
  const optionalRequirements = safeNumber(data.optional_requirements);

  const totalInternshipForms = safeNumber(data.total_internships);
  const pendingInternshipForms = safeNumber(data.pending_internships);
  const approvedInternshipForms = safeNumber(data.approved_internships);
  const rejectedInternshipForms = safeNumber(data.rejected_internships);

  const totalCompanies = safeNumber(data.total_companies);

  const totalWeeklyReports = safeNumber(data.total_weekly_reports);
  const approvedWeeklyReports = safeNumber(data.approved_weekly_reports);
  const pendingWeeklyReports = safeNumber(data.pending_weekly_reports);
  const rejectedWeeklyReports = safeNumber(data.rejected_weekly_reports);

  const totalHoursLogged = safeNumber(data.total_hours_logged);

  return {
    totalTrainees,
    activeTrainees,
    completedTrainees,
    notStartedTrainees,
    droppedTrainees,

    totalRequirements,
    mandatoryRequirements,
    optionalRequirements,

    avgComplianceRate: Math.min(100, safeNumber(data.avg_compliance_rate)),

    totalInternshipForms,
    approvedInternshipForms,
    pendingInternshipForms,
    rejectedInternshipForms,

    totalCompanies,
    companies: jsonFields.companies,

    jobRoles: jsonFields.job_role_distribution,

    totalHoursLogged,
    avgHoursPerTrainee: safeNumber(data.avg_hours_per_trainee),
    completionPercentage: Math.min(100, safeNumber(data.completion_percentage)),

    avgAttendanceRate: safeNumber(data.avg_attendance_rate),
    totalWeeklyReports,
    approvedWeeklyReports,
    pendingWeeklyReports,
    rejectedWeeklyReports,

    weeklyReportStatistics: jsonFields.weekly_report_statistics,
    recentActivities: jsonFields.recent_activities,
  };
}
