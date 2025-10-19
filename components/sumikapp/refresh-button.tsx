"use client";

import React from "react";

import { IconRefresh } from "@tabler/icons-react";
import * as motion from "motion/react-client";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

interface RefreshButtonProps {
  refetch: () => void;
  isFetching: boolean;
}

export default function RefreshButton({
  refetch,
  isFetching,
}: RefreshButtonProps) {
  return (
    <Button
      variant={"outline"}
      size={"sm"}
      className="transition-none"
      onClick={() => refetch()}
      disabled={isFetching}
      asChild
    >
      <motion.button whileTap={{ scale: 0.85 }}>
        <IconRefresh className={cn("size-4", isFetching && "animate-spin")} />
        {isFetching ? "Refreshing..." : "Refresh"}
      </motion.button>
    </Button>
  );
}
