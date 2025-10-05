import { useMutation } from "@tanstack/react-query";

import { getSupabaseServerAdminClient } from "../client/server-admin-client";
import { Database } from "../supabase.types";

interface InviteUserByEmailMutationParams {
  email: string;
  role: Database["public"]["Enums"]["role"];
  redirectTo: string;
}

/**
 * @name useInviteUserByEmail
 * @description Use Supabase to invite a user by email with role metadata.
 * After the user clicks the link in the email, they will be redirected to
 * /profile-setup where they can setup their profile.
 */
export function useInviteUserByEmail() {
  const serverAdmin = getSupabaseServerAdminClient();
  const mutationKey = ["auth", "invite-user-by-email"];

  const mutationFn = async (params: InviteUserByEmailMutationParams) => {
    const { error, data } = await serverAdmin.auth.admin.inviteUserByEmail(
      params.email,
      {
        redirectTo: params.redirectTo,
      }
    );

    if (error) {
      throw error;
    }

    return data;
  };

  return useMutation({
    mutationFn,
    mutationKey,
  });
}
