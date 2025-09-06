import React from "react";

export default function PageTitle({ text }: { text: string }) {
  return <h5 className="text-xl font-medium tracking-tight">{text}</h5>;
}
