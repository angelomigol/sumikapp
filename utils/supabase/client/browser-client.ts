import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseClientKeys } from "../get-supabase-client-keys";
import { Database } from "../supabase.types";

/**
 * @name getSupabaseBrowserClient
 * @description Get a Supabase client for use in the Browser
 */
export function getSupabaseBrowserClient<GenericSchema = Database>() {
  const keys = getSupabaseClientKeys();

  return createBrowserClient<GenericSchema>(keys.url, keys.anonKey);
}
