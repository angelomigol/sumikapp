"use client";

import React, { useRef, useState } from "react";

import { FileSpreadsheet, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { If } from "@/components/sumikapp/if";

export default function BulkAddUserTab() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const uploadedFile = e.dataTransfer.files[0];
      //   handleFileSelection(uploadedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFile = e.target.files[0];
      //   handleFileSelection(uploadedFile);
    }
  };
  return (
    <Card>
      <CardContent>
        <div
          className={`rounded-lg border-2 border-dashed p-10 text-center ${
            isDragging ? "border-primary bg-primary/10" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FileSpreadsheet className="text-muted-foreground mx-auto size-12" />
          <h3 className="mt-4 font-semibold">
            Drag and drop your CSV file here
          </h3>
          <p className="text-muted-foreground mt-2 text-sm">
            or click to browse your files
          </p>
          <Input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Select File
              </>
            )}
          </Button>
          {file && !isProcessing && (
            <div className="mt-4 text-sm">
              Selected file: <span className="font-medium">{file.name}</span>
            </div>
          )}
        </div>
      </CardContent>

      <If condition={isProcessing}>
        <CardFooter className="justify-center">
          <p className="text-muted-foreground text-sm">
            Processing file, please wait...
          </p>
        </CardFooter>
      </If>
    </Card>
  );
}
