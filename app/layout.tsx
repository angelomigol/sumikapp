import { cn } from "@/lib/utils";

import "./globals.css";

import { cookies } from "next/headers";

import { heading, outfit } from "@/lib/fonts";
import { generateRootMetadata } from "@/lib/root-metadata";

import { Toaster } from "@/components/ui/sonner";
import { RootProviders } from "@/components/root-providers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getTheme();
  const className = getClassName(theme);

  return (
    <html lang="en" className={className} suppressHydrationWarning>
      <body>
        <RootProviders theme={theme}>{children}</RootProviders>

        <Toaster
          expand={true}
          richColors={true}
          closeButton={true}
          theme={theme}
          position="top-right"
        />
      </body>
    </html>
  );
}

function getClassName(theme?: string) {
  const dark = theme === "dark";
  const light = !dark;

  const font = [outfit.variable, heading.variable].reduce<string[]>(
    (acc, curr) => {
      if (acc.includes(curr)) return acc;

      return [...acc, curr];
    },
    []
  );

  return cn("bg-background min-h-screen antialiased", ...font, {
    dark,
    light,
  });
}

async function getTheme() {
  const cookiesStore = await cookies();
  return cookiesStore.get("theme")?.value as "light" | "dark" | "system";
}

export const generateMetadata = generateRootMetadata;
