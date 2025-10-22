import React from "react";

export default function OnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 md:mb-8">
          <h1 className="mb-1 text-2xl font-bold md:text-3xl">
            Set Up Your Account
          </h1>
          <p className="text-muted-foreground text-sm">
            Complete the steps below to get started.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
          {children}
        </div>
      </div>
    </div>
  );
}
