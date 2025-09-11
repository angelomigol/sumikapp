import Link from "next/link";

import { TriangleAlertIcon } from "lucide-react";

import pathsConfig from "@/config/paths.config";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AuthCallbackErrorPageProps {
  searchParams: Promise<{
    error: string;
  }>;
}

export default async function AuthCallbackErrorPage(
  props: AuthCallbackErrorPageProps
) {
  const { error } = await props.searchParams;

  return (
    <>
      <Alert variant={"destructive"}>
        <TriangleAlertIcon className={"w-4"} />
        <AlertTitle>Authentication Error</AlertTitle>

        <AlertDescription>
          {error ?? "Sorry, we could not authenticate you. Please try again."}
        </AlertDescription>
      </Alert>

      <div className="flex justify-center text-sm">
        <Link
          href={pathsConfig.app.index}
          className="text-white/80 underline transition-colors hover:text-white"
        >
          Go to Sign In Page
        </Link>
      </div>
    </>
  );
}
