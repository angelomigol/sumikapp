"use server";

import { revalidatePath } from "next/cache";

import { NormalizedUser } from "@/hooks/use-users";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerAdminClient } from "@/utils/supabase/client/server-admin-client";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { addAccountSchema } from "../schema/add-account.schema";
import { sendEmailInviteSchema } from "../schema/send-email-invite-schema";
import { createCreateUserService } from "./services/create-user.service";
import { createDeleteUserService } from "./services/delete-user.service";
import { createEmailInviteService } from "./services/email-invite.service";
import { createGetUserListService } from "./services/get-user-list.service";

export async function refreshAuthSession() {
  const client = getSupabaseServerClient();

  await client.auth.refreshSession();

  return {};
}

/**
 * @name sendEmailInviteAction
 * @description Server action to send an email invitation to a new user
 */
export const sendEmailInviteAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const { data, success, error } = sendEmailInviteSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!success) {
      throw new Error(`Invalid form data: ${error.message}`);
    }

    const ctx = {
      name: "email.invite",
      userId: user.id,
      inviteEmail: data.email,
      inviteRole: data.role,
    };

    const userPermissions = await getUserPermissions(user.id);
    if (!canInviteRole(userPermissions.role, data.role)) {
      logger.warn(
        {
          ...ctx,
          userRole: userPermissions.role,
        },
        "User does not have permission to invite users with this role"
      );
      throw new Error("Insufficient permissions to send invitation");
    }

    logger.info(ctx, "Sending email invitation...");

    const adminClient = getSupabaseServerAdminClient();
    const inviteService = createEmailInviteService();

    try {
      const result = await inviteService.sendEmailInvite({
        adminClient,
        email: data.email,
        role: data.role,
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`,
      });

      logger.info(
        {
          ...ctx,
          inviteUserId: result.userId,
        },
        "Email invitation sent successfully"
      );

      // Revalidate relevant pages
      revalidatePath("/dashboard/users");
      revalidatePath("/dashboard/invites");

      return {
        success: true,
        message: `Invitation sent to ${data.email}`,
        userId: result.userId,
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to send email invitation"
      );

      const errorMessage =
        error instanceof Error ? error.message : "Failed to send invitation";

      throw new Error(errorMessage);
    }
  },
  {
    auth: true,
  }
);

/**
 * @name resendEmailInviteAction
 * Server action to resend an email invitation
 */
export const resendEmailInviteAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const userId = formData.get("userId") as string;

    if (!userId) {
      throw new Error("User ID is required");
    }

    const ctx = {
      name: "email.invite.resend",
      userId: user.id,
      targetUserId: userId,
    };

    logger.info(ctx, "Resending email invitation...");

    const adminClient = getSupabaseServerAdminClient();
    const inviteService = createEmailInviteService();

    try {
      await inviteService.resendEmailInvite({
        adminClient,
        userId,
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`,
      });

      logger.info(ctx, "Email invitation resent successfully");

      revalidatePath("/dashboard/users");
      revalidatePath("/dashboard/invites");

      return {
        success: true,
        message: "Invitation resent successfully",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to resend email invitation"
      );

      const errorMessage =
        error instanceof Error ? error.message : "Failed to resend invitation";

      throw new Error(errorMessage);
    }
  },
  {
    auth: true,
  }
);

/**
 * @name getUsersAction
 * Server action to retrieve all users
 */
export const getUsersAction = enhanceAction(
  async (_, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "users.fetch",
      userId: user.id,
    };

    logger.info(ctx, "Fetching users...");

    try {
      const client = getSupabaseServerClient();
      const service = createGetUserListService();

      const result = await service.getUsers({
        client,
        userId: user.id,
      });

      logger.info(
        {
          ...ctx,
          reports: result,
        },
        "Successfully fetched users"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch users"
      );

      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch users";

      throw new Error(errorMessage);
    }
  },
  {
    auth: true,
  }
);

/**
 * @name getUserByIdAction
 * Server action to retrieve user details using userId
 */
export const getUserByIdAction = enhanceAction(
  async (accountId: string, user): Promise<NormalizedUser> => {
    const logger = await getLogger();

    if (!accountId || typeof accountId !== "string") {
      throw new Error("Account ID is required");
    }

    const ctx = {
      name: "users.fetchById",
      userId: user.id,
      accountId,
    };

    logger.info(ctx, "Fetching user by ID...");

    try {
      const client = getSupabaseServerClient();
      const service = createGetUserListService();

      const result = await service.getUserById({
        client,
        userId: user.id,
        accountId,
      });

      if (!result) {
        logger.warn(ctx, "User not found");
        throw new Error("User not found");
      }

      logger.info(ctx, "Successfully fetched user");

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch user by ID"
      );

      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch user by ID";

      throw new Error(errorMessage);
    }
  },
  {
    auth: true,
  }
);

/**
 * @name deleteUserAction
 * Server action to
 */
export const deleteUserAction = enhanceAction(
  async (accountId: string, user) => {
    const logger = await getLogger();

    if (!accountId || typeof accountId !== "string") {
      throw new Error("Account ID is required");
    }

    const ctx = {
      name: "user.delete",
      userId: user.id,
      accountId,
    };

    logger.info(ctx, "Deleting user...");

    try {
      const adminClient = getSupabaseServerAdminClient();
      const client = getSupabaseServerClient();
      const service = createDeleteUserService();

      const result = await service.deleteUser({
        adminClient,
        client,
        userId: user.id,
        accountId,
      });

      if (!result) {
        logger.warn(ctx, "User not found");
        throw new Error("User not found");
      }

      logger.info(ctx, "Successfully deleted user");

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to delete user"
      );

      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete user";

      throw new Error(errorMessage);
    }
  },
  {
    auth: true,
  }
);

/**
 * @name createUserAction
 * Server action to
 */
export const createUserAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const { data, success, error } = addAccountSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!success) {
      throw new Error(`Invalid form data: ${error.message}`);
    }

    const ctx = {
      name: "user.create",
      userId: user.id,
    };

    logger.info(ctx, "Creating user...");

    try {
      const adminClient = getSupabaseServerAdminClient();
      const client = getSupabaseServerClient();
      const service = createCreateUserService();

      const result = await service.createUser({
        adminClient,
        client,
        userData: data,
      });

      if (!result) {
        logger.warn(ctx, "User not found");
        throw new Error("User not found");
      }

      logger.info(ctx, "Successfully deleted user");

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to delete user"
      );

      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete user";

      throw new Error(errorMessage);
    }
  },
  {
    auth: true,
  }
);

/**
 * @name updateUserAction
 * Server action to
 */
export const updateUserAction = enhanceAction(
  async (formData: FormData, user) => {

  }, { auth: true }
)

/**
 * Helper function to get user permissions
 * Adjust this based on your actual permission system
 */
async function getUserPermissions(userId: string) {
  const client = getSupabaseServerAdminClient();

  const { data: user, error } = await client
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !user) {
    throw new Error("Failed to get user permissions");
  }

  return user;
}

/**
 * Helper function to check if a user role can invite another role
 * Adjust this based on your business logic
 */
type Role = "admin" | "coordinator" | "supervisor" | "trainee";

function canInviteRole(userRole: Role, inviteRole: Role): boolean {
  const roleHierarchy: Record<Role, Role[]> = {
    admin: ["admin", "coordinator", "supervisor", "trainee"],
    coordinator: ["supervisor", "trainee"],
    supervisor: [],
    trainee: [],
  };

  return roleHierarchy[userRole]?.includes(inviteRole) || false;
}
