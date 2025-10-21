import { useQuery } from "@tanstack/react-query";

import { DocumentStatus, EntryStatus, OJTStatus } from "@/lib/constants";

import { useSupabase } from "@/utils/supabase/hooks/use-supabase";
import { Database, Tables } from "@/utils/supabase/supabase.types";

const queryKey = ["supabase:trainee_overview_dashboard_view"];

export interface TraineeDashboardData {
  ojtStatus: OJTStatus;

  hours: {
    total: number;
    required: number;
  };

  attendanceRatePercentage: number;
  totalSubmittedReports: number;

  approvedWeeklyReports: number;
  rejectedWeeklyReports: number;
  pendingWeeklyReports: number;
  totalWeeklyReports: number;

  attendance: {
    recentEntries: AttendanceEntry[];
    weeklyChart: WeeklyAttendanceData[];
  };

  recentActivities: RecentActivity[];
  announcements: Announcement[];
  recentReports: RecentReport[];
}

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "activity" | "attendance" | "document" | "announcement";
  activity_type: Database["public"]["Enums"]["activity_type_enum"];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface AttendanceEntry {
  date: string;
  status: EntryStatus;
  hours: number;
  time_in: string | null;
  time_out: string | null;
}

export interface WeeklyAttendanceData {
  day: string;
  hours: number;
  status: string;
  date: string;
}

interface RecentReport {
  id: string;
  start_date: string;
  end_date: string;
  status: DocumentStatus;
  submitted_at: string | null;
  total_hours: number;
}

// Safe default object factory
const createDefaultTraineeDashboardData = (): TraineeDashboardData => ({
  ojtStatus: "not started",

  hours: {
    total: 0,
    required: 0,
  },

  attendanceRatePercentage: 0,
  totalSubmittedReports: 0,

  approvedWeeklyReports: 0,
  rejectedWeeklyReports: 0,
  pendingWeeklyReports: 0,
  totalWeeklyReports: 0,

  attendance: {
    recentEntries: [],
    weeklyChart: [],
  },

  recentActivities: [],
  announcements: [],
  recentReports: [],
});

export function useFetchTraineeDashboard() {
  const client = useSupabase();

  const queryFn = async (): Promise<TraineeDashboardData> => {
    try {
      const response = await client.auth.getUser();

      if (response.error) {
        throw new Error(`Authentication error: ${response.error.message}`);
      }

      if (!response.data.user) {
        throw new Error("No authenticated user found");
      }

      const { data: enrollment, error: enrollmentError } = await client
        .from("trainee_batch_enrollment")
        .select("id")
        .eq("trainee_id", response.data.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (enrollmentError) {
        throw new Error(`Enrollment error: ${enrollmentError.message}`);
      }

      if (!enrollment) {
        throw new Error("This trainee is not enrolled in any batch");
      }

      const { data: internship, error: internshipError } = await client
        .from("internship_details")
        .select("id")
        .eq("enrollment_id", enrollment.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (internshipError) {
        throw new Error(`Internship error: ${internshipError.message}`);
      }

      if (!internship) {
        return createDefaultTraineeDashboardData();
      }

      const { data: traineeDB, error: traineeError } = await client
        .from("trainee_overview_dashboard")
        .select("*")
        .eq("internship_id", internship?.id)
        .maybeSingle();

      if (traineeError) {
        throw new Error(`Database error: ${traineeError.message}`);
      }

      if (!traineeDB) {
        return createDefaultTraineeDashboardData();
      }

      return transformTraineeDashboardData(traineeDB);
    } catch (error) {
      console.error("Error fetching trainee dashboard data:", error);

      return createDefaultTraineeDashboardData();
    }
  };

  return useQuery({
    queryKey,
    queryFn,
    networkMode: "online",
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
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
  data: Tables<"trainee_overview_dashboard">
): TraineeDashboardData {
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

  const jsonFields = {
    recentActivities: parseJsonField<RecentActivity[]>(
      data.recent_activities,
      []
    ).filter((activity) => activity?.id && activity?.title), // Filter out invalid entries

    announcements: parseJsonField<Announcement[]>(
      data.announcements,
      []
    ).filter((announcement) => announcement?.id && announcement?.title),

    recentAttendance: parseJsonField<AttendanceEntry[]>(
      data.recent_attendance,
      []
    ).filter((entry) => entry?.date), // Ensure valid entries

    weeklyAttendanceChart: parseJsonField<WeeklyAttendanceData[]>(
      data.weekly_attendance_chart,
      []
    ).filter((chart) => chart?.day && chart?.date),

    recentReports: parseJsonField<RecentReport[]>(
      data.recent_reports,
      []
    ).filter((report) => report?.id),
  };

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

  const totalHours = safeNumber(data.total_hours_logged);
  const requiredHours = safeNumber(data.required_hours);

  const ojtStatus: OJTStatus = (data.ojt_status as OJTStatus) || "not started";

  return {
    ojtStatus,

    // Hours & Progress with safe calculations
    hours: {
      total: totalHours,
      required: requiredHours,
    },

    // Attendance Rate with safe numbers
    attendanceRatePercentage: Math.min(
      100,
      safeNumber(data.attendance_rate_percentage)
    ),
    totalSubmittedReports: safeNumber(data.total_submitted_reports, 0),

    // Attendance with validated arrays
    attendance: {
      recentEntries: jsonFields.recentAttendance,
      weeklyChart: jsonFields.weeklyAttendanceChart,
    },

    approvedWeeklyReports: safeNumber(data.approved_weekly_reports, 0),
    rejectedWeeklyReports: safeNumber(data.rejected_weekly_reports, 0),
    pendingWeeklyReports: safeNumber(data.pending_weekly_reports, 0),
    totalWeeklyReports: safeNumber(data.total_weekly_reports, 0),

    // Activities & Reports with validated arrays
    recentActivities: jsonFields.recentActivities,
    announcements: jsonFields.announcements,
    recentReports: jsonFields.recentReports,
  };
}
