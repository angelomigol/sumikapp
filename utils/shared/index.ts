import { format, isValid } from "date-fns";

import { AttendanceEntry } from "@/hooks/use-attendance-reports";

import { WeeklyReportEntry } from "@/schemas/weekly-report/weekly-report.schema";

/**
 * @name formatDatePH
 * @description
 * Formats a given `Date` or `string` into a localized short date and time string
 * based on Philippine settings (`en-PH` locale, `Asia/Manila` timezone).
 *
 * Example output: "Jul 24, 2025, 11:30 PM"
 *
 * @param date - The date to format (can be a Date object or ISO string)
 * @returns A formatted date string in Philippine locale and timezone
 */
export function formatDatePH(date?: Date | string): string {
  if (!date) return "N/A";

  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return parsedDate.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  });
}

type NameData = {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email?: string;
};

type PersonalAccountData = {
  data?: NameData;
};

/**
 * @name getDisplayName
 * @description
 * Generates a display name from available name fields.
 * Tries:
 * 1. personalAccountData.data (first, middle, last)
 * 2. account (first, middle, last)
 * 3. user (first, middle, last, email)
 * 4. fallback: empty string
 *
 * @param personalAccountData - Optional deeply nested user info
 * @param account - Optional flat account object
 * @param user - Optional user object, may contain names or fallback email
 * @returns A clean full name string or email fallback
 */
