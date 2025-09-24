/**
 * Client-side API wrapper with error handling and fallback to mock data
 */

interface ApiResponse<T> {
  data?: T;
  error?: string;
  fallback?: boolean;
}

export async function apiClient<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    // In development, always ensure we have the right base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const fullUrl = baseUrl + url;

    const response = await fetch(fullUrl, {
      ...options,
      credentials: 'include', // Include authentication cookies
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      // Don't throw for non-ok status, handle gracefully
      console.warn(`API request to ${url} returned status ${response.status}`);

      // Try to parse error message
      try {
        const errorData = await response.json();
        return { error: errorData.error || `HTTP ${response.status}` };
      } catch {
        return { error: `HTTP ${response.status}` };
      }
    }

    const data = await response.json();
    return { data };

  } catch (error) {
    // Network errors or other issues
    console.error(`API request to ${url} failed:`, error);

    // Return error with fallback flag
    return {
      error: error instanceof Error ? error.message : 'Network error',
      fallback: true,
    };
  }
}

/**
 * Check if we should use mock data
 */
export function shouldUseMockData(): boolean {
  // In development, always use mock data if API fails
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // In production, check if mock mode is enabled
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
}