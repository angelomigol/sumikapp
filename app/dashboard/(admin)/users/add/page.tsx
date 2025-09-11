import React from "react";

import AddAccountContainer from "./_components/add-account-container";

export const generateMetadata = async () => {
  return {
    title: "Add Account",
  };
};

export default function AddAccountPage() {
  return <AddAccountContainer />;
}
