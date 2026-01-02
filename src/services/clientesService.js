import api from './api';

const clientesService = {
  // Obtener todos los clientes con paginación
  async getAll(page = 1, limit = 10) {
    try {
      const response = await api.get('/clientes', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  },

  // Obtener un cliente por ID
  async getById(id) {
    try {
      const response = await api.get(`/clientes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      throw error;
    }
  },

  // Crear un nuevo cliente
  async create(clienteData) {
    try {
      const response = await api.post('/clientes', clienteData);
      return response.data;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al crear el cliente');
    }
  },

  // Actualizar un cliente
  async update(id, clienteData) {
    try {
      const response = await api.patch(`/clientes/${id}`, clienteData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al actualizar el cliente');
    }
  },

  // Eliminar un cliente
  async delete(id) {
    try {
      const response = await api.delete(`/clientes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al eliminar el cliente');
    }
  },
};

export default clientesService;
