"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import { TriangleAlert } from "lucide-react";

import { useGenerateTemplateUrl } from "@/hooks/use-predefined-requirements";

import { Badge } from "@/components/ui/badge";

export default function TemplateFileCell({
  filePath,
  fileName,
}: {
  filePath: string;
  fileName: string;
}) {
  const { generateSignedUrl } = useGenerateTemplateUrl();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getSignedUrl = async () => {
      if (!filePath) return;

      setIsLoading(true);
      try {
        const url = await generateSignedUrl(filePath, 3600);
        setSignedUrl(url);
      } catch (error) {
        console.error("Error generating signed URL:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSignedUrl();
  }, [filePath, generateSignedUrl]);

  if (isLoading) {
    return null;
  }

  if (!signedUrl) {
    return (
      <Badge className="bg-red-3 text-red-11">
        <TriangleAlert className="size-3" />
        File Unavailable
      </Badge>
    );
  }

  return (
    <div className="max-w-36 lg:max-w-52">
      <Link
        href={signedUrl}
        title={fileName}
        target="_blank"
        rel="noopener noreferrer"
        className="block truncate underline-offset-4 hover:underline"
      >
        {fileName}
      </Link>
    </div>
  );
}
