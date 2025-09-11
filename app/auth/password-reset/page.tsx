import Link from "next/link";

import pathsConfig from "@/config/paths.config";

import { Button } from "@/components/ui/button";
import { PasswordResetRequestContainer } from "@/components/auth/password-reset-request-container";

export const generateMetadata = async () => {
  return {
    title: "Reset Password",
  };
};

const { callback, passwordUpdate } = pathsConfig.auth;
const redirectPath = `${callback}?next=${passwordUpdate}`;

export default function PasswordResetPage() {
  return (
    <>
      <PasswordResetRequestContainer redirectPath={redirectPath} />

      <div className="flex justify-center">
        <Button variant={"link"} size={"sm"} className="text-white" asChild>
          <Link href={pathsConfig.app.index}>Password recovered?</Link>
        </Button>
      </div>
    </>
  );
}
