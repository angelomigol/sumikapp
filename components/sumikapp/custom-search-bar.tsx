import React from "react";

import { Search } from "lucide-react";

import { Input } from "../ui/input";

export default function CustomSearchbar(props: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder: string;
  width?: string;
}) {
  const width = props.width ?? "w-[300px]";

  return (
    <div className="relative">
      <Search className="text-muted-foreground absolute top-2 left-2.5 size-4" />
      <Input
        value={props.searchQuery}
        onChange={(e) => props.setSearchQuery(e.target.value)}
        type="search"
        placeholder={props.placeholder}
        className={` ${width} h-8 pl-8`}
      />
    </div>
  );
}
