import api from './api';

const subareasDerechoService = {
  // Obtener todas las subáreas con paginación
  getAll: async (page = 1, limit = 50) => {
    const response = await api.get('/subareas-derecho', {
      params: { page, limit }
    });
    return response.data;
  },

  // Obtener subáreas por área
  getByArea: async (areaId) => {
    const response = await api.get(`/subareas-derecho/area/${areaId}`);
    return response.data;
  },

  // Obtener una subárea por ID
  getById: async (id) => {
    const response = await api.get(`/subareas-derecho/${id}`);
    return response.data;
  },

  // Crear nueva subárea
  create: async (data) => {
    const response = await api.post('/subareas-derecho', data);
    return response.data;
  },

  // Actualizar subárea
  update: async (id, data) => {
    const response = await api.patch(`/subareas-derecho/${id}`, data);
    return response.data;
  },

  // Eliminar subárea
  delete: async (id) => {
    const response = await api.delete(`/subareas-derecho/${id}`);
    return response.data;
  }
};

export default subareasDerechoService;
