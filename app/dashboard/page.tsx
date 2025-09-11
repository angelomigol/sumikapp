import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import AdminDashboard from "@/components/dashboards/admin-dashboard";
import CoordinatorDashboard from "@/components/dashboards/coordinator-dashboard";
import SupervisorDashboard from "@/components/dashboards/supervisor-dashboard";
import TraineeDashboard from "@/components/dashboards/trainee-dashboard";

export default async function DashboardPage() {
  const supabase = getSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) redirect("/");

  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!data?.role) redirect("/");

  switch (data?.role) {
    case "admin":
      return <AdminDashboard />;
    case "trainee":
      return <TraineeDashboard />;
    case "supervisor":
      return <SupervisorDashboard />;
    case "coordinator":
      return <CoordinatorDashboard />;
    default:
      redirect("/");
  }
}
