"use client";

import React from "react";
import Link from "next/link";

import { UserPlus2 } from "lucide-react";

import pathsConfig from "@/config/paths.config";
import { useFetchUsers, useUserStatsCards } from "@/hooks/use-users";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import InviteUserDialog from "./invite-user-dialog";
import UserStatsCard from "./user-stats-card";
import { userColumns } from "./users-columns";
import { UserTableToolbar } from "./users-table-toolbar";

export default function UserListContainer() {
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error,
  } = useFetchUsers();
  const { cards, isLoading: isLoadingStats } = useUserStatsCards();

  if (!users || isLoadingStats || isLoadingUsers) {
    return <LoadingOverlay fullPage />;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <PageTitle text={"User List"} />

        <div className="flex gap-2">
          {/* <InviteUserDialog /> */}

          <Button size={"sm"} asChild>
            <Link href={pathsConfig.app.addUsers}>
              <UserPlus2 />
              Add Account
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((card, index) => (
          <UserStatsCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            help={card.help}
            trend={card.trend}
          />
        ))}
      </div>

      <DataTable
        data={users}
        columns={userColumns}
        Toolbar={UserTableToolbar}
      />
    </>
  );
}
