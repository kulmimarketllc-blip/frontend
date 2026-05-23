/**
 * API Error Handler
 * Extracts user-friendly error messages from various error objects
 * Does NOT expose technical details or sensitive information
 */

/**
 * Handle API errors with standard, non-sensitive messages
 * @param {Error|AxiosError} error - Error object to handle
 * @returns {string} - User-friendly error message
 */
export const handleApiError = (error) => {
  // Log with environment awareness - only show details in development
  if (import.meta.env.DEV) {
    console.error('API Error:', error?.message || 'Unknown error');
  }

  // Check for API response errors (AxiosError with response)
  if (error?.response) {
    // Return message from API response if available
    if (error.response.data?.message) {
      const message = error.response.data.message;
      // Handle array of messages
      if (Array.isArray(message)) {
        return message[0] || 'An error occurred. Please try again.';
      }
      return message;
    }

    // Don't expose HTTP status codes to users
    // Return generic message based on status code
    const statusCode = error.response.status;
    if (statusCode === 401 || statusCode === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (statusCode === 404) {
      return 'The requested resource was not found.';
    }
    if (statusCode >= 500) {
      return 'Server error. Please try again later.';
    }

    // Generic API error
    return 'An error occurred. Please try again.';
  }

  // Network error (request made but no response)
  if (error?.request) {
    return 'Network error. Please check your connection and try again.';
  }

  // Other errors with message
  if (error?.message) {
    return error.message;
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.';
};

