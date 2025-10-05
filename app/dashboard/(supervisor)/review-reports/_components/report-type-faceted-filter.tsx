import { Column } from "@tanstack/react-table";
import { Filter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface ReportTypeFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export function ReportTypeFacetedFilter<TData, TValue>({
  column,
  title,
  icon = Filter,
  options,
}: ReportTypeFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValue = column?.getFilterValue() as string | undefined;
  const Icon = icon;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"} size={"sm"} className="border-dashed">
          {Icon && <Icon />}
          {title}
          {selectedValue && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {
                  options.find((option) => option.value === selectedValue)
                    ?.label
                }
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValue === option.value;
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() =>
                      column?.setFilterValue(
                        isSelected ? undefined : option.value
                      )
                    }
                  >
                    <Checkbox
                      checked={isSelected}
                      aria-label="Select report status"
                      className="mr-2"
                    />
                    {option.icon && (
                      <option.icon className="text-muted-foreground size-4" />
                    )}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValue && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filter
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
