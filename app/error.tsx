"use client";

import { ArrowLeft } from "lucide-react";
import * as motion from "motion/react-client";

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
    <div className="bg-background flex min-h-screen flex-col">
      <div className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
        <div className="flex flex-col items-center space-y-6 sm:space-y-8">
          {/* Big Title */}
          <h1 className="font-heading text-6xl font-semibold sm:text-7xl md:text-8xl lg:text-9xl">
            Ouch! :|
          </h1>

          <div className="flex max-w-md flex-col items-center space-y-4 sm:max-w-xl sm:space-y-6">
            <h2 className="text-xl font-medium sm:text-2xl">
              Sorry, something went wrong.
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
              Apologies, an error occurred while processing your request. Please
              contact us if the issue persists.
            </p>
          </div>

          <Button
            size={"lg"}
            className="w-full transition-none"
            onClick={reset}
            asChild
          >
            <motion.button whileTap={{ scale: 0.85 }}>
              <ArrowLeft className="mr-2 size-4" />
              Go Back
            </motion.button>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
