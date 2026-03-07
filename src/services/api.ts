import axios from "axios";

const API_PREFIX = "/api";

const api = axios.create({
  baseURL: `http://localhost:8080${API_PREFIX}`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: injeta o token JWT em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  // Só adiciona o header se o token existir e parecer um JWT válido (3 partes separadas por '.')
  if (token && token.split(".").length === 3) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: trata 401 (token expirado / inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default api;
