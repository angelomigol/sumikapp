export interface DashboardStats {
  total_users: number;
  new_users_this_month: number;
  pending_verifications: number;
  active_users_30_days: number;
  currently_online: number;
  new_users_growth_percent: number;
  active_users_growth_percent: number;
  new_users_trend: string;
  active_users_trend: string;
  new_users_trend_positive: boolean;
  active_users_trend_positive: boolean;
  online_percentage: number;
  activity_rate: number;
}

export interface UserStatistics {
  total_users: number;
  new_users_this_month: number;
  pending_verifications: number;
  active_users_30_days: number;
  new_users_growth_percent: number;
  active_users_growth_percent: number;
  weekly_growth_percent: number;
  total_trainees: number;
  total_coordinators: number;
  total_supervisors: number;
  total_admins: number;
  active_status_users: number;
  inactive_status_users: number;
  suspended_users: number;
  pending_status_users: number;
  recently_active_7_days: number;
  new_users_this_week: number;
  new_users_last_week: number;
  active_user_percentage: number;
  pending_percentage: number;
}

export interface StatCard {
  title: string;
  value: string | number;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  help: string;
  icon: React.ElementType;
}