export function getDisplayName(
  personalAccountData?: PersonalAccountData,
  account?: NameData,
  user?: NameData
): string {
  const tryBuildName = (source?: NameData): string =>
    [source?.first_name, source?.middle_name, source?.last_name]
      .filter(Boolean)
      .join(" ");

  const fullName =
    tryBuildName(personalAccountData?.data) ||
    tryBuildName(account) ||
    tryBuildName(user);

  return fullName || user?.email || "";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0B";
  const sizes = ["B", "kB", "mB", "gB", "tB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(1)} ${sizes[i]}`;
}

export function formatStatValue(
  value: number,
  type: "number" | "percentage" = "number"
): string {
  if (type === "percentage") {
    return `${value}%`;
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toString();
}

export function formatTrendValue(value: number): {
  text: string;
  isPositive: boolean;
} {
  const isPositive = value >= 0;
  const text = `${isPositive ? "+" : ""}${value}%`;

  return { text, isPositive };
}

export function toLocaleTimeOnly(time: string) {
  const today = new Date().toISOString().split("T")[0];
  return new Date(`${today}T${time}`).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function safeFormatDate(
  dateValue: string,
  formatString: string
): string {
  if (!dateValue) return "N/A";

  try {
    const date = new Date(dateValue);

    if (!isValid(date)) {
      return "Invalid date";
    }

    return format(date, formatString);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
}

export function sanitizeText(str: string | null | undefined) {
  if (!str) return "";
  return str.replace(/\s+/g, " ").trim();
}

export const formatTimestamp = (timestamp: unknown) => {
  const date =
    timestamp instanceof Date ? timestamp : new Date(timestamp as string);

  if (isNaN(date.getTime())) return "Invalid date";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

/**
 * Advanced slug cleaner with configurable options
 * @param slug - The URL slug to clean
 * @param options - Configuration options for cleaning
 * @returns The cleaned slug according to specified options
 */

export function cleanSlugAdvanced(
  slug: string,
  options: {
    readonly preserveOriginal?: boolean;
    readonly customSeparators?: readonly string[];
    readonly removeSpecialChars?: boolean;
  } = {}
): string {
  if (!slug || typeof slug !== "string") {
    return "";
  }

  const {
    preserveOriginal = false,
    customSeparators = ["_", "-"],
    removeSpecialChars = false,
  } = options;

  try {
    let processed: string;

    if (preserveOriginal) {
      // Only replace %20 with spaces, keep everything else as-is
      processed = slug.replace(/%20/g, " ");
    } else {
      // Full URL decoding
      processed = decodeURIComponent(slug);

      // Replace custom separators with spaces
      const separatorRegex = new RegExp(`[${customSeparators.join("")}]+`, "g");
      processed = processed.replace(separatorRegex, " ");

      // Remove special characters if requested
      if (removeSpecialChars) {
        processed = processed.replace(/[^\w\s]/g, " ");
      }

      // Clean up whitespace
      processed = processed.replace(/\s+/g, " ").trim();

      // Convert to lowercase (since preserveCase was removed)
      processed = processed.toLowerCase();
    }

    return processed;
  } catch (error: unknown) {
    console.warn("Failed to process URL slug:", error);

    if (preserveOriginal) {
      // Fallback for preserveOriginal: only replace %20
      return slug.replace(/%20/g, " ");
    } else {
      // Original fallback behavior
      return slug.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
    }
  }
}

export function formatPhone(value: string) {
  // Keep only digits
  const digits = value.replace(/\D/g, "");

  // Example formatting for PH mobile (0917-123-4567)
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
}

export function createTableEntries(
  startDate: string,
  endDate: string,
  weeklyReportEntries: WeeklyReportEntry[] = [],
  reportId: string
): WeeklyReportEntry[] {
  if (!startDate || !endDate) return [];

  const dateEntries: WeeklyReportEntry[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];

    const existingEntry = weeklyReportEntries.find(
      (entry) => entry.entry_date === dateStr
    );

    if (existingEntry) {
      dateEntries.push({
        id: existingEntry.id || `temp-${dateStr}`,
        created_at: existingEntry.created_at || new Date().toISOString(),
        entry_date: existingEntry.entry_date,
        time_in: existingEntry.time_in,
        time_out: existingEntry.time_out,
        daily_accomplishments: existingEntry.daily_accomplishments,
        total_hours: existingEntry.total_hours,
        is_confirmed: existingEntry.is_confirmed || false,
        status: existingEntry.status,
        report_id: existingEntry.report_id || reportId,
        additional_notes: existingEntry.additional_notes,
        feedback: existingEntry.feedback,
      });
    } else {
      dateEntries.push({
        id: `temp-${dateStr}`,
        created_at: new Date().toISOString(),
        entry_date: dateStr,
        time_in: null,
        time_out: null,
        daily_accomplishments: null,
        total_hours: 0,
        is_confirmed: false,
        status: null,
        report_id: reportId,
        additional_notes: null,
        feedback: null,
      });
    }
  }

  return dateEntries;
}

export function createAttendanceTableEntries(
  startDate: string,
  endDate: string,
  weeklyReportEntries: AttendanceEntry[] = [],
  reportId: string
): AttendanceEntry[] {
  if (!startDate || !endDate) return [];

  const dateEntries: AttendanceEntry[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];

    const existingEntry = weeklyReportEntries.find(
      (entry) => entry.entry_date === dateStr
    );

    if (existingEntry) {
      dateEntries.push({
        id: existingEntry.id || `temp-${dateStr}`,
        created_at: existingEntry.created_at || new Date().toISOString(),
        entry_date: existingEntry.entry_date,
        time_in: existingEntry.time_in,
        time_out: existingEntry.time_out,
        total_hours: existingEntry.total_hours,
        is_confirmed: existingEntry.is_confirmed || false,
        status: existingEntry.status,
        report_id: existingEntry.report_id || reportId,
      });
    } else {
      dateEntries.push({
        id: `temp-${dateStr}`,
        created_at: new Date().toISOString(),
        entry_date: dateStr,
        time_in: null,
        time_out: null,
        total_hours: 0,
        is_confirmed: false,
        status: null,
        report_id: reportId,
      });
    }
  }

  return dateEntries;
}

export function calculateTotalHours(
  timeIn: string,
  timeOut: string,
  lunchBreakMinutes: number = 0
): number {
  if (!timeIn || !timeOut) return 0;

  const [inHours, inMinutes] = timeIn.split(":").map(Number);
  const [outHours, outMinutes] = timeOut.split(":").map(Number);

  const inTotalMinutes = inHours * 60 + inMinutes;
  const outTotalMinutes = outHours * 60 + outMinutes;

  const diffMinutes =
    outTotalMinutes >= inTotalMinutes
      ? outTotalMinutes - inTotalMinutes
      : 24 * 60 - inTotalMinutes + outTotalMinutes;

  // Deduct lunch break
  const totalMinutesAfterBreak = Math.max(0, diffMinutes - lunchBreakMinutes);

  return Math.round(totalMinutesAfterBreak / 60);
}

export function displayDays(days: string[] = []) {
  const dayMap: Record<string, string> = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday",
  };

  return days.map((d) => dayMap[d] || d).join(", ");
}
