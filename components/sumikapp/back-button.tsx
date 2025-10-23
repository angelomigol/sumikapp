"use client";

import React from "react";
import Link from "next/link";

import { ChevronLeft } from "lucide-react";

import { Button } from "../ui/button";
import PageTitle from "./page-title";

export default function BackButton({
  title,
  link,
}: {
  title: string;
  link?: string;
}) {
  return (
    <div className="flex w-full items-center gap-2 md:gap-4">
      {link && (
        <Button
          asChild
          size={"icon-sm"}
          variant={"outline"}
          aria-label="Go Back"
        >
          <Link href={link}>
            <ChevronLeft />
            <span className="sr-only">Go Back</span>
          </Link>
        </Button>
      )}
      <PageTitle text={title} />
    </div>
  );
}
