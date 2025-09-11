import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createEmailInviteService() {
  return new EmailInviteService();
}

/**
 * @name EmailInviteService
 * @description Service for sending email invitations to users
 * @param Database - The Supabase database type to use
 * @example
 * const adminClient = getSupabaseServerAdminClient();
 * const inviteService = new EmailInviteService();
 */
class EmailInviteService {
  private namespace = "user.invite";

  /**
   * @name sendEmailInvite
   * Send an email invite to a user with a magic link or sign-up invitation.
   * This will create an invitation record and send an email to the specified address.
   *
   * Permissions are checked in the server action that calls this service.
   */
  async sendEmailInvite(params: {
    adminClient: SupabaseClient<Database>;
    email: string;
    role: Database["public"]["Enums"]["role"];
    redirectTo?: string;
  }) {
    const logger = await getLogger();

    const { email, role, redirectTo } = params;
    const ctx = { email, role, name: this.namespace };

    logger.info(ctx, "Sending email invitation to user...");

    try {
      const { data: existingUser, error: userCheckError } =
        await params.adminClient
          .from("users")
          .select("id, email")
          .eq("email", email)
          .maybeSingle();

      if (userCheckError) {
        logger.error(
          {
            ...ctx,
            error: userCheckError,
          },
          "Error checking if user exists"
        );

        throw new Error("Error checking if user exists");
      }

      if (existingUser) {
        logger.warn(ctx, "User already exists with this email");
        throw new Error("User already exists with this email");
      }

      const { data: inviteData, error: inviteError } =
        await params.adminClient.auth.admin.inviteUserByEmail(email, {
          redirectTo:
            redirectTo || `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        });

      if (inviteError) {
        logger.error(
          {
            ...ctx,
            error: inviteError,
          },
          "Error sending email invitation"
        );
        throw new Error("Failed to send email invitation");
      }

      logger.info(
        {
          ...ctx,
          inviteId: inviteData.user.id,
        },
        "Email invitation sent successfully"
      );

      return {
        success: true,
        userId: inviteData.user.id,
        message: "Email invitation sent successfully",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Encountered an error while sending email invitation"
      );

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Failed to send email invitation");
    }
  }

  /**
   * @name resendEmailInvite
   * Resend an email invite to a user who hasn't accepted their invitation yet.
   */
  async resendEmailInvite(params: {
    adminClient: SupabaseClient<Database>;
    userId: string;
    redirectTo?: string;
  }) {
    const logger = await getLogger();

    const { userId, redirectTo } = params;
    const ctx = { userId, name: this.namespace };

    logger.info(ctx, "Resending email invitation...");

    try {
      const { error } = await params.adminClient.auth.admin.generateLink({
        type: "invite",
        email: "",
        options: {
          redirectTo:
            redirectTo || `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });

      if (error) {
        logger.error(
          {
            ...ctx,
            error,
          },
          "Error resending email invitation"
        );

        throw new Error("Failed to resend email invitation");
      }

      logger.info(ctx, "Email invitaiton resent successfully");

      return {
        success: true,
        message: "Email invitaiton resent successfully",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Encountered an error while resending email invitation"
      );

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Failed to resend email invitation");
    }
  }
}
