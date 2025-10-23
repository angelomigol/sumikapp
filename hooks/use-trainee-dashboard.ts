import { SupabaseClient } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

import {
  DocumentStatus,
  EntryStatus,
  InternshipCode,
  OJTStatus,
  UserStatus,
} from "@/lib/constants";

import { useSupabase } from "@/utils/supabase/hooks/use-supabase";
import { Database, Tables } from "@/utils/supabase/supabase.types";

import { RequirementWithHistory } from "./use-batch-requirements";
import { TraineeFullDetails } from "./use-section-trainees";

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

  internships: TraineeFullDetails[];
}

interface Enrollments {
  id: string;
  ojt_status: OJTStatus;
  program_batch_id: string;
  program_batch: {
    id: string;
    title: string;
    internship_code: InternshipCode;
    required_hours: number;
    start_date: string;
    end_date: string;
  };
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
  internships: [],
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

      const userId = response.data.user.id;

      // Fetch ALL enrollments for this trainee (both CTNTERN1 and CTNTERN2)
      const { data: enrollments, error: enrollmentError } = await client
        .from("trainee_batch_enrollment")
        .select(
          `
          id,
          ojt_status,
          program_batch_id,
          program_batch!inner (
            id,
            title,
            internship_code,
            required_hours,
            start_date,
            end_date
          )
        `
        )
        .eq("trainee_id", userId)
        .order("created_at", { ascending: false });

      if (enrollmentError) {
        throw new Error(`Enrollment error: ${enrollmentError.message}`);
      }

      if (!enrollments || enrollments.length === 0) {
        throw new Error("This trainee is not enrolled in any batch");
      }

      // Get the most recent enrollment for main dashboard
      const primaryEnrollment = enrollments[0];

      // Fetch internship for primary enrollment
      const { data: internship, error: internshipError } = await client
        .from("internship_details")
        .select("id")
        .eq("enrollment_id", primaryEnrollment.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (internshipError) {
        throw new Error(`Internship error: ${internshipError.message}`);
      }

      // Fetch main dashboard data
      let mainDashboardData: TraineeDashboardData =
        createDefaultTraineeDashboardData();

      if (internship) {
        const { data: traineeDB, error: traineeError } = await client
          .from("trainee_overview_dashboard")
          .select("*")
          .eq("internship_id", internship.id)
          .maybeSingle();

        if (traineeError) {
          throw new Error(`Database error: ${traineeError.message}`);
        }

        if (traineeDB) {
          mainDashboardData = transformTraineeDashboardData(traineeDB);
        }
      }

      const internshipsData = await fetchInternshipDetails(
        client,
        enrollments,
        userId
      );

      return {
        ...mainDashboardData,
        internships: internshipsData,
      };
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes("Authentication error")) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      errorMessage: "Failed to load dashboard data",
    },
  });
}

