import api from './api';

const expedientesService = {
  // Obtener todos los expedientes con paginación
  getAll: async (page = 1, limit = 10) => {
    const response = await api.get('/expedientes', {
      params: { page, limit }
    });
    return response.data;
  },

  // Obtener un expediente por ID
  getById: async (id) => {
    const response = await api.get(`/expedientes/${id}`);
    return response.data;
  },

  // Obtener expedientes por cliente
  getByCliente: async (clienteId) => {
    const response = await api.get(`/expedientes/cliente/${clienteId}`);
    return response.data;
  },

  // Obtener expedientes por usuario
  getByUsuario: async (usuarioId) => {
    const response = await api.get(`/expedientes/usuario/${usuarioId}`);
    return response.data;
  },

  // Crear nuevo expediente
  create: async (data) => {
    const response = await api.post('/expedientes', data);
    return response.data;
  },

  // Actualizar expediente
  update: async (id, data) => {
    const response = await api.patch(`/expedientes/${id}`, data);
    return response.data;
  },

  // Eliminar expediente
  delete: async (id) => {
    const response = await api.delete(`/expedientes/${id}`);
    return response.data;
  }
};

export default expedientesService;
