"use client";

import { useMemo, useState } from "react";

import { format } from "date-fns";
import {
  ChevronDown,
  Filter,
  MoreVertical,
  RefreshCcw,
  Search,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { LogEntry, useLogStore } from "@/utils/logger/log-store";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PageTitle from "@/components/sumikapp/page-title";

import LogsSidebarFilter from "./logs-sidebar-filter";

const levelColors = {
  debug: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  warn: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  fatal: "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100",
};

export default function LogsContainer() {
  const [filterOpen, setFilterOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // const [filters, setFilters] = useState<Record<string, any>>({});

  const { logs, clearLogs, filterLogs } = useLogStore();

  // const filteredLogs = useMemo(() => {
  //   const allFilters = { ...filters, search: searchTerm };
  //   return filterLogs(allFilters);
  // }, [filters, searchTerm, filterLogs]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      {/* <div>
        <PageTitle text={"Events & Logs"} />
        <p className="text-muted-foreground text-sm">
          Track, analyze, and act on application behaviors efficiently.
          <span className="ml-2 text-xs">({filteredLogs.length} entries)</span>
        </p>
      </div>

      <Card className={cn("py-0")}>
        <div className="grid grid-cols-3 md:grid-cols-4">
          {filterOpen && (
            <LogsSidebarFilter
              onFiltersChange={setFilters}
              currentFilters={filters}
              logs={logs}
            />
          )}

          <div
            className={`col-start-1 col-end-5 row-start-1 row-end-4 ${
              filterOpen ? "lg:col-start-2" : "lg:col-start-1"
            }`}
          >
            <div>
              <div className="border-muted flex items-center gap-2 border-b p-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size={"icon"}
                      variant={"outline"}
                      onClick={() => setFilterOpen((prev) => !prev)}
                    >
                      <Filter />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle filter</p>
                  </TooltipContent>
                </Tooltip>
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search..."
                    type="search"
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size={"icon"}
                      variant={"outline"}
                      onClick={handleRefresh}
                    >
                      <RefreshCcw />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh</p>
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size={"icon"} variant={"outline"}>
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40" align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Export to CSV</DropdownMenuItem>
                    <DropdownMenuItem>Export to JSON</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="relative w-full overflow-auto">
                {filteredLogs.length === 0 ? (
                  <div className="text-muted-foreground flex h-32 items-center justify-center">
                    <p>No logs to display.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-background sticky top-0">
                      <TableRow>
                        <TableHead className="w-[100px]">Timestamp</TableHead>
                        <TableHead className="w-[80px]">Level</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead className="w-[100px]">Env</TableHead>
                        <TableHead className="w-[50px]">Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <LogRow key={log.id} log={log} />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card> */}
    </>
  );
}

function LogRow({ log }: { log: LogEntry }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasData = log.data && Object.keys(log.data).length > 0;

  return (
    <>
      <TableRow>
        <TableCell className="font-mono text-xs">
          {format(log.timestamp, "PPp")}
        </TableCell>
        <TableCell>
          <Badge
            className={cn(levelColors[log.level as keyof typeof levelColors])}
          >
            {log.level.toUpperCase()}
          </Badge>
        </TableCell>
        <TableCell className="max-w-md truncate" title={log.message}>
          {log.message}
        </TableCell>
        <TableCell className="text-muted-foreground text-xs">
          {log.env || "unknown"}
        </TableCell>
        <TableCell>
          {hasData && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant={"ghost"} size={"icon"}>
                  <ChevronDown
                    className={cn(
                      "scale-125 transition-transform duration-200",
                      {
                        "rotate-180 transform": isExpanded,
                      }
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </TableCell>
      </TableRow>
      {hasData && isExpanded && (
        <TableRow>
          <TableCell colSpan={5}>
            <pre className="overflow-x-auto text-xs whitespace-pre-wrap">
              {JSON.stringify(log.data, null, 2)}
            </pre>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
