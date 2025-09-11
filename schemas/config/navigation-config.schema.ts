import { z } from "zod";

import { Constants } from "@/utils/supabase/supabase.types";

// Role Enum from Supabase
const RoleEnum = Constants.public.Enums.role as readonly string[];
const OJTStatusEnum = Constants.public.Enums.ojt_status as readonly string[];

const RouteMatchingEnd = z
  .union([z.boolean(), z.custom<(input: string) => boolean>()])
  .default(false)
  .optional();

const Divider = z.object({
  divider: z.literal(true),
});

const RouteSubChild = z.object({
  label: z.string(),
  path: z.string(),
  Icon: z.custom<React.ReactNode>().optional(),
  end: RouteMatchingEnd,
  renderAction: z.custom<React.ReactNode>().optional(),
  authorizedRoles: z.array(z.enum([...RoleEnum])).optional(),
  allowedOJTStatus: z.array(z.enum([...OJTStatusEnum])).optional(),
});

const RouteChild = z.object({
  label: z.string(),
  path: z.string(),
  Icon: z.custom<React.ReactNode>().optional(),
  end: RouteMatchingEnd,
  children: z.array(RouteSubChild).default([]).optional(),
  collapsible: z.boolean().default(false).optional(),
  collapsed: z.boolean().default(false).optional(),
  renderAction: z.custom<React.ReactNode>().optional(),
  authorizedRoles: z.array(z.enum([...RoleEnum])).optional(),
  allowedOJTStatus: z.array(z.enum([...OJTStatusEnum])).optional(),
});

const RouteGroup = z.object({
  label: z.string(),
  collapsible: z.boolean().optional(),
  collapsed: z.boolean().optional(),
  children: z.array(RouteChild),
  renderAction: z.custom<React.ReactNode>().optional(),
});

export const NavigationConfigSchema = z.object({
  style: z.enum(["custom", "sidebar", "header"]).default("sidebar"),
  sidebarCollapsed: z
    .enum(["false", "true"])
    .default("true")
    .optional()
    .transform((value) => value === `true`),
  sidebarCollapsedStyle: z.enum(["offcanvas", "icon", "none"]).default("icon"),
  routes: z.array(z.union([RouteGroup, Divider])),
});
