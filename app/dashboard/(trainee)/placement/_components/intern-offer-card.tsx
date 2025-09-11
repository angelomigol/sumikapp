"use client";

import React from "react";

import { ArrowUpRight, Briefcase, Clock, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { InternOffer } from "../schemas/intern-offer.schema";

export default function InternOfferCard({ offer }: { offer: InternOffer }) {
  return (
    <Card className={cn("p-0")}>
      <CardContent className={cn("p-0")}>
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 space-y-4 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="size-12 rounded-md">
                  <AvatarImage src={offer.logo} alt={offer.company} />
                  <AvatarFallback className="rounded-md">
                    {offer.company.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{offer.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {offer.company}
                  </p>
                </div>
              </div>
              <a
                href={offer.view_details}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full">
                  View Details
                  <ArrowUpRight className="ml-2" />
                </Button>
              </a>
            </div>

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
        </div>
      </CardContent>
    </Card>
  );
}
