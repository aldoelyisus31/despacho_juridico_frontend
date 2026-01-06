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

  // Obtener permisos del usuario logueado sobre un expediente
  getMisPermisos: async (id) => {
    const response = await api.get(`/expedientes/${id}/mis-permisos`);
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
  },

  // Gestión de usuarios asignados
  asignarUsuario: async (expedienteId, usuarioData) => {
    const response = await api.post(`/expedientes/${expedienteId}/usuarios`, usuarioData);
    return response.data;
  },

  obtenerUsuariosAsignados: async (expedienteId) => {
    const response = await api.get(`/expedientes/${expedienteId}/usuarios`);
    return response.data;
  },

  actualizarPermisosUsuario: async (expedienteId, usuarioId, permisosData) => {
    const response = await api.patch(`/expedientes/${expedienteId}/usuarios/${usuarioId}`, permisosData);
    return response.data;
  },

  removerUsuario: async (expedienteId, usuarioId) => {
    const response = await api.delete(`/expedientes/${expedienteId}/usuarios/${usuarioId}`);
    return response.data;
  }
};

export default expedientesService;
