import { JSX } from "react";

import {
  BadgeCheck,
  BadgeQuestionMark,
  BadgeX,
  BookOpen,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardCheck,
  FilePlus2,
  FileText,
  Info,
  MessageSquare,
  UserCheck2,
  UserMinus2,
  UserPlus2,
} from "lucide-react";

import { Database } from "@/utils/supabase/supabase.types";

export type ActivityType = Database["public"]["Enums"]["activity_type_enum"];

interface ActivityConfig {
  color: string;
  icon: JSX.Element;
}

const iconClasses = "size-5";

const activityConfigs: Partial<Record<ActivityType, ActivityConfig>> = {
  // Accomplishment reports
  accomplishment_report_created: {
    color: "",
    icon: <FileText className={iconClasses} />,
  },
  accomplishment_report_submitted: {
    color: "text-blue-11",
    icon: <FileText className={iconClasses} />,
  },
  accomplishment_report_updated: {
    color: "text-blue-11",
    icon: <FileText className={iconClasses} />,
  },
  accomplishment_report_approved: {
    color: "text-green-11",
    icon: <FileText className={iconClasses} />,
  },
  accomplishment_report_rejected: {
    color: "text-red-11",
    icon: <FileText className={iconClasses} />,
  },
  accomplishment_report_deleted: {
    color: "text-red-11",
    icon: <FileText className={iconClasses} />,
  },

  // Attendance reports
  attendance_report_created: {
    color: "",
    icon: <CalendarClock className={iconClasses} />,
  },
  attendance_report_submitted: {
    color: "text-blue-11",
    icon: <CalendarClock className={iconClasses} />,
  },
  attendance_report_updated: {
    color: "text-blue-11",
    icon: <CalendarClock className={iconClasses} />,
  },
  attendance_report_approved: {
    color: "text-green-11",
    icon: <CalendarClock className={iconClasses} />,
  },
  attendance_report_rejected: {
    color: "text-red-11",
    icon: <CalendarClock className={iconClasses} />,
  },
  attendance_report_deleted: {
    color: "text-red-11",
    icon: <CalendarClock className={iconClasses} />,
  },

  // Requirements
  requirement_submitted: {
    color: "text-blue-11",
    icon: <ClipboardCheck className={iconClasses} />,
  },
  requirement_approved: {
    color: "text-green-11",
    icon: <ClipboardCheck className={iconClasses} />,
  },
  requirement_rejected: {
    color: "text-red-11",
    icon: <ClipboardCheck className={iconClasses} />,
  },
  requirement_deleted: {
    color: "text-red-11",
    icon: <ClipboardCheck className={iconClasses} />,
  },

  // Announcement
  batch_announcement_posted: {
    color: "text-violet-400",
    icon: <MessageSquare className={iconClasses} />,
  },

  // Section (program_batch)
  batch_created: {
    color: "text-green-11",
    icon: <BookOpenCheck className={iconClasses} />,
  },
  batch_updated: {
    color: "text-blue-11",
    icon: <BookOpen className={iconClasses} />,
  },
  batch_deleted: {
    color: "text-red-11",
    icon: <BookOpen className={iconClasses} />,
  },

  // Custom Requirements (batch_requirements)
  batch_requirement_added: {
    color: "text-green-11",
    icon: <FilePlus2 className={iconClasses} />,
  },

  // User-related Activities
  user_login: {
    color: "",
    icon: <UserCheck2 className={iconClasses} />,
  },
  user_registered: {
    color: "text-green-11",
    icon: <UserPlus2 className={iconClasses} />,
  },
  user_deleted: {
    color: "text-red-11",
    icon: <UserMinus2 className={iconClasses} />,
  },

  // Internship Form
  internship_created: {
    color: "",
    icon: <BriefcaseBusiness className={iconClasses} />,
  },
  internship_started: {
    color: "text-green-11",
    icon: <BriefcaseBusiness className={iconClasses} />,
  },
  internship_completed: {
    color: "text-green-11",
    icon: <BadgeCheck className={iconClasses} />,
  },
  internship_updated: {
    color: "text-blue-11",
    icon: <BriefcaseBusiness className={iconClasses} />,
  },
  internship_submitted: {
    color: "text-blue-11",
    icon: <BriefcaseBusiness className={iconClasses} />,
  },
  internship_rejected: {
    color: "text-red-11",
    icon: <BadgeX className={iconClasses} />,
  },
  internship_deleted: {
    color: "text-red-11",
    icon: <BriefcaseBusiness className={iconClasses} />,
  },
};

export class ActivityHelper {
  static getActivityIcon = (activityType: ActivityType): JSX.Element => {
    const config = activityConfigs[activityType];

    if (!config) {
      return <BadgeQuestionMark className="text-gray-11 size-5" />;
    }

    // Clone the icon and apply the color class
    const iconWithColor = {
      ...config.icon,
      props: {
        ...config.icon.props,
        className: `${config.icon.props.className} ${config.color}`,
      },
    };

    return iconWithColor;
  };

  static getActivityColor = (activityType: ActivityType): string => {
    return activityConfigs[activityType]?.color ?? "text-gray-11";
  };
}
