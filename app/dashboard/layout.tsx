import { redirect } from "next/navigation";

import { navigationConfig } from "@/config/navigation.config";

import { Role, OJTStatus as Status } from "@/lib/constants";
import { requireUserInServerComponent } from "@/lib/server/require-user-in-server-component";

import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";
import { Tables } from "@/utils/supabase/supabase.types";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppBreadcrumbs } from "@/components/sumikapp/app-breadcrumbs";

import { AppSidebar } from "./_components/app-sidebar";

type OJTStatus = Status;

function DashboardLayout({ children }: React.PropsWithChildren) {
  return <SidebarLayout>{children}</SidebarLayout>;
}

export default DashboardLayout;

async function SidebarLayout({ children }: React.PropsWithChildren) {
  const sidebarMinimized = navigationConfig.sidebarCollapsed;
  const user = await requireUserInServerComponent();
  const userDetails = await getUserDetailsWithOJTStatus();

  if (!userDetails.account) {
    redirect("/login");
  }

  return (
    <SidebarProvider defaultOpen={sidebarMinimized}>
      <AppSidebar
        user={user}
        account={userDetails.account}
        ojtstatus={userDetails.ojtStatus}
      />

      <SidebarInset className="overflow-x-hidden">
        <header className="bg-background sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <div role="none" className="bg-border mr-2 h-4 w-px shrink-0" />
            <AppBreadcrumbs />
          </div>
        </header>
        <div className="flex flex-1 flex-col space-y-6 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

async function getUserDetailsWithOJTStatus(): Promise<{
  account: Tables<"users"> | null;
  ojtStatus?: OJTStatus;
}> {
  const supabase = getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) return { account: null };

  const { data: userDetails } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!userDetails) return { account: null };

  // If user is a trainee, get OJT status from the dashboard view
  let ojtStatus: OJTStatus | undefined;
  if (userDetails.role === "trainee") {
    const { data: traineeOverview } = await supabase
      .from("trainee_batch_enrollment")
      .select("ojt_status")
      .eq("trainee_id", userDetails.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    ojtStatus = traineeOverview?.ojt_status || undefined;
  }

  return {
    account: userDetails,
    ojtStatus,
  };
}

export async function getUserRole(): Promise<Role | null> {
  const supabase = getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) return null;

  const { data: userRole } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return userRole?.role ?? null;
}
