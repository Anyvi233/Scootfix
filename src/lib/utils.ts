import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")        // Replace spaces with -
    .replace(/[^\w\-]+/g, "")    // Remove all non-word chars
    .replace(/\-\-+/g, "-");     // Replace multiple - with single -
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function generateOrderNumber(): string {
  const prefix = "SF";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${timestamp}-${random}`;
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
