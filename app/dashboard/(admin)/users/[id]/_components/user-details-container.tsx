"use client";

import React from "react";
import Link from "next/link";

import { formatDate } from "date-fns";
import { ChevronLeft, Terminal } from "lucide-react";

import pathsConfig from "@/config/paths.config";
import { useFetchUser } from "@/hooks/use-users";

import { getUserStatusConfig } from "@/lib/constants/userStatus";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import NotFoundPage from "@/app/not-found";

import AccountDangerZone from "./account-danger-zone";
import UserAuthLogs from "./user-auth-logs";

export default function UserDetailsContainer(params: { userId: string }) {
  const user = useFetchUser(params.userId);

  if (user.isLoading) {
    return <LoadingOverlay fullPage />;
  }

  if (!user.data) {
    return <NotFoundPage />;
  }

  const displayName = [
    user.data.first_name,
    user.data.middle_name,
    user.data.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const status = getUserStatusConfig(user.data.status);

  return (
    <>
      <div className="flex items-center gap-4">
        <Button asChild size={"icon"} variant={"outline"}>
          <Link href={pathsConfig.app.users}>
            <ChevronLeft />
          </Link>
        </Button>
        <PageTitle text={`User Details: ${displayName}`} />
        <Badge variant={"outline"}>{user.data.id}</Badge>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs" disabled={true}>
            Auth Logs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overview</span>

                <Badge
                  className={`capitalize ${status.badgeColor}`}
                >{`Status: ${status.label}`}</Badge>
              </CardTitle>
              <CardDescription>
                Profile details, including name, contact, role, and status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input
                    title={user.data.first_name}
                    value={user.data.first_name}
                    readOnly
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Middle Name</Label>
                  <Input
                    title={user.data.middle_name}
                    value={user.data.middle_name}
                    readOnly
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input
                    title={user.data.last_name}
                    value={user.data.last_name}
                    readOnly
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input
                    title={user.data.email}
                    value={user.data.email}
                    readOnly
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Input
                    title={user.data.role}
                    value={user.data.role}
                    readOnly
                    className="capitalize"
                  />
                </div>
              </div>

              <div className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3">
                <Terminal className="size-4" />
                <div className="grid gap-1.5 font-normal">
                  <p className="text-sm leading-none font-medium">
                    Last Login At
                  </p>
                  {user.data.last_login && (
                    <p className="text-sm">
                      {formatDate(user.data.last_login, "PPPPpppp")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <AccountDangerZone deletedAt={user.data.deleted_at} />
        </TabsContent>

        <TabsContent value="logs">
          <UserAuthLogs />
        </TabsContent>
      </Tabs>
    </>
  );
}
