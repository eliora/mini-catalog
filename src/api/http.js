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
    data = await response.json();
    if (response.ok) {
      return data;
    }
    throw new Error(data.error || 'Something went wrong');
  } catch (err) {
    const message = (err && err.message) || (data && data.error) || 'Network error';
    throw new Error(message);
  }
};


