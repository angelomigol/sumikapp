import React from "react";

import { IconBell } from "@tabler/icons-react";

import { AdminAlert } from "@/schemas/dashboard/dashboard.schema";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export default function AlertsDropdown({ alerts }: { alerts: AdminAlert[] }) {
  const criticalAlerts = alerts.filter(
    (alert) => alert.severity === "high" || alert.severity === "critical"
  );

  return (
    <div className="relative">
      <Button variant="outline" size="sm" className="relative">
        <IconBell className="h-4 w-4" />
        {criticalAlerts.length > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 size-5 rounded-full p-0 text-xs"
          >
            {criticalAlerts.length}
          </Badge>
        )}
      </Button>
    </div>
  );
}
