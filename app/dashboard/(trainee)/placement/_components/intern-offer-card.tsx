"use client";

import React from "react";
import Link from "next/link";

import { ArrowUpRight, Briefcase, Clock, MapPin } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { InternOffer } from "../schemas/intern-offer.schema";

export default function InternOfferCard({ offer }: { offer: InternOffer }) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-4">
        <Avatar className="size-14 rounded-md">
          <AvatarImage src={offer.logo ?? undefined} alt={offer.company} />
          <AvatarFallback className="rounded-md">
            {offer.company.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="w-full space-y-1">
          <CardTitle>{offer.title}</CardTitle>
          <CardDescription>{offer.company}</CardDescription>
        </div>
        <CardAction>
          <Button asChild>
            <Link
              href={offer.view_details}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              View Details
              <ArrowUpRight className="ml-2" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row">
          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center text-sm">
              <MapPin className="mr-1 size-4" />
              {offer.location}
            </div>
            <div className="text-muted-foreground flex items-center text-sm">
              <Briefcase className="mr-1 size-4" />
              {offer.type}
            </div>
            <div className="text-muted-foreground flex items-center text-sm">
              <Clock className="mr-1 size-4" />
              Posted:{" "}
              {new Date(offer.date_posted).toLocaleString("en-PH", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
