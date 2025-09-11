"use client";

import React from "react";

import pathsConfig from "@/config/paths.config";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackButton from "@/components/sumikapp/back-button";

import BulkAddUserTab from "./bulk-add-user-tab";
import ManualAddUserTab from "./manual-add-user-tab";

export default function AddAccountContainer() {
  return (
    <>
      <div className="flex flex-row items-center gap-2">
        <BackButton title="Add Account" link={pathsConfig.app.users} />
      </div>

      <div className="max-w-2xl space-y-6">
        <Tabs defaultValue="manual">
          <TabsList>
            <TabsTrigger value="manual" className="text-sm">
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="bulk" className="text-sm">
              Bulk Entry
            </TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <ManualAddUserTab />
          </TabsContent>
          <TabsContent value="bulk">
            <BulkAddUserTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
