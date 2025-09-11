"use client";

import React, { useState } from "react";

import {
  IndustryPartner,
  useFetchIndustryPartners,
} from "@/hooks/use-industry-partner";

import { DataTable } from "@/components/data-table";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import { deleteIndustryPartnerAction } from "../server/server-actions";
import AddEditIndustryPartnerDialog from "./add-edit-industry-partner-dialog";
import { industryPartnerColumns } from "./industry-partners-columns";
import { IndustryPartnerTableRowActions } from "./industry-partners-table-row-actions";
import { IndustryPartnerTableToolbar } from "./partners-table-toolbar";

export default function IndestryPartnersContainer() {
  const [open, setOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] =
    useState<IndustryPartner | null>(null);

  const { data = [], isLoading } = useFetchIndustryPartners();

  const handleEdit = (partner: IndustryPartner) => {
    setSelectedPartner(partner);
    setOpen(true);
  };

  if (isLoading) {
    return <LoadingOverlay fullPage />;
  }

  const columnsWithActions = industryPartnerColumns.map((column) => {
    if (column.id === "actions") {
      return {
        ...column,
        cell: ({ row }: any) => (
          <IndustryPartnerTableRowActions
            row={row}
            onEdit={handleEdit}
            deleteAction={deleteIndustryPartnerAction}
          />
        ),
      };
    }
    return column;
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <PageTitle text={"Industry Partners"} />

        <AddEditIndustryPartnerDialog
          open={open}
          setOpen={setOpen}
          editingPartner={selectedPartner}
          handleAdd={() => setSelectedPartner(null)}
        />
      </div>

      <DataTable
        data={data}
        columns={columnsWithActions}
        Toolbar={IndustryPartnerTableToolbar}
      />
    </>
  );
}
