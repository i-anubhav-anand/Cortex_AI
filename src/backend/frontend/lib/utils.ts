import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to create API URLs that work with Next.js API routes
export function getApiUrl(endpoint: string): string {
  // Check if the endpoint already starts with a slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Use relative URL to leverage Next.js API routes
  return `/api${formattedEndpoint}`;
}
