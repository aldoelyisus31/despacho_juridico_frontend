import api from './api';

const authService = {
  // Login
  async login(email, password) {
    try {
      console.log('Enviando petición de login...');
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      console.log('Respuesta del servidor:', response.data);
      
      // El backend envuelve la respuesta en { data: { accessToken, usuario }, timestamp, path }
      const { accessToken, usuario } = response.data.data;
      console.log('accessToken:', accessToken);
      console.log('usuario:', usuario);
      
      // Guardar en localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      console.log('Token y usuario guardados en localStorage');
      
      return { accessToken, usuario };
    } catch (error) {
      console.error('Error en authService.login:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al iniciar sesión. Por favor, intente de nuevo.');
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('usuario');
  },

  // Obtener usuario actual
  getCurrentUser() {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr || usuarioStr === 'undefined' || usuarioStr === 'null') {
      return null;
    }
    try {
      return JSON.parse(usuarioStr);
    } catch (error) {
      console.error('Error al parsear usuario del localStorage:', error);
      localStorage.removeItem('usuario');
      return null;
    }
  },

  // Verificar si está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    const usuario = this.getCurrentUser();
    return !!(token && usuario);
  },

  // Obtener token
  getToken() {
    return localStorage.getItem('accessToken');
  },
};

export default authService;
