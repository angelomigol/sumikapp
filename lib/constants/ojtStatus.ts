import { Constants } from "@/utils/supabase/supabase.types";

type OJTStatus = (typeof Constants.public.Enums.ojt_status)[number];

interface OJTStatusConfig {
  label: string;
  badgeColor: string;
}

export const ojtStatusMap: Record<OJTStatus, OJTStatusConfig> = {
  active: {
    label: "Active",
    badgeColor: "bg-blue-3 text-blue-11",
  },
  completed: {
    label: "Completed",
    badgeColor: "bg-green-3 text-green-11",
  },
  "not started": {
    label: "Not Started",
    badgeColor: "bg-gray-3 text-gray-11",
  },
  dropped: {
    label: "Dropped",
    badgeColor: "bg-red-3 text-red-11",
  },
} as const;

export const getOJTStatusConfig = (status: string): OJTStatusConfig | null => {
  return ojtStatusMap[status as OJTStatus] || null;
};

export const ojtStatusFilterOptions = Object.entries(ojtStatusMap).map(
  ([value, config]) => ({
    label: config.label,
    value: value as OJTStatus,
    badgeColor: config.badgeColor,
  })
);

export type { OJTStatus };
