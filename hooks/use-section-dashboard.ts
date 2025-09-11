import { useQuery } from "@tanstack/react-query";

import { useSupabase } from "@/utils/supabase/hooks/use-supabase";
import { Tables } from "@/utils/supabase/supabase.types";

const queryKey = ["supabase:program_batch_overview_dashboard_view"];

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
  companies: Companies[];

  totalHoursLogged: number;
  avgHoursPerTrainee: number;
  completionPercentage: number;

  avgAttendanceRate: number;
  totalAttendanceReports: number;
  approvedAttendanceReports: number;
  pendingAttendanceReports: number;

  totalActivityReports: number;
  approvedActivityReports: number;
  pendingActivityeReports: number;
}

interface Companies {
  companyName: string;
  traineeCount: number;
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

  totalHoursLogged: 0,
  avgHoursPerTrainee: 0,
  completionPercentage: 0,

  avgAttendanceRate: 0,
  totalAttendanceReports: 0,
  approvedAttendanceReports: 0,
  pendingAttendanceReports: 0,

  totalActivityReports: 0,
  approvedActivityReports: 0,
  pendingActivityeReports: 0,
});

export function useFetchSectionDashboard(slug: string) {
  const client = useSupabase();

  const queryFn = async (): Promise<SectionDashboardData> => {
    try {
      const response = await client.auth.getUser();

      if (response.error) {
        throw new Error(`Authentication error: ${response.error.message}`);
      }

      if (!response.data.user) {
        throw new Error("No authenticated user found");
      }

      const { data, error } = await client
        .from("program_batch_overview_dashboard")
        .select("*")
        .eq("batch_title", slug)
        .eq("coordinator_id", response.data.user.id)
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        return createDefaultSectionDashboardData();
      }

      return transformTraineeDashboardData(data);
    } catch (error) {
      console.error("Error fetching trainee dashboard data:", error);

      return createDefaultSectionDashboardData();
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
    companies: parseJsonField<Companies[]>(data.top_companies, []).filter(
      (company) => company?.companyName && company?.traineeCount
    ), // Filter out invalid entries
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

  const totalAttendanceReports = safeNumber(data.total_attendance_reports);
  const approvedAttendanceReports = safeNumber(
    data.approved_attendance_reports
  );
  const pendingAttendanceReports = safeNumber(data.pending_attendance_reports);

  const totalActivityReports = safeNumber(data.total_accomplishment_reports);
  const totalHoursLogged = safeNumber(data.total_hours_logged);
  const approvedActivityReports = safeNumber(
    data.approved_accomplishment_reports
  );
  const pendingActivityeReports = safeNumber(
    data.pending_accomplishment_reports
  );

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

    totalHoursLogged,
    avgHoursPerTrainee: Math.min(100, safeNumber(data.avg_hours_per_trainee)),
    completionPercentage: Math.min(100, safeNumber(data.avg_compliance_rate)),

    avgAttendanceRate: Math.min(100, safeNumber(data.avg_attendance_rate)),
    totalAttendanceReports,
    approvedAttendanceReports,
    pendingAttendanceReports,

    totalActivityReports,
    approvedActivityReports,
    pendingActivityeReports,
  };
}
