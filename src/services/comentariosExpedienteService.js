import api from './api';

const BASE_URL = '/expedientes';

export const comentariosExpedienteService = {
  // Crear un comentario para un expediente
  async create(expedienteId, contenido) {
    const response = await api.post(`${BASE_URL}/${expedienteId}/comentarios`, {
      contenido,
    });
    return response.data;
  },

  // Obtener todos los comentarios de un expediente
  async findAllByExpediente(expedienteId) {
    const response = await api.get(`${BASE_URL}/${expedienteId}/comentarios`);
    return response.data;
  },

  // Obtener un comentario por ID
  async findOne(comentarioId) {
    const response = await api.get(`${BASE_URL}/comentarios/${comentarioId}`);
    return response.data;
  },

  // Actualizar un comentario
  async update(comentarioId, contenido) {
    const response = await api.patch(`${BASE_URL}/comentarios/${comentarioId}`, {
      contenido,
    });
    return response.data;
  },

  // Eliminar un comentario
  async remove(comentarioId) {
    const response = await api.delete(`${BASE_URL}/comentarios/${comentarioId}`);
    return response.data;
  },
};
