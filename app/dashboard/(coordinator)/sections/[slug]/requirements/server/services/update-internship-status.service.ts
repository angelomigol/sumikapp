import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createUpdateInternshipStatusService() {
  return new UpdateInternshipStatusService();
}

/**
 * @name UpdateInternshipStatusService
 * @description Service for submitting attendance report to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new UpdateInternshipStatusService();
 */
class UpdateInternshipStatusService {
  private namespace = "internship_details.update";

  /**
   * @name findOrCreateSupervisor
   * @description Find existing supervisor or create new one based on email
   */
  private async findOrCreateSupervisor(params: {
    adminClient: SupabaseClient<Database>;
    client: SupabaseClient<Database>;
    email: string;
  }): Promise<string | null> {
    const logger = await getLogger();
    const { client, email, adminClient } = params;

    try {
      // First, check if user exists with this email
      const { data: existingUser, error: userError } = await client
        .from("users")
        .select("id, role, status")
        .eq("email", email)
        .single();

      if (userError && userError.code !== "PGRST116") {
        // PGRST116 = no rows returned
        logger.error(
          {
            email,
            error: userError,
          },
          "Error checking for existing user"
        );
        return null;
      }

      let supervisorId: string;

      if (existingUser) {
        if (existingUser.role === "supervisor") {
          supervisorId = existingUser.id;
          logger.info(
            {
              email,
              supervisorId,
            },
            "Found existing supervisor"
          );
        } else {
          logger.warn(
            {
              email,
              role: existingUser.role,
            },
            "User exists but is not a supervisor"
          );
          return null;
        }
      } else {
        // Create new auth user
        const { data: authData, error: authError } =
          await adminClient.auth.admin.createUser({
            email,
            password: Math.random().toString(36).slice(-8),
            email_confirm: true,
          });

        // FIX: Handle auth error properly
        if (authError || !authData?.user) {
          // Check if user already exists in Auth
          if (authError?.message?.includes("already registered")) {
            logger.warn(
              {
                email,
                errorMessage: authError.message,
              },
              "User already exists in Auth but not in users table"
            );
            
            // Try to get the existing auth user
            const { data: existingAuthUsers } = await adminClient.auth.admin.listUsers();
            const existingAuthUser = existingAuthUsers?.users?.find(u => u.email === email);
            
            if (existingAuthUser) {
              // Create user record with existing auth ID
              const { data: newUser, error: createUserError } = await client
                .from("users")
                .insert({
                  id: existingAuthUser.id,
                  email,
                  first_name: "",
                  last_name: "",
                  role: "supervisor",
                  status: "pending",
                })
                .select("id")
                .single();

              if (createUserError || !newUser) {
                logger.error(
                  {
                    email,
                    error: createUserError,
                  },
                  "Failed to create supervisor user record for existing auth user"
                );
                return null;
              }

              supervisorId = newUser.id;

              // Create supervisor profile
              const { error: supervisorError } = await client
                .from("supervisors")
                .insert({
                  id: supervisorId,
                });

              if (supervisorError) {
                logger.error(
                  {
                    email,
                    supervisorId,
                    error: supervisorError,
                  },
                  "Failed to create supervisor profile for existing auth user"
                );
                // Clean up the user record
                await client.from("users").delete().eq("id", supervisorId);
                return null;
              }

              logger.info({ email, supervisorId }, "Created user record for existing auth user");
              return supervisorId;
            }
          }

          logger.error(
            {
              email,
              supabaseError: {
                code: authError?.code,
                message: authError?.message,
              },
            },
            `Failed to create auth user: ${authError?.message || "Unknown error"}`
          );
          return null;
        }

        // Create user record
        const { data: newUser, error: createUserError } = await client
          .from("users")
          .insert({
            id: authData.user.id,
            email,
            first_name: "",
            last_name: "",
            role: "supervisor",
            status: "pending",
          })
          .select("id")
          .single();

        if (createUserError || !newUser) {
          logger.error(
            {
              email,
              error: createUserError,
            },
            "Failed to create supervisor user"
          );
          // Clean up the auth user
          await adminClient.auth.admin.deleteUser(authData.user.id);
          return null;
        }

        supervisorId = newUser.id;

        // Create supervisor profile
        const { error: supervisorError } = await client
          .from("supervisors")
          .insert({
            id: supervisorId,
          });

        if (supervisorError) {
          logger.error(
            {
              email,
              supervisorId,
              error: supervisorError,
            },
            "Failed to create supervisor profile"
          );
          // Clean up both user record and auth user
          await client.from("users").delete().eq("id", supervisorId);
          await adminClient.auth.admin.deleteUser(authData.user.id);
          return null;
        }

        logger.info({ email, supervisorId }, "Created new supervisor account");
      }

      return supervisorId;
    } catch (error) {
      logger.error(
        { email, error },
        "Unexpected error in findOrCreateSupervisor"
      );
      return null;
    }
  }

