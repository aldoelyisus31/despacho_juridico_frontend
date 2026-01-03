import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './Usuarios.css';

const UsuarioFormModal = ({ isOpen, onClose, onSubmit, loading, usuarioToEdit }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fechaNacimiento: '',
    tipoUsuario: 'administrativo',
    email: '',
    password: '',
    confirmPassword: '',
    activo: true
  });

  const [errors, setErrors] = useState({});
  const [isActivo, setIsActivo] = useState(true);

  useEffect(() => {
    if (usuarioToEdit) {
      setFormData({
        nombres: usuarioToEdit.nombres || '',
        apellidoPaterno: usuarioToEdit.apellidoPaterno || '',
        apellidoMaterno: usuarioToEdit.apellidoMaterno || '',
        fechaNacimiento: usuarioToEdit.fechaNacimiento || '',
        tipoUsuario: usuarioToEdit.tipoUsuario || 'administrativo',
        email: usuarioToEdit.email || '',
        password: '',
        activo: usuarioToEdit.activo !== undefined ? usuarioToEdit.activo : true
      });
      setIsActivo(usuarioToEdit.activo !== undefined ? usuarioToEdit.activo : true);
    } else {
      // Reset para modo creación
      setFormData({
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        fechaNacimiento: '',
        tipoUsuario: 'administrativo',
        email: '',
        password: '',
        confirmPassword: '',
        activo: true
      });
      setIsActivo(true);
    }
    setErrors({});
  }, [usuarioToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo al editar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Nombres
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'El nombre es requerido';
    } else if (formData.nombres.length > 100) {
      newErrors.nombres = 'El nombre no puede exceder 100 caracteres';
    }

    // Apellido Paterno
    if (!formData.apellidoPaterno.trim()) {
      newErrors.apellidoPaterno = 'El apellido paterno es requerido';
    } else if (formData.apellidoPaterno.length > 100) {
      newErrors.apellidoPaterno = 'El apellido paterno no puede exceder 100 caracteres';
    }

    // Apellido Materno (opcional)
    if (formData.apellidoMaterno && formData.apellidoMaterno.length > 100) {
      newErrors.apellidoMaterno = 'El apellido materno no puede exceder 100 caracteres';
    }

    // Fecha de Nacimiento
    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    } else if (formData.email.length > 150) {
      newErrors.email = 'El email no puede exceder 150 caracteres';
    }

    // Password (requerido solo en creación)
    if (!usuarioToEdit) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Debes confirmar la contraseña';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    } else {
      // En edición, solo validar si se proporciona
      if (formData.password && formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      }

      // Si se proporciona contraseña en edición, debe confirmarla
      if (formData.password && !formData.confirmPassword) {
        newErrors.confirmPassword = 'Debes confirmar la contraseña';
      } else if (formData.password && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Preparar datos
      const dataToSend = {
        ...formData,
        activo: isActivo
      };

      // Eliminar confirmPassword (solo es para validación en frontend)
      delete dataToSend.confirmPassword;

      // En edición, no enviar password si está vacío
      if (usuarioToEdit && !dataToSend.password) {
        delete dataToSend.password;
      }

      // Limpiar apellido materno si está vacío
      if (!dataToSend.apellidoMaterno) {
        delete dataToSend.apellidoMaterno;
      }

      await onSubmit(dataToSend);
      
      // Reset del formulario
      setFormData({
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        fechaNacimiento: '',
        tipoUsuario: 'administrativo',
        email: '',
        password: '',
        confirmPassword: '',
        activo: true
      });
      setIsActivo(true);
      setErrors({});
    } catch (error) {
      console.error('Error en el formulario:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{usuarioToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="nombres">
                  Nombre(s) <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  className={errors.nombres ? 'error' : ''}
                  placeholder="Ej: Juan Carlos"
                  disabled={loading}
                />
                {errors.nombres && <span className="error-message">{errors.nombres}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="apellidoPaterno">
                  Apellido Paterno <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="apellidoPaterno"
                  name="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={handleChange}
                  className={errors.apellidoPaterno ? 'error' : ''}
                  placeholder="Ej: García"
                  disabled={loading}
                />
                {errors.apellidoPaterno && <span className="error-message">{errors.apellidoPaterno}</span>}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="apellidoMaterno">
                  Apellido Materno
                </label>
                <input
                  type="text"
                  id="apellidoMaterno"
                  name="apellidoMaterno"
                  value={formData.apellidoMaterno}
                  onChange={handleChange}
                  className={errors.apellidoMaterno ? 'error' : ''}
                  placeholder="Ej: López"
                  disabled={loading}
                />
                {errors.apellidoMaterno && <span className="error-message">{errors.apellidoMaterno}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="fechaNacimiento">
                  Fecha de Nacimiento <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  className={errors.fechaNacimiento ? 'error' : ''}
                  disabled={loading}
                />
                {errors.fechaNacimiento && <span className="error-message">{errors.fechaNacimiento}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tipoUsuario">
                Tipo de Usuario <span className="required">*</span>
              </label>
              <select
                id="tipoUsuario"
                name="tipoUsuario"
                value={formData.tipoUsuario}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="administrativo">Administrativo</option>
                <option value="abogado">Abogado</option>
                <option value="pasante">Pasante</option>
                <option value="administrador">Administrador</option>
                <option value="root">Root</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="usuario@despacho.com"
                disabled={loading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Contraseña {!usuarioToEdit && <span className="required">*</span>}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder={usuarioToEdit ? 'Dejar vacío para no cambiar' : 'Mínimo 8 caracteres'}
                disabled={loading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
              {usuarioToEdit && (
                <small className="form-help">
                  Deja este campo vacío si no deseas cambiar la contraseña
                </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirmar Contraseña {!usuarioToEdit && <span className="required">*</span>}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder={usuarioToEdit ? 'Confirmar nueva contraseña' : 'Confirma tu contraseña'}
                disabled={loading}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="activo-switch">
                Estado del Usuario
              </label>
              <div className="switch-container">
                <label className="switch">
                  <input
                    type="checkbox"
                    id="activo-switch"
                    checked={isActivo}
                    onChange={(e) => setIsActivo(e.target.checked)}
                    disabled={loading}
                  />
                  <span className="slider"></span>
                </label>
                <span className="switch-label">
                  {isActivo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <small className="form-help">
                Los usuarios inactivos no podrán acceder al sistema
              </small>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (usuarioToEdit ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsuarioFormModal;
