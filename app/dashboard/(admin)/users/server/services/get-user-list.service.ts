import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { NormalizedUser } from "@/hooks/use-users";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createGetUserListService() {
  return new GetUserListService();
}

/**
 * @name GetUserListService
 * @description Service for fetching attendance reports from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new GetUserListService();
 */
class GetUserListService {
  private namespace = "users.fetch";

  /**
   * @name getUsers
   * Fetch all attendance reports for a user.
   */
  async getUsers(params: { client: SupabaseClient<Database>; userId: string }) {
    const logger = await getLogger();

    const { userId, client } = params;
    const ctx = { userId, name: this.namespace };

    logger.info(ctx, "Fetching user lists...");

    try {
      const { data, error } = await client.from("users").select("*");

      if (error) {
        logger.error(
          {
            ...ctx,
            error,
          },
          "Error fetching users"
        );

        throw new Error("Failed to fetch users");
      }

      logger.info(ctx, "Successfully fetched users");

      return data;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching users"
      );

      throw error;
    }
  }

  /**
   * @name getUserById
   * Fetch a user by ID for a user
   */
  async getUserById(params: {
    client: SupabaseClient<Database>;
    userId: string;
    accountId: string;
  }): Promise<NormalizedUser | null> {
    const logger = await getLogger();
    const { client, userId, accountId } = params;

    const ctx = {
      userId,
      accountId,
      name: `${this.namespace}ById`,
    };

    logger.info(ctx, "Fetching user by ID...");

    try {
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

        logger.error({ ...ctx, userError }, "Error fetching user by ID");
        throw new Error("Failed to fetch user");
      }

      if (user.role === "admin") {
        return {
          id: user.id,
          first_name: user.first_name,
          middle_name: user.middle_name ?? undefined,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          last_login: user.last_login,
          status: user.status,
          deleted_at: user.deleted_at,
        } as NormalizedUser;
      }

      if (user.role === "trainee") {
        const { data, error: traineeError } = await client
          .from("trainees")
          .select(`*, user:users (*)`)
          .eq("id", accountId)
          .single();

        if (traineeError) {
          if (traineeError.code === "PGRST116") {
            logger.warn(ctx, "Trainee not found");
            return null;
          }

          logger.error(
            { ...ctx, traineeError },
            "Error fetching trainee by ID"
          );
          throw new Error("Failed to fetch trainee");
        }

        return {
          id: data.user.id,
          first_name: data.user.first_name,
          middle_name: data.user.middle_name ?? undefined,
          last_name: data.user.last_name,
          email: data.user.email,
          role: data.user.role,
          created_at: data.user.created_at,
          last_login: data.user.last_login,
          student_id_number: data.student_id_number,
          course: data.course,
          section: data.section,
          address: data.address,
          mobile_number: data.mobile_number,
          status: data.user.status,
          deleted_at: data.user.deleted_at,
        } as NormalizedUser;
      }

      if (user.role === "coordinator") {
        const { data, error: coordinatorError } = await client
          .from("coordinators")
          .select(`*, user:users (*)`)
          .eq("id", accountId)
          .single();

        if (coordinatorError) {
          if (coordinatorError.code === "PGRST116") {
            logger.warn(ctx, "Coordinator not found");
            return null;
          }

          logger.error(
            { ...ctx, coordinatorError },
            "Error fetching coordinator by ID"
          );
          throw new Error("Failed to fetch coordinator");
        }

        return {
          id: data.user.id,
          first_name: data.user.first_name,
          middle_name: data.user.middle_name ?? undefined,
          last_name: data.user.last_name,
          email: data.user.email,
          role: data.user.role,
          created_at: data.user.created_at,
          last_login: data.user.last_login,
          department: data.department,
          status: data.user.status,
          deleted_at: data.user.deleted_at,
        } as NormalizedUser;
      }

      if (user.role === "supervisor") {
        const { data, error: supervisorError } = await client
          .from("supervisors")
          .select(`*, user:users (*)`)
          .eq("id", accountId)
          .single();

        if (supervisorError) {
          if (supervisorError.code === "PGRST116") {
            logger.warn(ctx, "Supervisor not found");
            return null;
          }

          logger.error(
            { ...ctx, supervisorError },
            "Error fetching supervisor by ID"
          );
          throw new Error("Failed to fetch supervisor");
        }

        return {
          id: data.user.id,
          first_name: data.user.first_name,
          middle_name: data.user.middle_name ?? undefined,
          last_name: data.user.last_name,
          email: data.user.email,
          role: data.user.role,
          created_at: data.user.created_at,
          last_login: data.user.last_login,
          position: data.position,
          department: data.department,
          company_name: data.company_name,
          company_address: data.company_address,
          company_contact_no: data.company_contact_no,
          telephone_number: data.telephone_number,
          status: data.user.status,
          deleted_at: data.user.deleted_at,
        } as NormalizedUser;
      }

      return null;
    } catch (error) {
      logger.error({ ...ctx, error }, "Unexpected error fetching user by ID");
      throw error;
    }
  }
}
