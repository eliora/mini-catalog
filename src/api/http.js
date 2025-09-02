const API_BASE = '/api'; // Use relative path for proxy

export const http = async (endpoint, { body, token, ...customConfig } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };
  if (body) {
    config.body = JSON.stringify(body);
  }

  let data;
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, config);
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      data = await response.json();
    } else {
      // If not JSON, handle as text to prevent parsing errors
      const textData = await response.text();
      if (response.ok) {
        return textData; // Or handle as needed
      }
      // Provide a more informative error for non-JSON responses
      throw new Error(`Expected JSON but received ${contentType || 'other'}. Response: ${textData.substring(0, 100)}...`);
    }

    if (response.ok) {
      return data;
    }
    throw new Error(data.error || 'Something went wrong');
  } catch (err) {
    const message = (err && err.message) || (data && data.error) || 'Network error';
    throw new Error(message);
  }
};


