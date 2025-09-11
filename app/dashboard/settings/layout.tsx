import React from "react";
import { redirect } from "next/navigation";

import { settingsNavConfig } from "@/config/navigation.config";

import { getUserRole } from "../layout";
import SettingsNavigation from "./_components/settings-navigation";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userRole = await getUserRole();

  if (userRole === null) {
    redirect("/");
  }

  const navItems = settingsNavConfig.filter(
    (item) => !item.authorizedRoles || item.authorizedRoles.includes(userRole)
  );

  return (
    <>
      <header className="mx-auto hidden h-4 w-full max-w-7xl md:flex md:h-8 md:items-end">
        <div className="flex w-full items-center justify-between gap-4 px-4 pl-11 md:pl-8 lg:pl-8">
          <h1 className="flex min-w-0 items-center gap-2 text-center text-2xl font-medium max-md:hidden">
            <span className="truncate">Settings</span>
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 md:pl-8">
        <h1 className="mb-4 flex items-center gap-1.5 text-center text-2xl font-medium md:hidden">
          Settings
        </h1>
        <div className="md:md-8 my-4 grid w-full max-w-6xl gap-x-4 md:grid-cols-[200px_minmax(0px,_1fr)]">
          <SettingsNavigation links={navItems} />
          <div className="flex flex-col gap-8">{children}</div>
        </div>
      </main>
    </>
  );
}
