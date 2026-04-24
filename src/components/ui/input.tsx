import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "w-full px-3 py-2 text-sm rounded-lg border bg-white transition-colors",
            "placeholder:text-stone-400",
            "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent",
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-stone-300 hover:border-stone-400",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
