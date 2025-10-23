"use client";

import { useState } from "react";

import { ChevronDownIcon, Download } from "lucide-react";
import * as motion from "motion/react-client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { If } from "@/components/sumikapp/if";

const options = [
  {
    label: "Student",
    description: "Download template to bulk import student/trainee accounts.",
  },
  {
    label: "Coordinator",
    description: "Download template to bulk import coordinator accounts.",
  },
  {
    label: "Supervisor",
    description: "Download template to bulk import supervisor accounts.",
  },
  {
    label: "Admin",
    description: "Download template to bulk import admin accounts.",
  },
];

export default function DownloadButtonGroup() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const selectedOption = options[selectedIndex];

    setIsDownloading(true);
  };

  return (
    <div className="divide-primary-foreground/30 inline-flex w-fit divide-x rounded-md shadow-sm">
      <Button
        size={"sm"}
        className="rounded-none rounded-l-md shadow-none transition-none focus-visible:z-10"
        onClick={handleDownload}
        disabled={isDownloading}
        asChild
      >
        <motion.button whileTap={{ scale: 0.9 }}>
          <If
            condition={isDownloading}
            fallback={
              <>
                <Download className="size-4" />
                {`Download ${options[Number(selectedIndex)].label} Template`}
              </>
            }
          >
            <Download className="size-4 animate-pulse" />
            Downloading...
          </If>
        </motion.button>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size={"icon-sm"}
            className="rounded-none rounded-r-md focus-visible:z-10"
            disabled={isDownloading}
          >
            <ChevronDownIcon />
            <span className="sr-only">Select option</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          sideOffset={4}
          align="end"
          className="max-w-64 md:max-w-xs!"
        >
          <DropdownMenuRadioGroup
            value={String(selectedIndex)}
            onValueChange={(value) => setSelectedIndex(Number(value))}
          >
            {options.map((option, index) => (
              <DropdownMenuRadioItem
                key={option.label}
                value={String(index)}
                className="items-start [&>span]:pt-1.5"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm">{`Download ${option.label} Template`}</span>
                  <span className="text-muted-foreground text-xs">
                    {option.description}
                  </span>
                </div>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
