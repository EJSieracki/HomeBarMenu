import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatGlassType(glass: string): string {
  return glass.charAt(0) + glass.slice(1).toLowerCase().replace(/_/g, " ");
}

export function formatCategory(category: string): string {
  return category.charAt(0) + category.slice(1).toLowerCase();
}
