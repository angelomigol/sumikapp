import { useMemo } from "react";

import { getSupabaseBrowserClient } from "../client/browser-client";
import { Database } from "../supabase.types";

/**
 * @name useSupabase
 * @description Use Supabase in a React component
 */
export function useSupabase<Db = Database>() {
  return useMemo(() => getSupabaseBrowserClient<Db>(), []);
}
