import { cn } from "@/lib/utils";
import { type TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "w-full px-3 py-2 text-sm rounded-lg border bg-white transition-colors resize-y min-h-[80px]",
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
Textarea.displayName = "Textarea";

export { Textarea };
