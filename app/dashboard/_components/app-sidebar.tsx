import * as React from "react";
import Image from "next/image";

import type { JwtPayload } from "@supabase/supabase-js";

import { OJTStatus } from "@/lib/constants";

import { Tables } from "@/utils/supabase/supabase.types";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { ProfileAccountDropdownContainer } from "./personal-account-dropdown-container";
import { SidebarNavigationWrapper } from "./sidebar-navigation-wrapper";

export function AppSidebar(props: {
  account: Tables<"users">;
  user: JwtPayload;
  ojtstatus?: OJTStatus;
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-16 justify-center">
        <AppSidebarHeader />
      </SidebarHeader>

      <SidebarContent>
        <SidebarNavigationWrapper
          userRole={props.account.role}
          ojtStatus={props.ojtstatus}
        />
      </SidebarContent>

      <SidebarFooter>
        <ProfileAccountDropdownContainer
          user={props.user}
          account={props.account}
        />
      </SidebarFooter>
    </Sidebar>
  );
}

function AppSidebarHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size={"lg"}
          className="animate-in fade-in flex h-14 items-center justify-between space-x-2 duration-500 group-data-[minimized=true]:px-0"
        >
          <div className="flex aspect-square size-8 items-center justify-center">
            <Image
              src="/nu_logo.png"
              alt="NU Logo"
              width={26}
              height={26}
              className="size-auto"
            />
          </div>
          <div className="grid flex-1 text-left text-sm">
            <span className="truncate leading-none font-semibold">
              SumikAPP
            </span>
            <span className="truncate text-xs leading-none text-wrap">
              On-The-Job Training Management and Placement System
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
