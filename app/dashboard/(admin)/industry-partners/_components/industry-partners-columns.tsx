"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ColumnDef } from "@tanstack/react-table";
import { TriangleAlert } from "lucide-react";

import { useGenerateMoaUrl } from "@/hooks/use-industry-partner";

import { safeFormatDate } from "@/utils/shared";
import { Tables } from "@/utils/supabase/supabase.types";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

export const industryPartnerColumns: ColumnDef<Tables<"industry_partners">>[] =
  [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "company_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name of the Company" />
      ),
      cell: ({ row }) => {
        const companyName = row.original.company_name;
        return (
          <div className="max-w-36 lg:max-w-52">
            <span className="block truncate" title={companyName}>
              {companyName}
            </span>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "address",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Address" />
      ),
      cell: ({ row }) => {
        const address = row.original.company_address;
        return (
          <div className="max-w-36 lg:max-w-52">
            <span className="block truncate" title={address ?? ""}>
              {address}
            </span>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "contact_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact No." />
      ),
      cell: ({ row }) => {
        const contactNo = row.original.company_contact_number;
        return (
          <div className="max-w-36 lg:max-w-52">
            <span className="block truncate" title={contactNo ?? ""}>
              {contactNo}
            </span>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "Nature of Business",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nature of Business" />
      ),
      cell: ({ row }) => {
        const natureOfBusiness = row.original.nature_of_business;
        return (
          <div className="max-w-36 lg:max-w-52">
            <span className="block truncate" title={natureOfBusiness ?? ""}>
              {natureOfBusiness}
            </span>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "Date of Signing",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date of Signing" />
      ),
      cell: ({ row }) => {
        const dateofSigning = row.original.date_of_signing;
        if (!dateofSigning) {
          return "-";
        }

        return <span>{safeFormatDate(dateofSigning, "PP")}</span>;
      },
    },
    {
      accessorKey: "MOA File",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="MOA File" />
      ),
      cell: ({ row }) => {
        const filePath = row.original.moa_file_path;
        const fileName = row.original.file_name;
        if (!filePath || !fileName) {
          return;
        }

        const { generateSignedUrl } = useGenerateMoaUrl();
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
      },
      enableSorting: false,
    },
    {
      id: "actions",
    },
  ];
