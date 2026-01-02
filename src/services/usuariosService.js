import api from './api';

const usuariosService = {
  // Obtener todos los usuarios con paginación
  getAll: async (page = 1, limit = 100) => {
    const response = await api.get('/usuarios', {
      params: { page, limit }
    });
    return response.data;
  },

  // Obtener un usuario por ID
  getById: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  // Crear nuevo usuario
  create: async (data) => {
    const response = await api.post('/usuarios', data);
    return response.data;
  },

  // Actualizar usuario
  update: async (id, data) => {
    const response = await api.patch(`/usuarios/${id}`, data);
    return response.data;
  },

  // Eliminar usuario
  delete: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  }
};

export default usuariosService;
