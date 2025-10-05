import { z } from "zod";

// Schema for static paths
const StaticPathsSchema = z.object({
  auth: z.object({
    callback: z.string().min(1),
    verifyMfa: z.string().min(1),
    passwordUpdate: z.string().min(1),
    passwordReset: z.string().min(1),
  }),
  app: z.object({
    index: z.string().min(1),
    dashboard: z.string().min(1),
    placement: z.string().min(1),
    requirements: z.string().min(1),
    attendance: z.string().min(1),
    activity: z.string().min(1),
    weeklyReports: z.string().min(1),
    sections: z.string().min(1),
    reports: z.string().min(1),
    reviewReports: z.string().min(1),
    trainees: z.string().min(1),
    evaluations: z.string().min(1),
    users: z.string().min(1),
    addUsers: z.string().min(1),
    partners: z.string().min(1),
    logs: z.string().min(1),
    settings: z.string().min(1),
    internshipDetails: z.string().min(1),
  }),
});

// Static paths configuration
const staticPaths = StaticPathsSchema.parse({
  auth: {
    callback: "/auth/callback",
    verifyMfa: "/auth/verify",
    passwordReset: "/auth/password-reset",
    passwordUpdate: "/update-password",
  },
  app: {
    index: "/",
    dashboard: "/dashboard",
    placement: "/dashboard/placement",
    requirements: "/dashboard/requirements",
    attendance: "/dashboard/attendance",
    activity: "/dashboard/activity",
    weeklyReports: "/dashboard/weekly-reports",
    sections: "/dashboard/sections",
    reviewReports: "/dashboard/review-reports",
    reports: "/dashboard/reports",
    trainees: "/dashboard/trainees",
    evaluations: "/dashboard/evaluations",
    users: "/dashboard/users",
    addUsers: "/dashboard/users/add",
    partners: "/dashboard/industry-partners",
    logs: "/dashboard/logs",
    settings: "/dashboard/settings",
    internshipDetails: "/dashboard/settings/internship-details",
  },
});

// Dynamic path generators (type-safe functions)
const dynamicPaths = {
  userDetails: (id: string) => `/dashboard/users/${id}`,

  // Sidebar section routes
  sectionOverview: (slug: string) => `/dashboard/sections/${slug}`,
  sectionTrainees: (slug: string) => `/dashboard/sections/${slug}/trainees`,
  addSectionTrainees: (slug: string) =>
    `/dashboard/sections/${slug}/trainees/add`,
  sectionAnnouncements: (slug: string) =>
    `/dashboard/sections/${slug}/announcements`,
  sectionRequirements: (slug: string) =>
    `/dashboard/sections/${slug}/requirements`,
  sectionReports: (slug: string) =>
    `/dashboard/sections/${slug}/weekly-reports`,
  sectionSettings: (slug: string) => `/dashboard/sections/${slug}/settings`,
  sectionMembers: (slug: string) => `/dashboard/sections/${slug}/members`,
  viewReport: (id: string, slug: string) =>
    `/dashboard/sections/${slug}/weekly-reports/${id}`,
  sectionTraineeDetails: (id: string, slug: string) =>
    `/dashboard/sections/${slug}/trainees/${id}`,

  attendanceReport: (id: string) => `/dashboard/attendance/${id}`,
  activityReport: (id: string) => `/dashboard/activity/${id}`,
  weeklyReport: (id: string) => `/dashboard/weekly-reports/${id}`,

  reviewReport: (id: string, slug: string) =>
    `/dashboard/review-reports/${slug}/${id}`,
  traineeDetails: (id: string) => `/dashboard/trainees/${id}`,
  evaluteTrainee: (id: string) => `/dashboard/evaluations/${id}`,
} as const;

const pathsConfig = {
  ...staticPaths,
  dynamic: dynamicPaths,
} as const;

export default pathsConfig;
