import React from "react";

import AccountSetupContainer from "./_components/account-setup-container";

export const generateMetadata = async () => {
  return {
    title: "Set up your account",
  };
};

export default function AccountSetupPage() {
  return <AccountSetupContainer />;
}
