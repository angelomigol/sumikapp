import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database, TablesInsert } from "@/utils/supabase/supabase.types";

export function createInsertAttendanceEntryService() {
  return new InsertAttendanceEntryService();
}

/**
 * @name InsertAttendanceEntryService
 * @description Service for inserting attendance entry to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new InsertAttendanceEntryService();
 */
class InsertAttendanceEntryService {
  private namespace = "attendance_entry.create";

  /**
   * @name insertEntry
   * Insert an attendance entry for a user.
   */
  async insertEntry(params: {
    client: SupabaseClient<Database>;
    userId: string;
    reportId: string;
    data: TablesInsert<"attendance_entries">;
  }) {
    const logger = await getLogger();

    const { userId, data, reportId, client } = params;
    const ctx = {
      date: data.entry_date,
      timeIn: data.time_in,
      timeOut: data.time_out,
      reportId,
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Creating attendance entry for user...");

    try {
      const { error: reportError } = await client
        .from("attendance_reports")
        .select("id")
        .eq("id", reportId)
        .limit(1)
        .single();

      if (reportError) {
        if (reportError.code === "PGRST116") {
          logger.warn(ctx, "Attendance report not found or access denied");
          return null;
        }

        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: reportError.code,
              message: reportError.message,
              hint: reportError.hint,
              details: reportError.details,
            },
          },
          "Supabase error while fetching attendance report"
        );

        throw new Error(`Supabase error: ${reportError.message}`);
      }

      const { data: entryData, error: entryError } = await client
        .from("attendance_entries")
        .insert({
          entry_date: data.entry_date,
          time_in: data.time_in,
          time_out: data.time_out,
          total_hours: data.total_hours,
          status: data.status || null,
          is_confirmed: data.is_confirmed || true,
          report_id: reportId,
        })
        .select("*")
        .single();

      if (entryError) {
        logger.error(
          {
            ...ctx,
            entryError,
          },
          "Error creating attendance entry"
        );

        throw new Error("Failed to create attendance entry");
      }

      logger.info(ctx, "Successfully created attendance entry");

      await this.updateTotalHours({ client, userId, reportId });

      return {
        success: true,
        data: entryData,
        message: "Successfully created attendance report",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error creating attendance entry"
      );

      throw error;
    }
  }

  /**
   * @name updateTotalHours
   * Update the total hours an attendance report for a user.
   */
  async updateTotalHours(params: {
    client: SupabaseClient<Database>;
    userId: string;
    reportId: string;
  }) {
    const logger = await getLogger();

    const { userId, reportId, client } = params;

    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Updating attendance report total hours...");

    try {
      const { data: entries, error: entriesError } = await client
        .from("attendance_entries")
        .select("total_hours")
        .eq("report_id", reportId);

      if (entriesError) {
        if (entriesError.code === "PGRST116") {
          logger.warn(ctx, "Attendance entry not found or access denied");
          return null;
        }

        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: entriesError.code,
              message: entriesError.message,
              hint: entriesError.hint,
              details: entriesError.details,
            },
          },
          "Supabase error while fetching attendance entry"
        );

        throw new Error(`Supabase error: ${entriesError.message}`);
      }

      const periodTotal =
        entries?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;

      const { data: currentReport, error: reportError } = await client
        .from("attendance_reports")
        .select("previous_total")
        .eq("id", reportId)
        .single();

      if (reportError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: reportError.code,
              message: reportError.message,
              hint: reportError.hint,
              details: reportError.details,
            },
          },
          "Supabase error while fetching attendance report"
        );

        throw new Error(`Supabase error: ${reportError.message}`);
      }

      const totalHoursServed =
        (currentReport.previous_total || 0) + periodTotal;

      const { error: updateError } = await client
        .from("attendance_reports")
        .update({
          period_total: periodTotal,
          total_hours_served: totalHoursServed,
        })
        .eq("id", reportId);

      if (updateError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: updateError.code,
              message: updateError.message,
              hint: updateError.hint,
              details: updateError.details,
            },
          },
          "Supabase error while updating attendance report total hours"
        );

        throw new Error(`Supabase error: ${updateError.message}`);
      }

      return {
        period_total: periodTotal,
        total_hours_served: totalHoursServed,
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error updating attendance report total hours"
      );

      throw error;
    }
  }
}
