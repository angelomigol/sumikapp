import { FileQuestion, type LucideIcon } from "lucide-react";

import { Constants } from "@/utils/supabase/supabase.types";

type UserStatus = (typeof Constants.public.Enums.user_status)[number];

interface UserStatusConfig {
  label: string;
  icon?: LucideIcon;
  badgeColor: string;
  textColor: string;
}

export const userStatusMap: Record<UserStatus, UserStatusConfig> = {
  active: {
    label: "Active",
    badgeColor: "bg-green-3 text-green-11",
    textColor: "text-green-11",
  },
  inactive: {
    label: "Inactive",
    badgeColor: "bg-gray-3 text-gray-11",
    textColor: "text-gray-11",
  },
  pending: {
    label: "Pending",
    badgeColor: "bg-amber-3 text-amber-11",
    textColor: "text-amber-11",
  },
  suspended: {
    label: "Suspended",
    badgeColor: "bg-red-3 text-red-11",
    textColor: "text-red-11",
  },
} as const;

export const getUserStatusConfig = (
  status: UserStatus
): UserStatusConfig => {
  return (
    userStatusMap[status] ?? {
      label: "Unknown",
      icon: FileQuestion,
      badgeColor: "bg-gray-3 text-gray-11",
    }
  );
};

export type { UserStatus };
