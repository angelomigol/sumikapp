import "server-only";
import { redirect } from "next/navigation";

import type { User } from "@supabase/supabase-js";

import { ZodType, z } from "zod";

import { verifyCaptchaToken } from "@/utils/captcha/server/verify-captcha";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";
import { requireUser } from "@/utils/supabase/require-user";

import { zodParseFactory } from "./zod-parse-factory";

/**
 * @name enhanceAction
 * @description Enhance an action with captcha, schema and auth checks
 */
export function enhanceAction<
  Args,
  Response,
  Schema extends z.ZodTypeAny | undefined = undefined,
  Config extends {
    auth?: boolean;
    captcha?: boolean;
    schema?: Schema;
  } = {
    auth?: boolean;
    captcha?: boolean;
    schema?: Schema;
  }
>(
  fn: (
    params: Schema extends z.ZodTypeAny ? z.output<Schema> : Args,
    user: Config["auth"] extends false ? undefined : User
  ) => Response | Promise<Response>,
  config: Config
) {
  return async (
    params: Schema extends z.ZodTypeAny ? z.input<Schema> : Args
  ) => {
    type UserParam = Config["auth"] extends false ? undefined : User;
    type DataParam = Schema extends z.ZodTypeAny ? z.output<Schema> : Args;

    const requireAuth = config.auth ?? true;
    let user: UserParam = undefined as UserParam;

    // validate the schema passed in the config if it exists
    const data: DataParam = (config.schema
      ? zodParseFactory(config.schema)(params)
      : params) as DataParam;

    // by default, the CAPTCHA token is not required
    const verifyCaptcha = config.captcha ?? false;

    // verify the CAPTCHA token. It will throw an error if the token is invalid.
    if (verifyCaptcha) {
      const token = (data as Args & { captchaToken: string }).captchaToken;

      // Verify the CAPTCHA token. It will throw an error if the token is invalid.
      await verifyCaptchaToken(token);
    }

    // verify the user is authenticated if required
    if (requireAuth) {
      // verify the user is authenticated if required
      const auth = await requireUser(getSupabaseServerClient());

      // If the user is not authenticated, redirect to the specified URL.
      if (!auth.data) {
        redirect(auth.redirectTo);
      }

      user = auth.data as UserParam;
    }

    return fn(data, user);
  };
}
