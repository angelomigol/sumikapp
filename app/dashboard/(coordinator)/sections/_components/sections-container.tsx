"use client";

import React from "react";

import { CircleSlash2 } from "lucide-react";

import { useFetchSections } from "@/hooks/use-sections";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import AddSectionSheet from "./add-section-sheet";
import SectionCard from "./section-card";

export default function SectionsContainer() {
  const { data = [], isLoading, error } = useFetchSections();

  if (isLoading) {
    return <LoadingOverlay fullPage />;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <PageTitle text={"My Sections"} />

        <AddSectionSheet />
      </div>

      <If
        condition={data.length === 0}
        fallback={
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((item) => (
              <SectionCard key={item.id} section={item} />
            ))}
          </div>
        }
      >
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleSlash2 />
            </EmptyMedia>
            <EmptyTitle>No sections yet</EmptyTitle>
            <EmptyDescription>
              Looks like you haven&#39;t created any sections yet. Start adding
              by clicking the &#34;New Section&#34; button.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </If>
    </>
  );
}
