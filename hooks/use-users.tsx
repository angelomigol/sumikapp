import { useCallback, useMemo } from "react";

import {
  IconUserCheck,
  IconUserScan,
  IconUsersGroup,
  IconUsersPlus,
} from "@tabler/icons-react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import { Role } from "@/lib/constants";

import { formatStatValue } from "@/utils/shared";
import { useSupabase } from "@/utils/supabase/hooks/use-supabase";
import { Database, Tables } from "@/utils/supabase/supabase.types";

import {
  StatCard,
  UserStatistics,
} from "@/schemas/dashboard/users-stats-card.schema";

import { AddAccountFormValues } from "@/app/dashboard/(admin)/users/schema/add-account.schema";
import {
  createUserAction,
  getUserByIdAction,
  getUsersAction,
  updateUserAction,
} from "@/app/dashboard/(admin)/users/server/server-actions";

type User = Tables<"users">;
export type BaseUser = {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  role: Role;
  created_at: string;
  last_login: string;
  deleted_at?: string;
  status: Database["public"]["Enums"]["user_status"];
};

type TraineeDetails = {
  role: "trainee";
  student_id_number: string;
  course: string;
  section: string;
  address: string;
  mobile_number: string;
};

type CoordinatorDetails = {
  role: "coordinator";
  department: string;
};

type SupervisorDetails = {
  role: "supervisor";
  position: string;
  department: string;
  telephone_number: string;
  company_name: string;
  company_address: string;
  company_contact_no: string;
  nature_of_business: string;
};

type AdminDetails = {
  role: "admin";
};

export type NormalizedUser =
  | (BaseUser & AdminDetails)
  | (BaseUser & TraineeDetails)
  | (BaseUser & CoordinatorDetails)
  | (BaseUser & SupervisorDetails);

export const USERS_QUERY_KEYS = {
  all: ["supabase:users"] as const,
  detail: (id: string) => ["supabase:user", id] as const,
  stats: ["user-statistics"] as const,
  mutations: {
    create: ["create-user"] as const,
    update: ["update-user"] as const,
  },
};

