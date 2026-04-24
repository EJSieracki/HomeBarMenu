import { cn } from "@/lib/utils";
import { type SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            "w-full px-3 py-2 text-sm rounded-lg border bg-white transition-colors appearance-none cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent",
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-stone-300 hover:border-stone-400",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
