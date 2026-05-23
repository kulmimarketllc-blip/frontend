/**
 * API Executor for Redux Thunks
 * Handles error responses with proper logging and filtering
 */

/**
 * Filter sensitive fields from error response
 * Only returns message, code, and status - no internal details
 * @param {Object} data - API response data
 * @returns {Object} - Filtered safe error data
 */
const filterSensitiveErrorData = (data) => {
  if (!data) return null;

  // Only pass through safe fields
  const safe = {};
  if (data.message) safe.message = data.message;
  if (data.code) safe.code = data.code;
  if (data.status) safe.status = data.status;
  if (data.statusCode) safe.statusCode = data.statusCode;
  
  return Object.keys(safe).length > 0 ? safe : null;
};

/**
 * Environment-aware logging (only in development)
 * @param {string} level - 'error' or 'warn'
 * @param {string} message - Log message
 * @param {*} data - Optional data to log
 */
const devLog = (level, message, data) => {
  if (import.meta.env.DEV) {
    if (level === 'error') {
      console.error(message, data);
    } else {
      console.warn(message, data);
    }
  }
};

export const apiExecutor = async (apiCall, rejectWithValue, signal) => {
  try {
    const response = await apiCall(signal);
    return response.data ?? response;
  } catch (error) {
    const { response } = error;

    // Log with environment awareness - full details only in development
    if (response?.status === 401) {
      devLog('error', 'Unauthorized access attempt', error);
    }

    if (response?.status === 403) {
      devLog('error', 'Access forbidden - insufficient permissions', error);
    }

    if (response?.status === 404) {
      devLog('error', 'Resource not found', error);
    }

    // Network error or no response
    if (!response) {
      devLog('error', 'Network or server error', error);
      return rejectWithValue({
        message: 'Network connection issue. Please try again.',
        status: 'network_error',
      });
    }

    // Filter sensitive data before returning to Redux state
    const safeErrorData = filterSensitiveErrorData(response.data);
    
    return rejectWithValue(
      safeErrorData || {
        message: 'An error occurred. Please try again.',
        status: response.status,
      }
    );
  }
};

