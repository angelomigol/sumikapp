import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createDeleteUserService() {
  return new DeleteUserService();
}

/**
 * @name DeleteUserService
 * @description Service for deleting section to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new DeleteUserService();
 */
class DeleteUserService {
  private namespace = "user.delete";

  /**
   * @name deleteUser
   * Deletes a user.
   */
  async deleteUser(params: {
    adminClient: SupabaseClient<Database>;
    client: SupabaseClient<Database>;
    userId: string;
    accountId: string;
  }) {
    const logger = await getLogger();

    const { userId, accountId, client, adminClient } = params;
    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Deleting account...");

    try {
      const { error: authError } = await adminClient.auth.admin.deleteUser(
        accountId,
        true
      );

      if (authError) {
        if (authError.code === "PGRST116") {
          logger.warn(ctx, "User not found");
          return null;
        }

        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: authError.code,
              message: authError.message,
            },
          },

          `Supabase error while deleting account from auth table: ${authError.message}`
        );

        throw new Error("Failed to delete user");
      }

      const { data: user, error: userError } = await client
        .from("users")
        .select("*")
        .eq("id", accountId)
        .single();

      if (userError) {
        if (userError.code === "PGRST116") {
          logger.warn(ctx, "User not found");
          return null;
        }

        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: userError.code,
              message: userError.message,
              hint: userError.hint,
              details: userError.details,
            },
          },

          `Supabase error while fetching account: ${userError.message}`
        );

        throw new Error("Failed to fetch user");
      }

      const { error } = await client
        .from("users")
        .update({ deleted_at: new Date().toISOString(), status: "inactive" })
        .eq("id", user.id);

      if (error) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: error.code,
              message: error.message,
              hint: error.hint,
              details: error.details,
            },
          },

          `Supabase error while deleting account: ${error.message}`
        );

        throw new Error("Failed to delete account");
      }

      logger.info(ctx, "Account successfully deleted");

      return {
        success: true,
        message: "Account successfully deleted",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error deleting account"
      );

      throw error;
    }
  }
}
