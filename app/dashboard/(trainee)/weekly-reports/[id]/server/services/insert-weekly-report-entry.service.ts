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
  private bucketName = "additional-attachments";

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

        const errorMessage =
          reportError instanceof Error
            ? reportError.message
            : "Failed to fetch weekly report";

        throw new Error(`Database error: ${errorMessage}`);
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
          status: data.status,
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

          `Supabase error while creating weekly report entry: ${entryError.message}`
        );

        throw new Error("Failed to create weekly report entry");
      }

      logger.info(ctx, "Successfully created weekly report entry");

      return {
        success: true,
        data: { id: entryData.id },
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
   * @name uploadAttachments
   * Upload attachments for the specific entry.
   */
  async uploadAttachments(params: {
    server: SupabaseClient<Database>;
    userId: string;
    entryId: string;
    reportId: string;
    files: File[];
  }) {
    const logger = await getLogger();

    const { userId, server, entryId, reportId, files } = params;
    const ctx = {
      name: "entry_files.upload",
      userId,
      entryId,
      fileCount: files.length,
    };

    logger.info(ctx, `Processing ${files.length} file(s)...`);

    for (const file of files) {
      // Check if file is valid
      if (!file || file.size === 0) {
        logger.warn(
          {
            ...ctx,
            fileName: file?.name || "unknown",
          },

          "Skipping invalid or empty file"
        );
        continue;
      }

      try {
        const filePath = `${reportId}/${entryId}/${file.name}`;

        logger.info(
          {
            ...ctx,
            fileName: file.name,
            fileSize: file.size,
          },

          "Uploading file to storage..."
        );

        // Upload to storage
        const { data: uploadData, error: uploadError } = await server.storage
          .from(this.bucketName)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          logger.error(
            {
              ...ctx,
              error: uploadError,
              fileName: file.name,
            },

            "Failed to upload file to storage"
          );
          continue;
        }

        logger.info(
          {
            ...ctx,
            fileName: file.name,
            filePath: uploadData.path,
          },

          "File uploaded, saving metadata..."
        );

        // Save file metadata to database
        const { error: fileDbError } = await server
          .from("weekly_report_entry_files")
          .insert({
            entry_id: entryId,
            file_name: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            file_type: file.type,
          });

        if (fileDbError) {
          logger.error(
            {
              ...ctx,
              error: fileDbError,
              fileName: file.name,
            },

            "Failed to save file metadata"
          );

          // Cleanup: remove uploaded file
          await server.storage.from(this.bucketName).remove([uploadData.path]);
          continue;
        }

        logger.info(
          {
            ...ctx,
            fileName: file.name,
          },

          "Successfully uploaded file"
        );
      } catch (error) {
        logger.error(
          {
            ...ctx,
            error,
            fileName: file.name,
          },

          "Error processing file"
        );
      }
    }

    logger.info(ctx, "File upload process completed");

    return {
      success: true,
      message: "Files uploaded successfully",
    };
  }
}
