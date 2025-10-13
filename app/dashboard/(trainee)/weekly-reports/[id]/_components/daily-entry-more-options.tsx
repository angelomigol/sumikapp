"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

export default function DailyEntryMoreOptions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Slide Up Animation</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="data-[state=closed]:slide-out-to-left-0 data-[state=open]:slide-in-from-left-0 data-[state=closed]:slide-out-to-bottom-20 data-[state=open]:slide-in-from-bottom-20 data-[state=closed]:zoom-out-100 w-56 duration-400">
        <DropdownMenuLabel>Apps notification</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="justify-between"
            onSelect={(event) => event.preventDefault()}
          >
            Mark as Absent
          </DropdownMenuItem>
          <DropdownMenuItem
            className="justify-between"
            onSelect={(event) => event.preventDefault()}
          >
            Mark as Holiday
          </DropdownMenuItem>
          <DropdownMenuItem
            className="justify-between"
            onSelect={(event) => event.preventDefault()}
          >
           
          </DropdownMenuItem>
          <DropdownMenuItem
            className="justify-between"
            onSelect={(event) => event.preventDefault()}
          >
          </DropdownMenuItem>
          <DropdownMenuItem
            className="justify-between"
            onSelect={(event) => event.preventDefault()}
          >
          
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
