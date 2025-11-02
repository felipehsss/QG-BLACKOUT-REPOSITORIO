const API_URL = "http://localhost:3080/api";

/**
 * Obtém o token JWT do localStorage
 */
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Remove o token do localStorage (logout)
 */
export function removeToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/**
 * Função genérica para fazer requisições autenticadas à API
 */
async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Se o token expirou ou é inválido
    if (response.status === 401) {
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Sessão expirada. Por favor, faça login novamente.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (err) {
    console.error(`Erro na requisição ${endpoint}:`, err);
    // Se for um erro de rede
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new Error("Erro de conexão. Verifique se o backend está rodando.");
    }
    throw err;
  }
}

/**
 * Métodos HTTP helpers
 */
export const api = {
  get: (endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return apiRequest(url, { method: "GET" });
  },

  post: (endpoint, data) => {
    return apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  put: (endpoint, data) => {
    return apiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: (endpoint) => {
    return apiRequest(endpoint, { method: "DELETE" });
  },
};

