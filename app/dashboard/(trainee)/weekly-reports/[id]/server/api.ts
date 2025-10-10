import { SupabaseClient } from "@supabase/supabase-js";

import { Database } from "@/utils/supabase/supabase.types";

/**
 * Class representing the API for interacting with weekly reports.
 * @constructor
 * @param {SupabaseClient<Database>} client - The Supabase client client instance.
 */
class WeeklyReportDetailsApi {
  constructor(private readonly client: SupabaseClient<Database>) {}

  /**
   * @name deleteReport
   * @description Delete the weekly report for the given ID.
   * @param id
   */
  async deleteReport(id: string) {
    const { data, error } = await this.client
      .from("weekly_reports")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return data;
  }
}

export function createWeeklyReportDetailsApi(client: SupabaseClient<Database>) {
  return new WeeklyReportDetailsApi(client);
}
