import api from './api';

const areasDerechoService = {
  // Obtener todas las áreas con paginación
  getAll: async (page = 1, limit = 50) => {
    const response = await api.get('/areas-derecho', {
      params: { page, limit }
    });
    return response.data;
  },

  // Obtener una área por ID (incluye subáreas)
  getById: async (id) => {
    const response = await api.get(`/areas-derecho/${id}`);
    return response.data;
  },

  // Crear nueva área
  create: async (data) => {
    const response = await api.post('/areas-derecho', data);
    return response.data;
  },

  // Actualizar área
  update: async (id, data) => {
    const response = await api.patch(`/areas-derecho/${id}`, data);
    return response.data;
  },

  // Eliminar área
  delete: async (id) => {
    const response = await api.delete(`/areas-derecho/${id}`);
    return response.data;
  }
};

export default areasDerechoService;
