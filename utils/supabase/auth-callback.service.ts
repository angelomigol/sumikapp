import "server-only";

import {
  AuthError,
  SupabaseClient,
  type EmailOtpType,
} from "@supabase/supabase-js";

/**
 * @name createAuthCallbackService
 * @description Creates an instance of the AuthCallbackService
 * @param client
 */
export function createAuthCallbackService(client: SupabaseClient) {
  return new AuthCallbackService(client);
}

/**
 * @name AuthCallbackService
 * @description Service for handling auth callbacks in Supabase
 *
 * This service handles a variety of situations and edge cases in Supabase Auth.
 *
 */
class AuthCallbackService {
  constructor(private readonly client: SupabaseClient) {}

  /**
   * @name isEmailScanner
   * @description Detects if the request is from an email scanner or bot
   * @param request
   */
  private isEmailScanner(request: Request): boolean {
    const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";
    const referer = request.headers.get("referer") || "";
    const accept = request.headers.get("accept") || "";
    const xForwardedFor = request.headers.get("x-forwarded-for") || "";
    const xRealIp = request.headers.get("x-real-ip") || "";

    // Get the actual client IP
    const clientIP = xForwardedFor.split(",")[0].trim() || xRealIp || "";

    // Check for known email security scanner patterns
    const scannerPatterns = [
      "safelinks",
      "atp", // Advanced Threat Protection
      "proofpoint",
      "mimecast",
      "barracuda",
      "cisco email security",
      "ironport",
      "fortimail",
      "trend micro",
    ];

    for (const pattern of scannerPatterns) {
      if (userAgent.includes(pattern) || referer.includes(pattern)) {
        console.log(`Email scanner detected (pattern: ${pattern}):`, {
          userAgent,
          referer,
        });
        return true;
      }
    }

    // Check for Outlook SafeLinks
    if (referer.includes("safelinks.protection.outlook")) {
      console.log("Outlook SafeLinks detected:", { referer });
      return true;
    }

    // Check for Microsoft-related scanners (but not Edge browser)
    if (userAgent.includes("microsoft") && !userAgent.includes("edge")) {
      console.log("Microsoft scanner detected:", { userAgent });
      return true;
    }

    // Check for email tracking services making prefetch requests
    // These services often have generic user agents and don't accept HTML
    if (
      !accept.includes("text/html") &&
      (accept.includes("*/*") || accept === "")
    ) {
      console.log(
        "Potential tracking service detected (no HTML accept header):",
        { accept, userAgent }
      );
      return true;
    }

    // Check for requests without proper browser user agents
    const hasBrowserUA =
      userAgent.includes("mozilla") ||
      userAgent.includes("chrome") ||
      userAgent.includes("safari") ||
      userAgent.includes("edge") ||
      userAgent.includes("firefox") ||
      userAgent.includes("opera");

    if (!hasBrowserUA && userAgent !== "") {
      console.log("Non-browser user agent detected:", { userAgent });
      return true;
    }

    // Check for very generic or empty user agents
    if (userAgent === "mozilla/5.0" || userAgent === "") {
      console.log("Generic/empty user agent detected:", { userAgent });
      return true;
    }

    // AWS IP ranges check (Resend tracking or SafeLinks infrastructure)
    // Only flag if it also has non-browser characteristics
    if (
      clientIP.startsWith("52.") ||
      clientIP.startsWith("54.") ||
      clientIP.startsWith("3.") ||
      clientIP.startsWith("18.")
    ) {
      // AWS IP detected - check if it has browser-like characteristics
      if (!accept.includes("text/html") || !hasBrowserUA) {
        console.log("AWS IP with non-browser characteristics:", {
          clientIP,
          userAgent,
          accept,
        });
        return true;
      }
    }

    return false;
  }

