/**
 * API URL utilities for handling different backend connection scenarios
 */

// The AWS EC2 IP address for direct connections
const EC2_IP = "44.222.190.191";

/**
 * Get the base URL for API calls
 * - For server-side rendering: Uses the Next.js API routes
 * - For browser direct API calls: Uses localhost, which is proxied by Next.js
 */
export function getApiBaseUrl(options?: { forStreaming?: boolean }): string {
  const { forStreaming = false } = options || {};
  
  // Always use the API routes through Next.js, even for streaming
  // This ensures CORS is properly handled
  if (typeof window !== 'undefined') {
    return '/api';
  }
  
  // Server-side rendering
  return `http://${EC2_IP}:8000`;
}

/**
 * Get a complete API URL for a specific endpoint
 */
export function getApiUrl(endpoint: string, options?: { forStreaming?: boolean }): string {
  const baseUrl = getApiBaseUrl(options);
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseUrl}${formattedEndpoint}`;
} 