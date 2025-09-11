"use client";

import { usePathname } from "next/navigation";

import {
  createSectionNavigation,
  navigationConfig,
} from "@/config/navigation.config";
import { useFilteredNavigation } from "@/hooks/use-filter-navigation";

import { OJTStatus, Role } from "@/lib/constants";

import AppSidebarNavigation from "./sidebar-navigation";

export function SidebarNavigationWrapper({
  userRole,
  ojtStatus,
}: {
  userRole: Role;
  ojtStatus?: OJTStatus;
}) {
  const pathname = usePathname();

  const sectionMatch = pathname.match(/^\/dashboard\/sections\/([^\/]+)/);
  const isSectionRoute = sectionMatch && pathname.split("/").length > 3;
  const sectionSlug = sectionMatch?.[1];

  const currentConfig =
    isSectionRoute && sectionSlug
      ? createSectionNavigation(sectionSlug)
      : navigationConfig;

  const filteredConfig = useFilteredNavigation(
    currentConfig,
    userRole,
    ojtStatus
  );

  return <AppSidebarNavigation config={filteredConfig} />;
}
