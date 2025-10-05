import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database, TablesInsert } from "@/utils/supabase/supabase.types";

export function createInsertWeeklyReportEntryService() {
  return new InsertWeeklyReportEntryService();
}

/**
 * @name InsertWeeklyReportEntryService
 * @description Service for inserting weekly report entry to the database
 * @param Database - The Supabase database type to use
 * @example
 * const server = getSupabaseClient();
 * const service = new InsertWeeklyReportEntryService();
 */
class InsertWeeklyReportEntryService {
  private namespace = "daily_entry.create";

  /**
   * @name insertEntry
   * Insert an attendance entry for a user.
   */
  async insertEntry(params: {
    server: SupabaseClient<Database>;
    userId: string;
    data: TablesInsert<"weekly_report_entries">;
  }) {
    const logger = await getLogger();

    const { userId, server, data } = params;
    const ctx = {
      name: this.namespace,
      userId,
      date: data.entry_date,
    };

    logger.info(ctx, "Creating weekly report entry...");

    try {
      const { error: reportError } = await server
        .from("weekly_reports")
        .select("id")
        .eq("id", data.report_id)
        .limit(1)
        .single();

      if (reportError) {
        if (reportError.code === "PGRST116") {
          logger.warn(ctx, "Weekly report not found or access denied");
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

          "Supabase error while fetching weekly report"
        );

        throw new Error(`Supabase error: ${reportError.message}`);
      }

      const { data: entryData, error: entryError } = await server
        .from("weekly_report_entries")
        .insert({
          entry_date: data.entry_date,
          time_in: data.time_in,
          time_out: data.time_out,
          total_hours: data.total_hours,
          daily_accomplishments: data.daily_accomplishments,
          additional_notes: data.additional_notes,
          status: "present",
          is_confirmed: true,
          report_id: data.report_id,
        })
        .select("*")
        .single();

      if (entryError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: entryError.code,
              message: entryError.message,
              hint: entryError.hint,
              details: entryError.details,
            },
          },

          "Supabase error while creating weekly report entry"
        );

        throw new Error("Failed to create weekly report entry");
      }

      logger.info(ctx, "Successfully created weekly report entry");

      await this.updateTotalHours({ server, userId, reportId: data.report_id });

      return {
        success: true,
        data: entryData,
        message: "Successfully created weekly report entry",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error creating weekly report entry"
      );

      throw error;
    }
  }

  /**
   * @name updateTotalHours
   * Update the total hours of weekly report for a user.
   */
  async updateTotalHours(params: {
    server: SupabaseClient<Database>;
    userId: string;
    reportId: string;
  }) {
    const logger = await getLogger();

    const { userId, reportId, server } = params;

    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Updating attendance report total hours...");

    try {
      const { data: entries, error: entriesError } = await server
        .from("weekly_report_entries")
        .select("total_hours")
        .eq("report_id", reportId);

      if (entriesError) {
        if (entriesError.code === "PGRST116") {
          logger.warn(ctx, "Weekly report entries not found or access denied");
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

          "Supabase error while fetching weekly report entries"
        );

        throw new Error(`Supabase error: ${entriesError.message}`);
      }

      const periodTotal =
        entries?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;

      const { error: updateError } = await server
        .from("weekly_reports")
        .update({
          period_total: periodTotal,
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

          "Supabase error while updating weekly report total hours"
        );

        throw new Error(`Supabase error: ${updateError.message}`);
      }

      return periodTotal;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error updating weekly report total hours"
      );

      throw error;
    }
  }
}
