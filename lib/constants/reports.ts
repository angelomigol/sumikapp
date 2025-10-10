import {
  IconCircleCheckFilled,
  IconCircleMinus,
  IconCircleXFilled,
  IconLoader,
  type Icon,
} from "@tabler/icons-react";
import {
  CheckCircle,
  CircleQuestionMark,
  CircleX,
  Clock,
  FileQuestion,
  type LucideIcon,
} from "lucide-react";

import { Constants } from "@/utils/supabase/supabase.types";

type InternshipCode = (typeof Constants.public.Enums.internship_code)[number];
type DocumentStatus = (typeof Constants.public.Enums.document_status)[number];
type EntryStatus = (typeof Constants.public.Enums.entry_status)[number];

interface DocumentStatusConfig {
  label: string;
  icon: LucideIcon | Icon;
  badgeColor: string;
  textColor: string;
}

interface EntryStatusConfig {
  label: string;
  badgeColor: string;
  textColor: string;
}

export const documentStatusMap: Record<DocumentStatus, DocumentStatusConfig> = {
  approved: {
    label: "Approved",
    icon: IconCircleCheckFilled,
    badgeColor: "bg-green-3 text-green-11",
    textColor: "text-green-11",
  },
  rejected: {
    label: "Rejected",
    icon: IconCircleXFilled,
    badgeColor: "bg-red-3 text-red-11",
    textColor: "text-red-11",
  },
  pending: {
    label: "Pending",
    icon: IconLoader,
    badgeColor: "bg-amber-3 text-amber-11",
    textColor: "text-amber-11",
  },
  "not submitted": {
    label: "Not Submitted",
    icon: IconCircleMinus,
    badgeColor: "bg-gray-3 text-gray-11",
    textColor: "text-gray-11",
  },
} as const;

export const entryStatusMap: Record<EntryStatus, EntryStatusConfig> = {
  present: {
    label: "Present",
    badgeColor: "bg-green-3 text-green-11",
    textColor: "text-green-11",
  },
  absent: {
    label: "Absent",
    badgeColor: "bg-red-3 text-red-11",
    textColor: "text-red-11",
  },
  late: {
    label: "Late",
    badgeColor: "bg-amber-3 text-amber-11",
    textColor: "text-amber-11",
  },
  holiday: {
    label: "Holiday",
    badgeColor: "bg-blue-3 text-blue-11",
    textColor: "text-blue-11",
  },
} as const;

export const internCodeMap: Record<InternshipCode, { label: string }> = {
  CTNTERN1: {
    label: "Internship 1",
  },
  CTNTERN2: {
    label: "Internship 2",
  },
} as const;

export const getDocumentStatusConfig = (
  status: DocumentStatus
): DocumentStatusConfig => {
  return (
    documentStatusMap[status] ?? {
      label: "Unknown",
      icon: FileQuestion,
      badgeColor: "bg-gray-3 text-gray-11",
    }
  );
};

export const getInternCodeConfig = (
  code: InternshipCode
): { label: string } => {
  return (
    internCodeMap[code] ?? {
      label: "Unknown Internship",
    }
  );
};

export const getEntryStatusConfig = (
  status: EntryStatus
): EntryStatusConfig => {
  return (
    entryStatusMap[status] ?? {
      label: "Unknown",
      icon: CircleQuestionMark,
      badgeColor: "bg-gray-3 text-gray-11",
    }
  );
};

export const documentStatusFilterOptions = Object.entries(
  documentStatusMap
).map(([value, config]) => ({
  label: config.label,
  value: value as DocumentStatus,
  icon: config.icon,
  badgeColor: config.badgeColor,
  textColor: config.textColor,
}));

export const internCodeSelectOptions = Object.entries(internCodeMap).map(
  ([value, config]) => ({
    label: config.label,
    value: value as InternshipCode,
  })
);

export const entryStatusOptions = Object.entries(entryStatusMap).map(
  ([value, config]) => ({
    label: config.label,
    value: value as InternshipCode,
    badgeColor: config.badgeColor,
    textColor: config.textColor,
  })
);

export type { DocumentStatus, InternshipCode, EntryStatus };
