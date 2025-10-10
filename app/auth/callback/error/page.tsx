import Link from "next/link";

import { AuthError } from "@supabase/supabase-js";
import { TriangleAlertIcon } from "lucide-react";

import pathsConfig from "@/config/paths.config";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ResendAuthLinkForm } from "@/components/auth/resend-auth-link-form";

interface AuthCallbackErrorPageProps {
  searchParams: Promise<{
    error: string;
    callback?: string;
    email?: string;
    code?: AuthError["code"];
  }>;
}

export default async function AuthCallbackErrorPage(
  props: AuthCallbackErrorPageProps
) {
  const { error, callback, code } = await props.searchParams;
  const signInPath = pathsConfig.app.index;
  const redirectPath = callback ?? pathsConfig.auth.callback;

  return (
    <>
      <Alert variant={"destructive"}>
        <TriangleAlertIcon className="w-4" />
        <AlertTitle>Authentication Error</AlertTitle>

        <AlertDescription>
          {error ?? "Sorry, we could not authenticate you. Please try again."}
        </AlertDescription>
      </Alert>

      <div className="w-full text-center">
        <AuthCallbackForm
          code={code}
          signInPath={signInPath}
          redirectPath={redirectPath}
        />
      </div>
    </>
  );
}

function AuthCallbackForm(props: {
  signInPath: string;
  redirectPath?: string;
  code?: AuthError["code"];
}) {
  switch (props.code) {
    case "otp_expired":
      return <ResendAuthLinkForm redirectPath={props.redirectPath} />;
    default:
      return <SignInButton signInPath={props.signInPath} />;
  }
}

function SignInButton(props: { signInPath: string }) {
  return (
    <Button variant={"link"} size={"sm"} className="text-white" asChild>
      <Link
        href={props.signInPath}
        className="text-white/80 underline transition-colors hover:text-white"
      >
        Go to Sign In Page
      </Link>
    </Button>
  );
}
