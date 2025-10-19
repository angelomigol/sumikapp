import { format, isSameDay, isValid } from "date-fns";

import {
  CalendarEvent,
  EventColor,
} from "@/schemas/event-calendar/event-calendar.schema";
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

/**
 * Calculate total hours worked based on time in, time out, and lunch break.
 * Matches the database calculation logic to ensure consistency.
 *
 * @param timeIn - Time in format "HH:MM"
 * @param timeOut - Time out format "HH:MM"
 * @param lunchBreakMinutes - Lunch break duration in minutes (default: 0)
 * @returns Total hours worked, rounded to 2 decimal places
 */
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

  // Convert to hours and round to 2 decimal places (matches database ROUND(calculated_hours, 2))
  const totalHours = totalMinutesAfterBreak / 60;

  // Round to 2 decimal places to match PostgreSQL ROUND() function
  return Math.round(totalHours * 100) / 100;
}

/**
 * Format decimal hours into a human-readable string.
 * Converts decimal hours to "X hrs Y mins" format.
 *
 * @param hours - Total hours as a decimal number (e.g., 5.65)
 * @returns Formatted string (e.g., "5 hrs 39 mins" or "8 hrs")
 *
 * @example
 * formatHoursDisplay(5.65) // "5 hrs 39 mins"
 * formatHoursDisplay(8) // "8 hrs"
 * formatHoursDisplay(0.5) // "30 mins"
 * formatHoursDisplay(0) // "0 hrs"
 */
export function formatHoursDisplay(hours: number): string {
  if (hours === 0) return "0 hrs";

  // Extract whole hours and remaining minutes
  const wholeHours = Math.floor(hours);
  const decimalPart = hours - wholeHours;
  const minutes = Math.round(decimalPart * 60);

  // Handle edge case where rounding brings minutes to 60
  if (minutes === 60) {
    return `${wholeHours + 1} hrs`;
  }

  // Format based on hours and minutes
  if (wholeHours === 0) {
    return `${minutes} mins`;
  } else if (minutes === 0) {
    return `${wholeHours} hrs`;
  } else {
    return `${wholeHours} hrs ${minutes} mins`;
  }
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

/**
 * Get CSS classes for event colors
 */
export function getEventColorClasses(color?: EventColor | string): string {
  const eventColor = color || "sky";

  switch (eventColor) {
    case "sky":
      return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 dark:hover:bg-sky-400/20 dark:text-sky-200 shadow-sky-700/8";
    case "amber":
      return "bg-amber-200/50 hover:bg-amber-200/40 text-amber-950/80 dark:bg-amber-400/25 dark:hover:bg-amber-400/20 dark:text-amber-200 shadow-amber-700/8";
    case "violet":
      return "bg-violet-200/50 hover:bg-violet-200/40 text-violet-950/80 dark:bg-violet-400/25 dark:hover:bg-violet-400/20 dark:text-violet-200 shadow-violet-700/8";
    case "rose":
      return "bg-rose-200/50 hover:bg-rose-200/40 text-rose-950/80 dark:bg-rose-400/25 dark:hover:bg-rose-400/20 dark:text-rose-200 shadow-rose-700/8";
    case "emerald":
      return "bg-emerald-200/50 hover:bg-emerald-200/40 text-emerald-950/80 dark:bg-emerald-400/25 dark:hover:bg-emerald-400/20 dark:text-emerald-200 shadow-emerald-700/8";
    case "orange":
      return "bg-orange-200/50 hover:bg-orange-200/40 text-orange-950/80 dark:bg-orange-400/25 dark:hover:bg-orange-400/20 dark:text-orange-200 shadow-orange-700/8";
    default:
      return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 dark:hover:bg-sky-400/20 dark:text-sky-200 shadow-sky-700/8";
  }
}

/**
 * Get CSS classes for border radius based on event position in multi-day events
 */
export function getBorderRadiusClasses(
  isFirstDay: boolean,
  isLastDay: boolean
): string {
  if (isFirstDay && isLastDay) {
    return "rounded";
  } else if (isFirstDay) {
    return "rounded-l rounded-r-none";
  } else if (isLastDay) {
    return "rounded-r rounded-l-none";
  } else {
    return "rounded-none";
  }
}

/**
 * Check if an event is a multi-day event
 */
export function isMultiDayEvent(event: CalendarEvent): boolean {
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);
  return event.allDay || eventStart.getDate() !== eventEnd.getDate();
}

/**
 * Filter events for a specific day
 */
export function getEventsForDay(
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  return events
    .filter((event) => {
      const eventStart = new Date(event.start);
      return isSameDay(day, eventStart);
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/**
 * Sort events with multi-day events first, then by start time
 */
export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const aIsMultiDay = isMultiDayEvent(a);
    const bIsMultiDay = isMultiDayEvent(b);

    if (aIsMultiDay && !bIsMultiDay) return -1;
    if (!aIsMultiDay && bIsMultiDay) return 1;

    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
}

/**
 * Get multi-day events that span across a specific day (but don't start on that day)
 */
export function getSpanningEventsForDay(
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  return events.filter((event) => {
    if (!isMultiDayEvent(event)) return false;

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Only include if it's not the start day but is either the end day or a middle day
    return (
      !isSameDay(day, eventStart) &&
      (isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd))
    );
  });
}

/**
 * Get all events visible on a specific day (starting, ending, or spanning)
 */
export function getAllEventsForDay(
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  return events.filter((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    return (
      isSameDay(day, eventStart) ||
      isSameDay(day, eventEnd) ||
      (day > eventStart && day < eventEnd)
    );
  });
}

/**
 * Get all events for a day (for agenda view)
 */
export function getAgendaEventsForDay(
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  return events
    .filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        isSameDay(day, eventStart) ||
        isSameDay(day, eventEnd) ||
        (day > eventStart && day < eventEnd)
      );
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/**
 * Add hours to a date
 */
export function addHoursToDate(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}
