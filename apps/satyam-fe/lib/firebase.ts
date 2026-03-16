import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Small utility to merge class names and resolve Tailwind conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