  /**
   * @name approveForm
   * Approve the internship form of the trainee.
   */
  async approveForm(params: {
    adminClient: SupabaseClient<Database>;
    client: SupabaseClient<Database>;
    userId: string;
    internshipId: string;
  }) {
    const logger = await getLogger();

    const { userId, internshipId, client, adminClient } = params;
    const ctx = {
      userId,
      internshipId,
      name: `${this.namespace}.approve`,
    };

    logger.info(ctx, "Approving internship form...");

    try {
      const { data: internship, error: fetchError } = await client
        .from("internship_details")
        .select(
          `
          id,
          temp_email,
          enrollment_id,
          trainee_batch_enrollment!inner (
            trainee_id
          )
        `
        )
        .eq("id", internshipId)
        .single();

      if (fetchError) {
        logger.error(
          {
            ...ctx,
            error: fetchError,
          },
          "Failed to fetch internship form"
        );

        throw new Error(
          `Failed to fetch internship form: ${fetchError.message}`
        );
      }

      if (!internship) {
        logger.error(ctx, "Internship form not found");
        throw new Error("Internship form not found");
      }

      let supervisorId: string | null = null;
      if (internship.temp_email) {
        supervisorId = await this.findOrCreateSupervisor({
          adminClient,
          client,
          email: internship.temp_email,
        });

        if (!supervisorId) {
          logger.warn(
            {
              ...ctx,
              supervisorEmail: internship.temp_email,
            },
            "Failed to create/find supervisor during approval"
          );

          throw new Error(
            "Failed to create or validate supervisor account. Check logs for details."
          );
        }
      }

      const { error: updateError } = await client
        .from("internship_details")
        .update({
          status: "approved",
          supervisor_id: supervisorId,
          temp_email: null,
        })
        .eq("id", internship.id);

      if (updateError) {
        logger.error(
          {
            ...ctx,
            error: updateError,
          },
          "Failed to approve internship form"
        );

        throw new Error(
          `Failed to approve internship form: ${updateError.message}`
        );
      }

      const { error: ojtStatusError } = await client
        .from("trainee_batch_enrollment")
        .update({
          ojt_status: "active",
        })
        .eq("id", internship.enrollment_id);

      if (ojtStatusError) {
        logger.error(
          {
            ...ctx,
            error: ojtStatusError,
          },
          "Failed to update trainee OJT status"
        );

        throw new Error(
          `Failed to update trainee OJT status: ${ojtStatusError.message}`
        );
      }

      logger.info(ctx, "Successfully approved trainee internship form");

      return {
        success: true,
        internshipId,
        status: "approved",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error approving trainee internship form"
      );

      throw error;
    }
  }

  /**
   * @name rejectForm
   * Reject the internship form of the trainee.
   */
  async rejectForm(params: {
    client: SupabaseClient<Database>;
    userId: string;
    internshipId: string;
    feedback?: string;
  }) {
    const logger = await getLogger();

    const { userId, internshipId, feedback, client } = params;
    const ctx = {
      userId,
      internshipId,
      name: `${this.namespace}.reject`,
    };

    logger.info(ctx, "Rejecting trainee internship form...");

    try {
      const { data: internship, error: fetchError } = await client
        .from("internship_details")
        .select("id")
        .eq("id", internshipId)
        .single();

      if (fetchError) {
        logger.error(
          {
            ...ctx,
            error: fetchError,
          },
          "Failed to fetch internship form"
        );

        throw new Error(
          `Failed to fetch internship form: ${fetchError.message}`
        );
      }

      if (!internship) {
        logger.error(ctx, "Internship form not found");
        throw new Error("Internship form not found");
      }

      const { error: updateError } = await client
        .from("internship_details")
        .update({
          status: "rejected",
          feedback: feedback,
        })
        .eq("id", internship.id);

      if (updateError) {
        logger.error(
          {
            ...ctx,
            error: updateError,
          },
          "Failed to reject internship form"
        );

        throw new Error(
          `Failed to reject internship form: ${updateError.message}`
        );
      }

      logger.info(ctx, "Successfully rejected trainee internship form");

      return {
        success: true,
        internshipId,
        status: "rejected",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error rejecting trainee internship form"
      );

      throw error;
    }
  }
}