"use client";

import { IconActivity, IconBuilding, IconRefresh } from "@tabler/icons-react";
import { FileQuestionMark, Users2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import PageTitle from "../sumikapp/page-title";
import { ScrollArea } from "../ui/scroll-area";
import AlertsDropdown from "./alerts-dropdown";
import DashboardStatsCard from "./dashboard-stats-card";

export default function AdminDashboard() {
  const dashboard = [
    {
      name: "Total Trainees",
      icon: Users2,
      data: {
        main: "...",
        sub: "...",
      },
      tooltip: "Total number of trainee accounts",
    },
    {
      name: "Total OJT Coordinators",
      icon: Users2,
      data: {
        main: "...",
        sub: "...",
      },
      tooltip: "Total number of coordinator accounts",
    },
    {
      name: "Total Industry Partners",
      icon: IconBuilding,
      data: {
        main: "...",
        sub: "...",
      },
      tooltip: "Total number of registered industry partners",
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <PageTitle text={"Admin Dashboard"} />
          <p className="text-muted-foreground text-sm">
            System overview and management tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={"outline"} size={"sm"}>
            <IconRefresh
              className={`size-4`}
              // ${isLoading && "animate-spin"}
            />
            Refresh
          </Button>
          <AlertsDropdown alerts={[]} />
        </div>
      </div>

      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {dashboard.map((card, index) => (
          <DashboardStatsCard
            key={index}
            icon={card.icon}
            title={card.name}
            tooltip={card.tooltip}
            data={card.data}
          />
        ))}
      </div>

      <div className="grid auto-rows-auto grid-cols-3 gap-5 md:grid-cols-6 lg:grid-cols-9">
        <Card className="col-span-3 md:col-span-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconActivity className="size-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex h-80 max-h-80 flex-col gap-4 px-0">
            <ScrollArea className="flex flex-col overflow-hidden">
              <div className="space-y-6">
                {Array.from({ length: 10 }).map((item, index) => (
                  <div key={index} className="flex px-6">
                    <div className="mr-4 flex size-10 items-center justify-center rounded-full border">
                      <FileQuestionMark className="size-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium tracking-tight">
                          {"Title"}
                        </p>

                        <p className="text-muted-foreground text-xs">
                          {"Timestamp"}
                        </p>
                      </div>

                      <p className="text-muted-foreground text-xs">
                        {"Description"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
