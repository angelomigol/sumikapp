"use client";

import React from "react";
import Link from "next/link";

import type { User } from "@supabase/supabase-js";
import { Bell, ChevronsUpDown, Home, LogOut, Settings2 } from "lucide-react";

import { usePersonalAccountData } from "@/hooks/use-personal-account-data";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { If } from "@/components/sumikapp/if";
import { SubMenuModeToggle } from "@/components/sumikapp/mode-toggle";
import { ProfileAvatar } from "@/components/sumikapp/profile-avatar";

export default function NavUser({
  user,
  account,
  signOutRequested,
  paths,
}: {
  user: User;

  account?: {
    id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    role: string;
  };

  signOutRequested: () => unknown;

  paths: {
    dashboard: string;
    settings: string;
  };
}) {
  const { isMobile } = useSidebar();

  const personalAccountData = usePersonalAccountData(user.id, account);

  const displayName =
    [
      personalAccountData?.data?.first_name,
      personalAccountData?.data?.middle_name,
      personalAccountData?.data?.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    [account?.first_name, account?.middle_name, account?.last_name]
      .filter(Boolean)
      .join(" ") ||
    user?.email ||
    "";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <ProfileAvatar
                className="rounded-lg"
                fallbackClassName="rounded-lg"
                displayName={displayName ?? ""}
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <ProfileAvatar
                  className="rounded-lg"
                  fallbackClassName="rounded-full"
                  displayName={displayName ?? ""}
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <If condition={account?.role === "coordinator"}>
                <DropdownMenuItem asChild className={"cursor-pointer"}>
                  <Link
                    href={paths.dashboard}
                    className="flex items-center gap-2"
                  >
                    <Home />
                    Home
                  </Link>
                </DropdownMenuItem>
              </If>
              <DropdownMenuItem asChild className={"cursor-pointer"}>
                <Link href={paths.settings} className="flex items-center gap-2">
                  <Settings2 />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={true}
                className={"cursor-pointer"}
                onClick={() => {}}
              >
                <Bell />
                Notifications
              </DropdownMenuItem>

              <SubMenuModeToggle />
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              data-test={"account-dropdown-sign-out"}
              role={"button"}
              className={"cursor-pointer"}
              onClick={signOutRequested}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
