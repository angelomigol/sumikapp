import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database, TablesInsert } from "@/utils/supabase/supabase.types";

import { AddAccountFormValues } from "../../schema/add-account.schema";

export function createCreateUserService() {
  return new CreateUserService();
}

/**
 * @name CreateUserService
 * @description Service for deleting section to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new CreateUserService();
 */
class CreateUserService {
  private namespace = "user.create";

  /**
   * @name createUser
   * Creates a user with role-specific data.
   */
  async createUser(params: {
    client: SupabaseClient<Database>;
    adminClient: SupabaseClient<Database>;
    userData: AddAccountFormValues;
  }) {
    const logger = await getLogger();

    const { userData, adminClient, client } = params;
    const ctx = {
      email: userData.email,
      role: userData.role,
      name: this.namespace,
    };

    logger.info(ctx, "Creating account...");

    let userId: string | null = null;

    try {
      // Step 1: Create the auth user
      const { data: authData, error: authError } =
        await adminClient.auth.admin.createUser({
          email: userData.email,
          password: Math.random().toString(36).slice(-8),
          email_confirm: true,
          user_metadata: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            middle_name: userData.middleName || null,
            role: userData.role,
            status: "inactive",
          },
        });

      if (authError) {
        if (!authData) {
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

          `Supabase error while creating auth user: ${authError.message}`
        );

        throw new Error(`Failed to create account: ${authError.message}`);
      }

      userId = authData.user.id;

      // Step 2: Create role-specific records
      // (The trigger has already created the base users record)
      await this.createRoleSpecificRecord(client, userId, userData);

      logger.info(ctx, "Account successfully created");

      return {
        success: true,
        message: "Account successfully created",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error creating account"
      );

      // Cleanup: If we have a userId, ensure we clean up both auth and users table
      if (userId) {
        try {
          logger.info(ctx, "Cleaning up failed account creation...");

          // Delete from users table first (if it exists)
          await client.from("users").delete().eq("id", userId);

          // Delete from auth
          await adminClient.auth.admin.deleteUser(userId);

          logger.info(ctx, "Account cleanup completed");
        } catch (cleanupError) {
          logger.error(
            {
              ...ctx,
              cleanupError,
            },
            "Error during account cleanup"
          );
        }
      }

      throw error;
    }
  }

  /**
   * Creates role-specific database records
   */
  private async createRoleSpecificRecord(
    client: SupabaseClient<Database>,
    userId: string,
    userData: AddAccountFormValues
  ) {
    switch (userData.role) {
      case "trainee":
        await this.createTraineeRecord(client, userId, userData);
        break;
      case "coordinator":
        await this.createCoordinatorRecord(client, userId, userData);
        break;
      case "supervisor":
        await this.createSupervisorRecord(client, userId, userData);
        break;
      case "admin":
        // Admin role doesn't need additional records
        break;
      default:
        throw new Error("Unknown role");
    }
  }

  /**
   * Creates a trainee record
   */
  private async createTraineeRecord(
    client: SupabaseClient<Database>,
    userId: string,
    userData: Extract<AddAccountFormValues, { role: "trainee" }>
  ) {
    const traineeInsert: TablesInsert<"trainees"> = {
      id: userId,
      student_id_number: userData.studentIdNumber,
      course: userData.course,
      section: userData.section,
      address: userData.address || null,
      mobile_number: userData.mobileNumber || null,
    };

    const { error } = await client.from("trainees").insert(traineeInsert);

    if (error) {
      if (
        error.code === "23505" &&
        error.message.includes("trainees_student_id_number_key")
      ) {
        throw new Error(
          `Trainee with Student ID Number: ${userData.studentIdNumber} already exists.`
        );
      }

      throw new Error(`Failed to create trainee record: ${error.message}`);
    }
  }

  /**
   * Creates a coordinator record
   */
  private async createCoordinatorRecord(
    client: SupabaseClient<Database>,
    userId: string,
    userData: Extract<AddAccountFormValues, { role: "coordinator" }>
  ) {
    const coordinatorInsert: TablesInsert<"coordinators"> = {
      id: userId,
      department: userData.coordinatorDepartment,
    };

    const { error } = await client
      .from("coordinators")
      .insert(coordinatorInsert);

    if (error) {
      throw new Error(`Failed to create coordinator record: ${error.message}`);
    }
  }

  /**
   * Creates a supervisor record
   */
  private async createSupervisorRecord(
    client: SupabaseClient<Database>,
    userId: string,
    userData: Extract<AddAccountFormValues, { role: "supervisor" }>
  ) {
    const supervisorInsert: TablesInsert<"supervisors"> = {
      id: userId,
      position: userData.position,
      department: userData.supervisorDepartment,
      telephone_number: userData.telephoneNumber,
      company_name: userData.companyName || null,
      company_contact_no: userData.companyContactNo || null,
      company_address: userData.companyAddress || null,
      nature_of_business: userData.natureOfBusiness || null,
      created_at: new Date().toISOString(),
    };

    const { error } = await client.from("supervisors").insert(supervisorInsert);

    if (error) {
      throw new Error(`Failed to create supervisor record: ${error.message}`);
    }
  }
}
