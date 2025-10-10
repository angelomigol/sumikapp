import type { NextRequest } from "next/server";
import { NextResponse, URLPattern } from "next/server";

import { sidebarRoutes } from "@/config/navigation.config";
import pathsConfig from "@/config/paths.config";

import { checkRequiresMultiFactorAuthentication } from "@/utils/supabase/check-requires-mfa";
import { createMiddlewareClient } from "@/utils/supabase/client/middleware-client";

import { getUserRole } from "./app/dashboard/layout";

const NEXT_ACTION_HEADER = "next-action";

export const config = {
  matcher: ["/((?!_next/static|_next/image|images|locales|assets|api/*).*)"],
};

const getUser = (request: NextRequest, response: NextResponse) => {
  const supabase = createMiddlewareClient(request, response);

  return supabase.auth.getClaims();
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // set a unique request ID for each request
  // this helps us log and trace requests
  setRequestId(request);

  // handle patterns for specific routes
  const handlePattern = matchUrlPattern(request.url);

  // if a pattern handler exists, call it
  if (handlePattern) {
    const patternHandlerResponse = await handlePattern(request, response);

    // if a pattern handler returns a response, return it
    if (patternHandlerResponse) {
      return patternHandlerResponse;
    }
  }

  // append the action path to the request headers
  // which is useful for knowing the action path in server actions
  if (isServerAction(request)) {
    response.headers.set("x-action-path", request.nextUrl.pathname);
  }

  // if no pattern handler returned a response,
  // return the session response
  return response;
}

function isServerAction(request: NextRequest) {
  const headers = new Headers(request.headers);

  return headers.has(NEXT_ACTION_HEADER);
}
/**
 * Define URL patterns and their corresponding handlers.
 */
function getPatterns(): {
  patterns: URLPattern[];
  handler: (
    req: NextRequest,
    res: NextResponse
  ) => Promise<NextResponse | void>;
}[] {
  return [
    {
      patterns: [
        new URLPattern({ pathname: "/" }),
        new URLPattern({ pathname: "/auth/*" }),
      ],
      handler: async (req: NextRequest, res: NextResponse) => {
        const { data } = await getUser(req, res);

        // the user is logged out, so we don't need to do anything
        if (!data?.claims) {
          return;
        }

        // check if we need to verify MFA (user is authenticated but needs to verify MFA)
        const isVerifyMfa = req.nextUrl.pathname === pathsConfig.auth.verifyMfa;

        // If user is logged in and does not need to verify MFA,
        // redirect to dashboard page.
        if (!isVerifyMfa) {
          return NextResponse.redirect(
            new URL(pathsConfig.app.dashboard, req.nextUrl.origin).href
          );
        }
      },
    },
    {
      patterns: [new URLPattern({ pathname: "/dashboard/*?" })],
      handler: async (req: NextRequest, res: NextResponse) => {
        const { data } = await getUser(req, res);

        const origin = req.nextUrl.origin;
        const next = req.nextUrl.pathname;

        // If user is not logged in, redirect to index/sign in page.
        if (!data?.claims) {
          const signIn = pathsConfig.app.index;
          const redirectPath = `${signIn}?next=${next}`;

          return NextResponse.redirect(new URL(redirectPath, origin).href);
        }

        const supabase = createMiddlewareClient(req, res);

        const requiresMultiFactorAuthentication =
          await checkRequiresMultiFactorAuthentication(supabase);

        // If user requires multi-factor authentication, redirect to MFA page.
        if (requiresMultiFactorAuthentication) {
          return NextResponse.redirect(
            new URL(pathsConfig.auth.verifyMfa, origin).href
          );
        }

        // 🔒 Role-based route protection
        const protectedRoute = findProtectedRoute(req.nextUrl.pathname);
        if (protectedRoute) {
          const userRole = await getUserRole();
          if (userRole === null) {
            return NextResponse.redirect(pathsConfig.app.index);
          }
          if (!protectedRoute.authorizedRoles.includes(userRole)) {
            // If user is not allowed, redirect to 403 page
            return NextResponse.rewrite(
              new URL("/not-found", req.nextUrl.origin)
            );
          }
        }
      },
    },
  ];
}

/**
 * Match URL patterns to specific handlers.
 * @param url
 */
function matchUrlPattern(url: string) {
  const patternGroups = getPatterns();
  const input = url.split("?")[0];

  for (const { patterns, handler } of patternGroups) {
    for (const pattern of patterns) {
      if (pattern.exec(input)) {
        return handler;
      }
    }
  }
}

/**
 * Set a unique request ID for each request.
 * @param request
 */
function setRequestId(request: Request) {
  request.headers.set("x-correlation-id", crypto.randomUUID());
}

/**
 *
 * @param pathname
 */
export function findProtectedRoute(pathname: string) {
  return sidebarRoutes
    .flatMap((section) =>
      section.children.map(({ path, authorizedRoles }) => ({
        path,
        authorizedRoles,
      }))
    )
    .find((route) => pathname === route.path);
}
