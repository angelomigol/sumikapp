"use client";

import dynamic from "next/dynamic";

import { QueryClientProvider } from "@tanstack/react-query";

import appConfig from "@/config/app.config";
import authConfig from "@/config/auth.config";

import { CaptchaProvider } from "@/utils/captcha/client/captcha-provider";

import { AuthProvider } from "./auth-provider";
import { getQueryClient } from "./get-query-client";
import { ThemeProvider } from "./theme-provider";

const queryClient = getQueryClient();

const captchaSiteKey = authConfig.captchaTokenSiteKey;

const CaptchaTokenSetter = dynamic(async () => {
  if (!captchaSiteKey) {
    return Promise.resolve(() => null);
  }

  const { CaptchaTokenSetter } = await import(
    "@/utils/captcha/client/captcha-token-setter"
  );

  return {
    default: CaptchaTokenSetter,
  };
});

export function RootProviders({
  theme = appConfig.theme,
  children,
}: React.PropsWithChildren<{
  theme?: string;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <CaptchaProvider>
        <CaptchaTokenSetter siteKey={captchaSiteKey} />
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            enableSystem
            disableTransitionOnChange
            defaultTheme={theme}
            enableColorScheme={false}
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </CaptchaProvider>
    </QueryClientProvider>
  );
}