export function useFetchUsers() {
  return useQuery<User[]>({
    queryKey: USERS_QUERY_KEYS.all,
    queryFn: async () => {
      const result = await getUsersAction(null);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFetchUser(id: string) {
  return useQuery<NormalizedUser>({
    queryKey: USERS_QUERY_KEYS.detail(id),
    queryFn: async () => await getUserByIdAction(id),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

export function useFetchUserStats() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: USERS_QUERY_KEYS.stats,
    queryFn: async (): Promise<UserStatistics | null> => {
      const { data, error } = await supabase
        .from("user_statistics")
        .select("*")
        .single();

      if (error) {
        throw new Error(`Failed to fetch user statistics: ${error.message}`);
      }

      const stats: UserStatistics = {
        total_users: data.total_users ?? 0,
        new_users_this_month: data.new_users_this_month ?? 0,
        pending_verifications: data.pending_verifications ?? 0,
        active_users_30_days: data.active_users_30_days ?? 0,
        new_users_growth_percent: data.new_users_growth_percent ?? 0,
        active_users_growth_percent: data.active_users_growth_percent ?? 0,
        weekly_growth_percent: data.weekly_growth_percent ?? 0,
        total_trainees: data.total_trainees ?? 0,
        total_coordinators: data.total_coordinators ?? 0,
        total_supervisors: data.total_supervisors ?? 0,
        total_admins: data.total_admins ?? 0,
        active_status_users: data.active_status_users ?? 0,
        inactive_status_users: data.inactive_status_users ?? 0,
        suspended_users: data.suspended_users ?? 0,
        pending_status_users: data.pending_status_users ?? 0,
        recently_active_7_days: data.recently_active_7_days ?? 0,
        new_users_this_week: data.new_users_this_week ?? 0,
        new_users_last_week: data.new_users_last_week ?? 0,
        active_user_percentage: data.active_user_percentage ?? 0,
        pending_percentage: data.pending_percentage ?? 0,
      };

      return stats;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useUserStatsCards() {
  const { data: stats, ...query } = useFetchUserStats();

  const cards: StatCard[] = useMemo(() => {
    if (!stats) return [];

    return [
      {
        title: "Total Users",
        value: formatStatValue(stats.total_users),
        trend: {
          value: stats.new_users_growth_percent,
          isPositive: stats.new_users_growth_percent >= 0,
        },
        help: "Total number of registered users",
        icon: IconUsersGroup,
      },
      {
        title: "New Users",
        value: formatStatValue(stats.new_users_this_month),
        trend: {
          value: stats.new_users_growth_percent,
          isPositive: stats.new_users_growth_percent >= 0,
        },
        help: "Users who joined this month",
        icon: IconUsersPlus,
      },
      {
        title: "Pending Verifications",
        value: formatStatValue(stats.pending_verifications),
        help: "Users pending account verification",
        icon: IconUserScan,
      },
      {
        title: "Active Users",
        value: formatStatValue(stats.active_users_30_days),
        trend: {
          value: stats.active_users_growth_percent,
          isPositive: stats.active_users_growth_percent >= 0,
        },
        help: "Users active in the last 30 days",
        icon: IconUserCheck,
      },
    ];
  }, [stats]);

  return {
    cards,
    stats,
    ...query,
  };
}

export function useCreateUser() {
  const mutationKey = USERS_QUERY_KEYS.mutations.create;
  const revalidateUsers = useRevalidateFetchUsers();
  const revalidateStats = useRevalidateFetchUserStats();

  const mutationFn = async (payload: AddAccountFormValues) => {
    const formData = new FormData();

    formData.append("firstName", payload.firstName);
    formData.append("lastName", payload.lastName);
    formData.append("email", payload.email);
    formData.append("role", payload.role);
    if (payload.middleName) {
      formData.append("middleName", payload.middleName);
    }

    switch (payload.role) {
      case "trainee":
        formData.append("studentIdNumber", payload.studentIdNumber);
        formData.append("course", payload.course);
        formData.append("section", payload.section);
        if (payload.address) formData.append("address", payload.address);
        if (payload.mobileNumber)
          formData.append("mobileNumber", payload.mobileNumber);
        break;

      case "coordinator":
        formData.append("coordinatorDepartment", payload.coordinatorDepartment);
        break;

      case "supervisor":
        formData.append("position", payload.position);
        formData.append("supervisorDepartment", payload.supervisorDepartment);
        formData.append("telephoneNumber", payload.telephoneNumber);
        if (payload.companyName)
          formData.append("companyName", payload.companyName);
        if (payload.companyContactNo)
          formData.append("companyContactNo", payload.companyContactNo);
        if (payload.companyAddress)
          formData.append("companyAddress", payload.companyAddress);
        if (payload.natureOfBusiness)
          formData.append("natureOfBusiness", payload.natureOfBusiness);
        break;

      case "admin":
        // No additional fields needed for admin
        break;
    }

    const result = await createUserAction(formData);
    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidateUsers();
      revalidateStats();
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  const mutationKey = USERS_QUERY_KEYS.mutations.update;

  const mutationFn = async (payload: NormalizedUser) => {
    const formData = new FormData();

    formData.append("firstName", payload.first_name);
    formData.append("lastName", payload.last_name);
    formData.append("email", payload.email);
    formData.append("role", payload.role);
    if (payload.middle_name) {
      formData.append("middleName", payload.middle_name);
    }

    switch (payload.role) {
      case "trainee":
        formData.append("studentIdNumber", payload.student_id_number);
        formData.append("course", payload.course);
        formData.append("section", payload.section);
        if (payload.address) formData.append("address", payload.address);
        if (payload.mobile_number)
          formData.append("mobileNumber", payload.mobile_number);
        break;

      case "coordinator":
        formData.append("coordinatorDepartment", payload.department);
        break;

      case "supervisor":
        formData.append("position", payload.position);
        formData.append("supervisorDepartment", payload.department);
        formData.append("telephoneNumber", payload.telephone_number);
        if (payload.company_name)
          formData.append("companyName", payload.company_name);
        if (payload.company_contact_no)
          formData.append("companyContactNo", payload.company_contact_no);
        if (payload.company_address)
          formData.append("companyAddress", payload.company_address);
        if (payload.nature_of_business)
          formData.append("natureOfBusiness", payload.nature_of_business);
        break;

      case "admin":
        // No additional fields needed for admin
        break;
    }

    const result = await updateUserAction(formData);

    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.detail(id),
      });
    },
  });
}

export function useRevalidateFetchUsers() {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.all,
      }),
    [queryClient]
  );
}

export function useRevalidateFetchUser() {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string) =>
      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.detail(id),
      }),
    [queryClient]
  );
}

export function useRevalidateFetchUserStats() {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.stats,
      }),
    [queryClient]
  );
}

export async function prefetchUsers(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: USERS_QUERY_KEYS.all,
    queryFn: async () => {
      const result = await getUsersAction(null);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export async function prefetchUser(queryClient: QueryClient, id: string) {
  await queryClient.prefetchQuery({
    queryKey: USERS_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const result = await getUserByIdAction(id);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}
