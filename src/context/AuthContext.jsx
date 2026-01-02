import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const usuarioGuardado = authService.getCurrentUser();
    if (usuarioGuardado) {
      setUsuario(usuarioGuardado);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Intentando login con:', email);
      const { usuario: usuarioData } = await authService.login(email, password);
      console.log('Usuario recibido:', usuarioData);
      setUsuario(usuarioData);
      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.message || 'Error al iniciar sesión' 
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
  };

  const isAuthenticated = () => {
    return !!usuario;
  };

  // Obtener nombre completo del usuario
  const getNombreCompleto = () => {
    if (!usuario) return '';
    const { nombres, apellidoPaterno, apellidoMaterno } = usuario;
    return `${nombres} ${apellidoPaterno}${apellidoMaterno ? ' ' + apellidoMaterno : ''}`;
  };

  // Obtener iniciales del usuario
  const getIniciales = () => {
    if (!usuario) return '';
    const { nombres, apellidoPaterno } = usuario;
    return `${nombres.charAt(0)}${apellidoPaterno.charAt(0)}`;
  };

  // Obtener rol formateado
  const getRolFormateado = () => {
    if (!usuario) return '';
    const roles = {
      root: 'Root',
      administrador: 'Administrador',
      administrativo: 'Administrativo',
      abogado: 'Abogado',
      pasante: 'Pasante',
    };
    return roles[usuario.tipoUsuario] || usuario.tipoUsuario;
  };

  const value = {
    usuario,
    loading,
    login,
    logout,
    isAuthenticated,
    getNombreCompleto,
    getIniciales,
    getRolFormateado,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
