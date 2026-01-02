import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirigir al login si es un error 401 Y hay un token guardado
    // (significa que el token expiró o es inválido)
    // No redirigir en el login inicial
    if (error.response?.status === 401 && localStorage.getItem('accessToken')) {
      // Token expirado o inválido
      localStorage.removeItem('accessToken');
      localStorage.removeItem('usuario');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
