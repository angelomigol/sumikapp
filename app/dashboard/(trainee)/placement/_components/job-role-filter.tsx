"use client";

import { Briefcase, Check } from "lucide-react";

import { jobRoles } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export default function JobRoleFilter({
  selectedRoles,
  onFilterChange,
}: {
  selectedRoles: string[];
  onFilterChange: (roles: string[]) => unknown;
}) {
  const handleSelect = (value: string) => {
    const newSelected = selectedRoles.includes(value)
      ? selectedRoles.filter((role) => role !== value)
      : [...selectedRoles, value];
    onFilterChange(newSelected);
  };

  const clearAll = () => {
    onFilterChange([]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Briefcase />
          Job Role
          {selectedRoles?.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 lg:hidden">
                {selectedRoles?.length}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedRoles?.length > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1">
                    {selectedRoles?.length} selected
                  </Badge>
                ) : (
                  jobRoles
                    .filter((role) => selectedRoles.includes(role.value))
                    .map((role) => (
                      <Badge
                        variant="secondary"
                        key={role.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {role.value}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" sideOffset={8}>
        <Command>
          <CommandInput placeholder="Search job roles..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {jobRoles.map((role) => (
                <CommandItem
                  key={role.value}
                  value={role.value}
                  onSelect={() => handleSelect(role.value)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "border-primary flex size-4 items-center justify-center rounded-sm border",
                        selectedRoles.includes(role.value)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50"
                      )}
                    >
                      {selectedRoles.includes(role.value) && (
                        <Check className="size-3" />
                      )}
                    </div>
                    <span>{role.label}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {selectedRoles?.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={clearAll}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
