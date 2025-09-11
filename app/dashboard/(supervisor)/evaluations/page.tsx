import React from "react";

import EvaluationsContainer from "./_components/evaluations-container";

export const generateMetadata = async () => {
  return {
    title: "Evaluations",
  };
};

export default function EvaluationsPage() {
  return <EvaluationsContainer />;
}
