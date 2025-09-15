"use client";
import { X } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type OptionType = {
  label: string;
  value: any; // Can be string or number
};

interface MultiSelectProps {
  options: OptionType[];
  selected: any[];
  onChange: (selected: any[]) => void;
  className?: string;
  placeholder?: string;
}

function MultiSelect({
  options,
  selected,
  onChange,
  className,
  placeholder = "Select options...",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item: any) => {
    onChange(selected.filter((s) => s !== item));
  };

  const handleSelect = (item: any) => {
    if (!selected.includes(item)) {
      onChange([...selected, item]);
    }
  };

  return (
    <div className="relative">
      <div
        className="w-full min-h-10 text-sm border border-input rounded-md p-2 flex gap-1 flex-wrap items-center cursor-text"
        onClick={() => setOpen(true)}
      >
        {selected.length > 0 ? (
          selected.map((itemValue) => {
            const item = options.find((opt) => opt.value === itemValue);
            if (!item) return null;
            return (
              <Badge key={item.value} variant="secondary">
                {item.label}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(item.value)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </div>

      {open && (
        <div className="absolute w-full z-10 top-full mt-2 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
          <Command className={className}>
            <CommandInput placeholder="جستجو..." />
            <CommandList>
              <CommandEmpty>موردی یافت نشد.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      handleSelect(option.value);
                      // setOpen(false); // keep it open to select multiple
                    }}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          <button
            onClick={() => setOpen(false)}
            className="w-full text-center p-2 text-sm text-muted-foreground hover:bg-accent"
          >
            بستن
          </button>
        </div>
      )}
    </div>
  );
}

export { MultiSelect };
