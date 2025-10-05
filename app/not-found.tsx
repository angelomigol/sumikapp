"use client";

import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-1 flex-col">
      <div className="container m-auto flex w-full flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-12">
          <div>
            <h1 className="font-heading text-8xl font-extrabold xl:text-9xl">
              Ouch! :|
            </h1>
          </div>

          <div className="flex flex-col items-center space-y-8">
            <div className="flex flex-col items-center space-y-2.5">
              <h1>Sorry, this page does not exist.</h1>
              <p className="text-muted-foreground">
                Apologies, the page you were looking for was not found
              </p>
            </div>

            <Button variant={"outline"} onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4" />
              Go back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