  /**
   * @name verifyTokenHash
   * @description Verifies the token hash and type and redirects the user to the next page
   * This should be used when using a token hash to verify the user's email
   * @param request
   * @param params
   */
  async verifyTokenHash(
    request: Request,
    params: {
      redirectPath: string;
      errorPath?: string;
    }
  ): Promise<URL> {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const host = request.headers.get("host");

    // set the host to the request host since outside of Vercel it gets set as "localhost"
    if (url.host.includes("localhost:") && !host?.includes("localhost")) {
      url.host = host as string;
      url.port = "";
    }

    url.pathname = params.redirectPath;

    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const callbackParam =
      searchParams.get("next") ?? searchParams.get("callback");

    let nextPath: string | null = null;
    const callbackUrl = callbackParam ? new URL(callbackParam) : null;

    // if we have a callback url, we check if it has a next path
    if (callbackUrl) {
      // if we have a callback url, we check if it has a next path
      const callbackNextPath = callbackUrl.searchParams.get("next");

      // if we have a next path in the callback url, we use that
      if (callbackNextPath) {
        nextPath = callbackNextPath;
      } else {
        nextPath = callbackUrl.pathname;
      }
    }

    const errorPath = params.errorPath ?? "/auth/callback/error";

    // remove the query params from the url
    searchParams.delete("token_hash");
    searchParams.delete("type");
    searchParams.delete("next");

    // if we have a next path, we redirect to that path
    if (nextPath) {
      url.pathname = nextPath;
    }

    if (token_hash && type) {
      // Detect and ignore email scanners/bots to prevent token consumption
      if (this.isEmailScanner(request)) {
        console.log(
          "Email scanner/bot detected - not consuming token to preserve magic link"
        );

        // Return a basic success response without consuming the token
        // This prevents scanners from invalidating the magic link
        url.pathname = params.redirectPath;
        return url;
      }

      // Only verify OTP if it's NOT a scanner - this is a real user click
      const { data, error } = await this.client.auth.verifyOtp({
        type,
        token_hash,
      });

      if (!error) {
        const user = data.user;

        if (user) {
          const { error: updateError } = await this.client
            .from("users")
            .update({ last_login: new Date().toISOString() })
            .eq("id", user.id);

          if (updateError) {
            console.error("Failed to update last_login:", updateError);
          }
        }
        return url;
      }

      if (error.code) {
        url.searchParams.set("code", error.code);
      }

      const errorMessage = getAuthErrorMessage({
        error: error.message,
        code: error.code,
      });

      url.searchParams.set("error", errorMessage);
    }

    // return the user to an error page with some instructions
    url.pathname = errorPath;

    return url;
  }

  /**
   * @name exchangeCodeForSession
   * @description Exchanges the auth code for a session and redirects the user to the next page or an error page
   * @param request
   * @param params
   */
  async exchangeCodeForSession(
    request: Request,
    params: {
      redirectPath: string;
      errorPath?: string;
    }
  ): Promise<{
    nextPath: string;
  }> {
    const requestUrl = new URL(request.url);
    const searchParams = requestUrl.searchParams;

    const authCode = searchParams.get("code");
    const error = searchParams.get("error");
    const nextUrlPathFromParams = searchParams.get("next");
    const errorPath = params.errorPath ?? "/auth/callback/error";

    const nextUrl = nextUrlPathFromParams ?? params.redirectPath;

    if (authCode) {
      try {
        const { error } =
          await this.client.auth.exchangeCodeForSession(authCode);

        // if we have an error, we redirect to the error page
        if (error) {
          return onError({
            code: error.code,
            error: error.message,
            path: errorPath,
          });
        }
      } catch (error) {
        console.error(
          {
            error,
            name: `auth.callback`,
          },
          `An error occurred while exchanging code for session`
        );

        const message = error instanceof Error ? error.message : error;

        return onError({
          code: (error as AuthError)?.code,
          error: message as string,
          path: errorPath,
        });
      }
    }

    if (error) {
      return onError({
        error,
        path: errorPath,
      });
    }

    return {
      nextPath: nextUrl,
    };
  }
}

function onError({
  error,
  path,
  code,
}: {
  error: string;
  path: string;
  code?: string;
}) {
  const errorMessage = getAuthErrorMessage({ error, code });

  console.error(
    {
      error: JSON.stringify(error),
      name: `auth.callback`,
    },
    `An error occurred while signing user in`
  );

  const searchParams = new URLSearchParams({
    error: errorMessage,
    code: code ?? "",
  });

  const nextPath = `${path}?${searchParams.toString()}`;

  return {
    nextPath,
  };
}

/**
 * Checks if the given error message indicates a verifier error.
 * We check for this specific error because it's highly likely that the
 * user is trying to sign in using a different browser than the one they
 * used to request the sign in link. This is a common mistake, so we
 * want to provide a helpful error message.
 */
function isVerifierError(error: string) {
  return error.includes("both auth code and code verifier should be non-empty");
}

/**
 * @name getAuthErrorMessage
 * @description Get the auth error message from the error code
 * @param params
 */
function getAuthErrorMessage(params: { error: string; code?: string }) {
  // this error arises when the user tries to sign in with an expired email link
  if (params.code) {
    if (params.code === "otp_expired") {
      return "The email link has expired. Please try again.";
    }
  }

  // this error arises when the user is trying to sign in with a different
  // browser than the one they used to request the sign in link
  if (isVerifierError(params.error)) {
    return "It looks like you're trying to sign in using a different browser than the one you used to request the sign in link. Please try again using the same browser.";
  }

  // fallback to the default error message
  return `Sorry, we could not authenticate you. Please try again.`;
}
