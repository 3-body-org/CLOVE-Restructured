import { useAuth } from 'contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function withBase(url) {
  // If url starts with http(s) or ws(s), return as is; else prepend API_BASE
  if (/^(https?:)?\/\//.test(url)) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Custom hook for making authenticated API calls with automatic token refresh
 * @returns {Object} Object containing apiCall function and loading state
 */
export const useApi = () => {
  const authContext = useAuth();
  // useAuth will throw if context is undefined, but it might return null during init
  // Check if authContext exists and has required properties
  if (!authContext || !authContext.makeAuthenticatedRequest) {
    throw new Error('useApi must be used within an AuthProvider and AuthProvider must be initialized');
  }
  const { makeAuthenticatedRequest, isRefreshing } = authContext;

  /**
   * Make an authenticated API call with automatic token refresh
   * @param {string} url - The API endpoint URL
   * @param {Object} options - Fetch options (method, headers, body, etc.)
   * @returns {Promise<Response>} The fetch response
   */
  const apiCall = async (url, options = {}) => {
    try {
      const response = await makeAuthenticatedRequest(withBase(url), options);
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Make a GET request
   * @param {string} url - The API endpoint URL
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Response>} The fetch response
   */
  const get = async (url, options = {}) => {
    return apiCall(url, { ...options, method: 'GET' });
  };

  /**
   * Make a POST request
   * @param {string} url - The API endpoint URL
   * @param {Object} data - The data to send
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Response>} The fetch response
   */
  const post = async (url, data = null, options = {}) => {
    const requestOptions = {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    return apiCall(url, requestOptions);
  };

  /**
   * Make a PUT request
   * @param {string} url - The API endpoint URL
   * @param {Object} data - The data to send
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Response>} The fetch response
   */
  const put = async (url, data = null, options = {}) => {
    const requestOptions = {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    return apiCall(url, requestOptions);
  };

  /**
   * Make a DELETE request
   * @param {string} url - The API endpoint URL
   * @param {Object} data - The data to send
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Response>} The fetch response
   */
  const del = async (url, data = null, options = {}) => {
    const requestOptions = {
      ...options,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    return apiCall(url, requestOptions);
  };

  /**
   * Make a PATCH request
   * @param {string} url - The API endpoint URL
   * @param {Object} data - The data to send
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Response>} The fetch response
   */
  const patch = async (url, data = null, options = {}) => {
    const requestOptions = {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    return apiCall(url, requestOptions);
  };

  return {
    apiCall,
    get,
    post,
    put,
    delete: del,
    patch,
    isRefreshing,
  };
}; 
