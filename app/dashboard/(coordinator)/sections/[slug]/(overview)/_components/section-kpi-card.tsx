import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionKPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | undefined;
  description: string;
}

export default function SectionKPICard({
  icon,
  label,
  value,
  description,
}: SectionKPICardProps) {
  return (
    <Card className="h-full gap-0 p-0">
      <CardHeader className="px-4 pt-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium tracking-tight">
          <div className="bg-opacity-25 bg-blue-3 flex size-6 items-center justify-center rounded-full">
            {icon}
          </div>
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-col p-4">
        <p className="text-2xl font-bold">{value}</p>

        <p className="text-muted-foreground mt-auto text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}
