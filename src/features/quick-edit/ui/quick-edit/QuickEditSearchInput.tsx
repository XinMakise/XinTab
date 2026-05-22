import { Search } from "lucide-react";

import { Input } from "@/shared/ui/primitives/input";

type QuickEditSearchInputProps = {
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  inputClassName?: string;
};

export function QuickEditSearchInput({
  placeholder,
  value,
  onValueChange,
  className,
  inputClassName = "h-8 pl-8 text-xs",
}: QuickEditSearchInputProps) {
  return (
    <div className={className ?? "relative"}>
      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className={inputClassName}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
    </div>
  );
}

