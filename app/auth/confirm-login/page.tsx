"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import pathsConfig from "@/config/paths.config";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") || "/";

  // Auto-redirect if the page is accessed directly with the token
  useEffect(() => {
    handleClick();
  }, []);

  const handleClick = () => {
    if (token_hash && type) {
      window.location.href = `/auth/confirm?${new URLSearchParams({
        token_hash,
        type,
        next,
      })}`;
    } else {
      toast.error("Invalid token", {
        description: "Please try logging in again.",
      });
    }
  };

  return (
    <div className="space-y-6 text-center text-white">
      <span className="text-xl font-bold">Verify Your Email</span>
      <p className="text-sm">
        Click the button below to complete your sign-in process.
      </p>

      <Button
        variant={"secondary"}
        size={"sm"}
        className={cn(
          "w-full bg-[#fab300] font-bold text-black hover:bg-[#d49000] hover:text-black"
        )}
        onClick={handleClick}
      >
        Confirm email
      </Button>

      <Button variant={"link"} size={"sm"} className="text-white" asChild>
        <Link
          href={pathsConfig.app.index}
          className="text-white/80 underline transition-colors hover:text-white"
        >
          Go to Sign In Page
        </Link>
      </Button>
    </div>
  );
}
export default function VerifyEmail() {
  return (
    <Suspense fallback={<Loader2 className="animate-spin" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
