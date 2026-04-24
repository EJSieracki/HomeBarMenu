import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700":
              variant === "primary",
            "bg-stone-200 text-stone-800 hover:bg-stone-300 active:bg-stone-400":
              variant === "secondary",
            "text-stone-700 hover:bg-stone-100 active:bg-stone-200":
              variant === "ghost",
            "bg-red-500 text-white hover:bg-red-600 active:bg-red-700":
              variant === "danger",
          },
          {
            "text-sm px-3 py-1.5 gap-1.5": size === "sm",
            "text-sm px-4 py-2 gap-2": size === "md",
            "text-base px-5 py-2.5 gap-2": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
