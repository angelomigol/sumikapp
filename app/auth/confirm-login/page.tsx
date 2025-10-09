import { Suspense } from "react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";

function ConfirmLoginContent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Confirm Your Sign In
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Click the button below to complete your sign in to SumikAPP Web
          </p>
        </div>

        <ConfirmButton />

        <p className="text-center text-xs text-gray-500">
          This extra step helps protect your account from automated security
          scanners.
        </p>
      </div>
    </div>
  );
}

function ConfirmButton() {
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const confirmationUrl = searchParams.get("confirmation_url");

  if (!confirmationUrl) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">
          Invalid confirmation link. Please request a new sign in link.
        </p>
      </div>
    );
  }

  return (
    <form action={confirmationUrl} method="GET">
      <Button
        type="submit"
        className="w-full bg-[#fab300] font-bold text-black hover:bg-[#d49000]"
      >
        Sign In to SumikAPP Web
      </Button>
    </form>
  );
}

export default function ConfirmLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmLoginContent />
    </Suspense>
  );
}
