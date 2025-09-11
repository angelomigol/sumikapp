"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table";

export interface AuthLog {
  id: string;
  created_at: string;
  event_type: string;
  ip_address?: string;
  user_agent?: string;
  user_id: string;
  details?: Record<string, any>;
  city?: string;
  country?: string;
  device?: string;
  browser?: string;
  os?: string;
}

const getEventTypeVariant = (eventType: string) => {
  const variants = {
    sign_up: "default",
    sign_in: "secondary",
    sign_out: "outline",
    password_recovery: "destructive",
    user_updated: "secondary",
    token_refreshed: "outline",
    user_deleted: "destructive",
    password_changed: "default",
    email_verified: "default",
    magic_link: "secondary",
  } as const;

  return variants[eventType as keyof typeof variants] || "outline";
};

const formatEventType = (eventType: string) => {
  return eventType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const truncateUserAgent = (userAgent: string | undefined, maxLength = 60) => {
  if (!userAgent) return "N/A";
  return userAgent.length > maxLength
    ? `${userAgent.substring(0, maxLength)}...`
    : userAgent;
};

export const authLogsColumns: ColumnDef<AuthLog>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "event_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event Type" />
    ),
    cell: ({ row }) => {
      const eventType = row.getValue("event_type") as string;
      return (
        <Badge variant={getEventTypeVariant(eventType)} className="font-medium">
          {formatEventType(eventType)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date & Time" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {formatDate(new Date(date), "MMM dd, yyyy")}
          </span>
          <span className="text-muted-foreground text-xs">
            {formatDate(new Date(date), "HH:mm:ss")}
          </span>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "ip_address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="IP Address" />
    ),
    cell: ({ row }) => {
      const ipAddress = row.getValue("ip_address") as string;
      return <span className="font-mono text-sm">{ipAddress || "N/A"}</span>;
    },
    enableHiding: false,
  },
  {
    accessorKey: "user_agent",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Device Info" />
    ),
    cell: ({ row }) => {
      const userAgent = row.getValue("user_agent") as string;
      const details = row.original.details;

      // Extract device info from user agent or details
      const device = details?.device || row.original.device;
      const browser = details?.browser || row.original.browser;
      const os = details?.os || row.original.os;

      if (device || browser || os) {
        return (
          <div className="flex flex-col space-y-1">
            {device && <span className="text-xs font-medium">{device}</span>}
            {browser && (
              <span className="text-muted-foreground text-xs">{browser}</span>
            )}
            {os && <span className="text-muted-foreground text-xs">{os}</span>}
          </div>
        );
      }

      return (
        <span
          className="text-muted-foreground block max-w-[200px] truncate text-xs"
          title={userAgent}
        >
          {truncateUserAgent(userAgent)}
        </span>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => {
      const city = row.original.city || row.original.details?.city;
      const country = row.original.country || row.original.details?.country;

      if (city && country) {
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{city}</span>
            <span className="text-muted-foreground text-xs">{country}</span>
          </div>
        );
      }

      if (country) {
        return <span className="text-sm">{country}</span>;
      }

      return <span className="text-muted-foreground">Unknown</span>;
    },
    enableHiding: false,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const log = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(log.id)}
            >
              Copy log ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(log.ip_address || "")
              }
            >
              Copy IP address
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                // Open details in a modal or navigate to details page
                console.log("View details:", log);
              }}
            >
              View details
            </DropdownMenuItem>
            {log.details && (
              <DropdownMenuItem
                onClick={() => {
                  console.log(
                    "Raw details:",
                    JSON.stringify(log.details, null, 2)
                  );
                  // You could open a modal with JSON viewer here
                }}
              >
                View raw data
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
