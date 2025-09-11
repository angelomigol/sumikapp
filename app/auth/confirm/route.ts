import { NextRequest, NextResponse } from "next/server";

import pathsConfig from "@/config/paths.config";

import { createAuthCallbackService } from "@/utils/supabase/auth-callback.service";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

export async function GET(request: NextRequest) {
  const service = createAuthCallbackService(getSupabaseServerClient());

  const url = await service.verifyTokenHash(request, {
    redirectPath: pathsConfig.app.dashboard,
  });

  return NextResponse.redirect(url);
}
