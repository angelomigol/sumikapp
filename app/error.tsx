"use client";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  console.error(error);

  return (
    <div className={"flex h-screen flex-1 flex-col"}>
      <div
        className={
          "container m-auto flex w-full flex-1 flex-col items-center justify-center"
        }
      >
        <div className={"flex flex-col items-center space-y-8"}>
          <div>
            <h1 className={"font-heading text-9xl font-semibold"}>Ouch! :|</h1>
          </div>

          <div className={"flex flex-col items-center space-y-8"}>
            <div
              className={
                "flex max-w-xl flex-col items-center space-y-1 text-center"
              }
            >
              <div>
                <h2>Sorry, something went wrong.</h2>
              </div>

              <p className={"text-muted-foreground text-lg"}>
                Apologies, an error occurred while processing your request.
                Please contact us if the issue persists.
              </p>
            </div>

            <Button className={"w-full"} variant={"default"} onClick={reset}>
              <ArrowLeft className={"mr-2 h-4"} />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
