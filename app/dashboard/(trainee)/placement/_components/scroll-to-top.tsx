"use client";

import { useEffect, useState } from "react";

import { ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ScrollToTopProps {
  showAfter?: number; // Show button after scrolling this many pixels
  scrollBehavior?: "smooth" | "auto";
  className?: string;
}

export default function ScrollToTop({
  showAfter = 300,
  scrollBehavior = "smooth",
  className = "",
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", toggleVisibility);

    // Clean up the event listener
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: scrollBehavior,
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      size={"icon"}
      onClick={scrollToTop}
      className={`fixed right-6 bottom-6 z-50 transform transition-all duration-300 hover:scale-110 ${className}`}
      aria-label="Scroll to top"
      title="scroll to top"
    >
      <ChevronUp className="size-5" />
    </Button>
  );
}
