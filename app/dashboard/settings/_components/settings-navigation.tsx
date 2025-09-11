"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsNavigation({
  links,
}: {
  links: { path: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <nav className="relative z-10 -m-2 mb-4 w-full self-start overflow-x-auto p-2 md:sticky md:top-4 md:mb-0">
      <ul className="mb-0 flex gap-1 md:flex-col">
        {links.map((link) => {
          const isActive = pathname === link.path;

          return (
            <li key={link.path}>
              <Link
                href={link.path}
                className={`hover:bg-accent block rounded-lg p-2 text-sm whitespace-nowrap transition-all ease-in-out active:scale-95 ${
                  isActive
                    ? "bg-accent font-medium"
                    : "hover:text-accent-foreground"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
