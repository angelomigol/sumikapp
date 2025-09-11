import {
  Briefcase,
  ClipboardList,
  GraduationCap,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Constants } from "@/utils/supabase/supabase.types";

type Role = (typeof Constants.public.Enums.role)[number];

interface RoleConfig {
  label: string;
  icon: LucideIcon;
}

export const roleMap: Record<Role, RoleConfig> = {
  trainee: {
    label: "Trainee",
    icon: GraduationCap,
  },
  coordinator: {
    label: "Coordinator",
    icon: ClipboardList,
  },
  supervisor: {
    label: "Supervisor",
    icon: Briefcase,
  },
  admin: {
    label: "Admin",
    icon: Settings,
  },
} as const;

export const getRoleConfig = (role: string): RoleConfig | null => {
  return roleMap[role as Role] || null;
};

export const roleFilterOptions = Object.entries(roleMap).map(
  ([value, config]) => ({
    label: config.label,
    value: value as Role,
    icon: config.icon,
  })
);

export type { Role };