async function fetchInternshipDetails(
  client: SupabaseClient<Database>,
  enrollments: Enrollments[],
  userId: string
): Promise<TraineeFullDetails[]> {
  const internshipsData: TraineeFullDetails[] = [];

  for (const enrollment of enrollments) {
    try {
      // Fetch internship details with the same structure as getTraineeById
      const { data: internshipData, error: internshipError } = await client
        .from("trainee_batch_enrollment")
        .select(
          `
          id,
          ojt_status,
          trainees!inner (
            id,
            student_id_number,
            course,
            section,
            users!inner (
              first_name,
              middle_name,
              last_name,
              email,
              status
            )
          ),
          program_batch (
            internship_code,
            required_hours,
            start_date,
            end_date
          ),
          requirements (
            id,
            file_name,
            file_path,
            file_type,
            file_size,
            submitted_at,
            batch_requirement_id,
            batch_requirements:batch_requirement_id (
              requirement_types:requirement_type_id (
                name,
                description
              )
            ),
            requirements_history (
              document_status,
              date
            )
          ),
          internship_details (
            job_role,
            company_name,
            start_date,
            end_date,
            weekly_reports (
              id,
              created_at,
              start_date,
              end_date,
              period_total,
              status,
              submitted_at,
              weekly_report_entries (*)
            )
          )
        `
        )
        .eq("id", enrollment.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // If no internship found, skip this enrollment
      if (internshipError || !internshipData) {
        console.warn(`No internship found for enrollment ${enrollment.id}`);
        continue;
      }

      // Fetch evaluation results
      const { data: emp_data } = await client
        .from("employability_predictions")
        .select("*")
        .eq("trainee_batch_enrollment_id", internshipData.id)
        .maybeSingle();

      const internshipDetails = internshipData.internship_details?.[0];

      const hours_logged =
        internshipDetails?.weekly_reports
          ?.filter((r) => r.status === "approved")
          .flatMap((r) => r.weekly_report_entries || [])
          .filter(
            (entry) => entry.status === "present" || entry.status === "late"
          )
          .reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;

      const trainee = internshipData.trainees;

      const processedRequirements = internshipData.requirements.map((req) => {
        const history = req.requirements_history || [];

        const latestHistoryEntry = history.reduce(
          (latest, current) => {
            if (!latest) return current;
            return new Date(current.date) > new Date(latest.date)
              ? current
              : latest;
          },
          null as (typeof history)[0] | null
        );

        const requirementType = req.batch_requirements?.requirement_types;

        return {
          id: req.id,
          requirement_name: requirementType?.name || "Unknown Requirement",
          requirement_description: requirementType?.description || null,
          file_name: req.file_name,
          file_path: req.file_path,
          file_type: req.file_type,
          file_size: Number(req.file_size),
          submitted_at: req.submitted_at,
          status: latestHistoryEntry?.document_status || "not submitted",
          history: history.map((h) => ({
            document_status: h.document_status,
            date: h.date,
          })),
        } as RequirementWithHistory;
      });
      internshipsData.push({
        trainee_id: trainee.id,
        student_id_number: trainee.student_id_number,
        course: trainee.course,
        section: trainee.section,
        first_name: trainee.users.first_name,
        middle_name: trainee.users.middle_name,
        last_name: trainee.users.last_name,
        email: trainee.users.email,
        hours_logged: hours_logged,
        ojt_status: internshipData.ojt_status,
        status: trainee.users.status,
        internship_details: {
          company_name: internshipDetails?.company_name,
          job_role: internshipDetails?.job_role,
          start_date: internshipDetails?.start_date,
          end_date: internshipDetails.end_date,
        },
        program_batch: {
          internship_code: internshipData.program_batch.internship_code,
          required_hours: internshipData.program_batch.required_hours,
          start_date: internshipData.program_batch.start_date,
          end_date: internshipData.program_batch.end_date,
        },
        weekly_reports: internshipDetails?.weekly_reports?.map(
          (report: any) => ({
            id: report.id,
            created_at: report.created_at,
            start_date: report.start_date,
            end_date: report.end_date,
            period_total: report.period_total,
            status: report.status,
            submitted_at: report.submitted_at,
          })
        ),
        submitted_requirements: processedRequirements,
        evaluation_results: emp_data
          ? {
              prediction_label: emp_data.prediction_label,
              prediction_probability: emp_data.prediction_probability,
              confidence_level: emp_data.confidence_level,
              prediction_date: emp_data.prediction_date,
              evaluation_scores: null,
              feature_scores: emp_data.feature_scores as Record<
                string,
                number
              > | null,
              recommendations: emp_data.recommendations as Record<
                string,
                number
              > | null,
              risk_factors: emp_data.risk_factors as Record<
                string,
                number
              > | null,
            }
          : null,
      });
    } catch (error) {
      console.error(
        `Error fetching internship for enrollment ${enrollment.id}:`,
        error
      );
      // Continue with next enrollment
      continue;
    }
  }

  return internshipsData;
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
    ).filter((activity) => activity?.id && activity?.title),

    announcements: parseJsonField<Announcement[]>(
      data.announcements,
      []
    ).filter((announcement) => announcement?.id && announcement?.title),

    recentAttendance: parseJsonField<AttendanceEntry[]>(
      data.recent_attendance,
      []
    ).filter((entry) => entry?.date),

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

    hours: {
      total: totalHours,
      required: requiredHours,
    },

    attendanceRatePercentage: Math.min(
      100,
      safeNumber(data.attendance_rate_percentage)
    ),
    totalSubmittedReports: safeNumber(data.total_submitted_reports, 0),

    attendance: {
      recentEntries: jsonFields.recentAttendance,
      weeklyChart: jsonFields.weeklyAttendanceChart,
    },

    approvedWeeklyReports: safeNumber(data.approved_weekly_reports, 0),
    rejectedWeeklyReports: safeNumber(data.rejected_weekly_reports, 0),
    pendingWeeklyReports: safeNumber(data.pending_weekly_reports, 0),
    totalWeeklyReports: safeNumber(data.total_weekly_reports, 0),

    recentActivities: jsonFields.recentActivities,
    announcements: jsonFields.announcements,
    recentReports: jsonFields.recentReports,
    internships: [], // Will be populated separately
  };
}
