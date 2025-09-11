"use client";

import React from "react";
import Link from "next/link";

import { ChevronRight } from "lucide-react";

import pathsConfig from "@/config/paths.config";
import { Section } from "@/hooks/use-sections";

export default function SectionCard({ section }: { section: Section }) {
  return (
    <Link
      href={pathsConfig.dynamic.sectionOverview(section.title)}
      className="group hover:bg-secondary/20 active:bg-secondary/50 dark:shadow-primary/20 relative flex h-36 flex-col rounded-lg border transition-all hover:shadow-xs active:shadow-lg"
    >
      <div className="flex items-center justify-between p-4">
        <div className="text-muted-foreground group-hover:text-secondary-foreground align-super text-sm font-medium transition-colors">
          {section.title}
        </div>
        <ChevronRight className="size-4" />
      </div>
    </Link>
  );
}
