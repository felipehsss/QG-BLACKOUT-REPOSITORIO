const BASE_URL = 'http://localhost:3080/api';

const handleResponse = async (response) => {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = (data && (data.message || data.error)) || response.statusText || `Erro ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

const buildHeaders = (existingHeaders = {}, token, body) => {
  const headers = {
    ...existingHeaders,
  };

  // Se body for FormData, não setar Content-Type (browser cuida do boundary)
  const isFormData = body instanceof FormData;

  if (!isFormData && !('Content-Type' in headers)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    const t = String(token).trim();
    if (t) headers['Authorization'] = `Bearer ${t}`;
  }

  return headers;
};

const request = async (endpoint, options = {}, token) => {
  const { headers: optHeaders, body: optBody, ...restOptions } = options;
  const headers = buildHeaders(optHeaders, token, optBody);

  const config = {
    ...restOptions,
    headers,
    body: optBody,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Erro na requisição para ${endpoint}:`, error.message || error);

    if (error instanceof TypeError && error.message?.includes('fetch')) {
      throw new Error("Erro de conexão. Verifique se o backend está rodando na porta 3080.");
    }

    throw error;
  }
};

export const apiService = {
  get: (endpoint, token, options = {}) => request(endpoint, { method: 'GET', ...options }, token),
  post: (endpoint, data, token, options = {}) =>
    request(endpoint, { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data), ...options }, token),
  put: (endpoint, data, token, options = {}) =>
    request(endpoint, { method: 'PUT', body: data instanceof FormData ? data : JSON.stringify(data), ...options }, token),
  delete: (endpoint, token, options = {}) => request(endpoint, { method: 'DELETE', ...options }, token),
};