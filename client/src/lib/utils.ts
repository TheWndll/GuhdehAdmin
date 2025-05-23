import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-emerald-100 text-emerald-800",
    in_progress: "bg-blue-100 text-blue-800",
    assigned: "bg-purple-100 text-purple-800",
    cancelled: "bg-gray-100 text-gray-800",
    active: "bg-emerald-100 text-emerald-800",
    past_due: "bg-red-100 text-red-800",
    open: "bg-red-100 text-red-800",
    investigating: "bg-yellow-100 text-yellow-800",
    resolved: "bg-emerald-100 text-emerald-800",
    closed: "bg-gray-100 text-gray-800",
  };
  
  return statusColors[status] || "bg-gray-100 text-gray-800";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
