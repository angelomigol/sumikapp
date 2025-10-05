import { IconLayoutDashboard } from "@tabler/icons-react";
import {
  BookOpen,
  Building,
  CalendarClock,
  ClipboardCheck,
  ClipboardPen,
  FileBarChart,
  FileCheck2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  NotepadText,
  Settings,
  Users2,
} from "lucide-react";
import { z } from "zod";

import { NavigationConfigSchema } from "@/schemas/config/navigation-config.schema";

import pathsConfig from "./paths.config";

const iconClasses = "w-4";

export const sidebarRoutes = [
  {
    label: "Application",
    children: [
      // General route
      {
        label: "Dashboard",
        path: pathsConfig.app.dashboard,
        Icon: <IconLayoutDashboard stroke={2} className={iconClasses} />,
        end: true,
        authorizedRoles: ["admin", "coordinator", "supervisor", "trainee"],
      },
      // Role-specific routes

      // Trainee routes
      {
        label: "Placement",
        path: pathsConfig.app.placement,
        Icon: <Building className={iconClasses} />,
        authorizedRoles: ["trainee"],
        allowedOJTStatus: ["not started", "dropped"],
      },
      {
        label: "Requirements",
        path: pathsConfig.app.requirements,
        Icon: <NotepadText className={iconClasses} />,
        authorizedRoles: ["trainee"],
        allowedOJTStatus: ["not started", "completed", "active", "dropped"],
      },

      // Extend trainee routes if trainee status is 'active' or 'completed'
      {
        label: "Attendance Reports",
        path: pathsConfig.app.attendance,
        Icon: <CalendarClock className={iconClasses} />,
        authorizedRoles: ["trainee"],
        allowedOJTStatus: ["completed", "active"],
      },
      {
        label: "Activity Reports",
        path: pathsConfig.app.activity,
        Icon: <ClipboardCheck className={iconClasses} />,
        authorizedRoles: ["trainee"],
        allowedOJTStatus: ["completed", "active"],
      },
      {
        label: "Weekly Reports",
        path: pathsConfig.app.weeklyReports,
        Icon: <ClipboardCheck className={iconClasses} />,
        authorizedRoles: ["trainee"],
        allowedOJTStatus: ["completed", "active"],
      },

      // Coordinator routes
      {
        label: "Sections",
        path: pathsConfig.app.sections,
        Icon: <BookOpen className={iconClasses} />,
        authorizedRoles: ["coordinator"],
      },
      // {
      //   label: "Reports",
      //   path: pathsConfig.app.reports,
      //   Icon: <FileBarChart className={iconClasses} />,
      //   authorizedRoles: ["coordinator"],
      // },

      // Supervisor routes
      {
        label: "Trainees",
        path: pathsConfig.app.trainees,
        Icon: <Users2 className={iconClasses} />,
        authorizedRoles: ["supervisor"],
      },
      {
        label: "Evaluations",
        path: pathsConfig.app.evaluations,
        Icon: <ClipboardPen className={iconClasses} />,
        authorizedRoles: ["supervisor"],
      },
      {
        label: "Reports",
        path: pathsConfig.app.reviewReports,
        Icon: <FileCheck2 className={iconClasses} />,
        authorizedRoles: ["supervisor"],
      },

      // Admin routes
      {
        label: "Users",
        path: pathsConfig.app.users,
        Icon: <Users2 className={iconClasses} />,
        authorizedRoles: ["admin"],
      },
      {
        label: "Industry Partners",
        path: pathsConfig.app.partners,
        Icon: <Building className={iconClasses} />,
        authorizedRoles: ["admin"],
      },
      // {
      //   label: "Events/Logs",
      //   path: pathsConfig.app.logs,
      //   Icon: <Logs className={iconClasses} />,
      //   authorizedRoles: ["admin"],
      // },
    ],
  },
] satisfies z.infer<typeof NavigationConfigSchema>["routes"];

export const navigationConfig = NavigationConfigSchema.parse({
  routes: sidebarRoutes,
  style: process.env.NEXT_PUBLIC_NAVIGATION_STYLE,
  sidebarCollapsed: process.env.NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED,
});

export const createSectionRoutes = (slug: string) =>
  [
    {
      label: "Application",
      children: [
        {
          label: "Overview",
          path: pathsConfig.dynamic.sectionOverview(slug),
          Icon: <LayoutDashboard className={iconClasses} />,
          end: true,
        },
        {
          label: "Trainees",
          path: pathsConfig.dynamic.sectionTrainees(slug),
          Icon: <GraduationCap className={iconClasses} />,
        },
        {
          label: "Announcements",
          path: pathsConfig.dynamic.sectionAnnouncements(slug),
          Icon: <Megaphone className={iconClasses} />,
        },
        {
          label: "Requirements",
          path: pathsConfig.dynamic.sectionRequirements(slug),
          Icon: <NotepadText className={iconClasses} />,
        },
        {
          label: "Weekly Reports",
          path: pathsConfig.dynamic.sectionReports(slug),
          Icon: <FileText className={iconClasses} />,
        },
      ],
    },
    {
      label: "Settings",
      children: [
        {
          label: "Settings",
          path: pathsConfig.dynamic.sectionSettings(slug),
          Icon: <Settings className={iconClasses} />,
        },
        {
          label: "Members",
          path: pathsConfig.dynamic.sectionMembers(slug),
          Icon: <Users2 className={iconClasses} />,
        },
      ],
    },
  ] satisfies z.infer<typeof NavigationConfigSchema>["routes"];

export const createSectionNavigation = (slug: string) =>
  NavigationConfigSchema.parse({
    routes: createSectionRoutes(slug),
    style: process.env.NEXT_PUBLIC_NAVIGATION_STYLE,
    sidebarCollapsed: process.env.NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED,
  });

export const settingsNavConfig = [
  {
    label: "Profile",
    path: "/dashboard/settings",
    authorizedRoles: ["trainee", "admin", "coordinator", "supervisor"],
  },
  {
    label: "Skills",
    path: "/dashboard/settings/skills",
    authorizedRoles: ["trainee"],
  },
  {
    label: "Internship Details",
    path: "/dashboard/settings/internship-details",
    authorizedRoles: ["trainee"],
  },
];
