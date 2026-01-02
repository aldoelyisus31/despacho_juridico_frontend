import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function ClienteFormModal({ isOpen, onClose, onSubmit, loading, clienteToEdit = null }) {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    celular: '',
    email: '',
    direccion: '',
    celularEmergencia: '',
    nombreEmergencia: '',
    parentezcoEmergencia: '',
    tipo: 'particular',
  });

  const [errors, setErrors] = useState({});

  // Cargar datos del cliente cuando se abre en modo edición
  useEffect(() => {
    if (clienteToEdit) {
      setFormData({
        nombres: clienteToEdit.nombres || '',
        apellidoPaterno: clienteToEdit.apellidoPaterno || '',
        apellidoMaterno: clienteToEdit.apellidoMaterno || '',
        celular: clienteToEdit.celular || '',
        email: clienteToEdit.email || '',
        direccion: clienteToEdit.direccion || '',
        celularEmergencia: clienteToEdit.celularEmergencia || '',
        nombreEmergencia: clienteToEdit.nombreEmergencia || '',
        parentezcoEmergencia: clienteToEdit.parentezcoEmergencia || '',
        tipo: clienteToEdit.tipo || 'particular',
      });
    } else {
      setFormData({
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        celular: '',
        email: '',
        direccion: '',
        celularEmergencia: '',
        nombreEmergencia: '',
        parentezcoEmergencia: '',
        tipo: 'particular',
      });
    }
    setErrors({});
  }, [clienteToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombres.trim()) newErrors.nombres = 'Los nombres son obligatorios';
    if (!formData.apellidoPaterno.trim()) newErrors.apellidoPaterno = 'El apellido paterno es obligatorio';
    
    if (!formData.celular.trim()) {
      newErrors.celular = 'El celular es obligatorio';
    } else if (!/^[0-9]{10,15}$/.test(formData.celular)) {
      newErrors.celular = 'El celular debe contener entre 10 y 15 dígitos';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es obligatoria';

    if (!formData.celularEmergencia.trim()) {
      newErrors.celularEmergencia = 'El celular de emergencia es obligatorio';
    } else if (!/^[0-9]{10,15}$/.test(formData.celularEmergencia)) {
      newErrors.celularEmergencia = 'El celular de emergencia debe contener entre 10 y 15 dígitos';
    }

    if (!formData.nombreEmergencia.trim()) newErrors.nombreEmergencia = 'El nombre de emergencia es obligatorio';
    if (!formData.parentezcoEmergencia.trim()) newErrors.parentezcoEmergencia = 'El parentesco es obligatorio';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Limpiar formulario después de éxito
      setFormData({
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        celular: '',
        email: '',
        direccion: '',
        celularEmergencia: '',
        nombreEmergencia: '',
        parentezcoEmergencia: '',
        tipo: 'particular',
      });
      setErrors({});
    } catch (error) {
      // Los errores se manejan en el componente padre
    }
  };

  const handleClose = () => {
    setFormData({
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      celular: '',
      email: '',
      direccion: '',
      celularEmergencia: '',
      nombreEmergencia: '',
      parentezcoEmergencia: '',
      tipo: 'particular',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{clienteToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <button className="modal-close" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <h3 className="form-section-title">Información Personal</h3>
            
            <div className="form-grid-2">
              <div className="form-group">
                <label>
                  Nombres <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  placeholder="Juan Carlos"
                  disabled={loading}
                  maxLength={100}
                />
                {errors.nombres && <span className="error">{errors.nombres}</span>}
              </div>

              <div className="form-group">
                <label>
                  Apellido Paterno <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={handleChange}
                  placeholder="García"
                  disabled={loading}
                  maxLength={100}
                />
                {errors.apellidoPaterno && <span className="error">{errors.apellidoPaterno}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Apellido Materno</label>
              <input
                type="text"
                name="apellidoMaterno"
                value={formData.apellidoMaterno}
                onChange={handleChange}
                placeholder="López"
                disabled={loading}
                maxLength={100}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>
                  Celular <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  placeholder="5512345678"
                  disabled={loading}
                  maxLength={15}
                />
                {errors.celular && <span className="error">{errors.celular}</span>}
              </div>

              <div className="form-group">
                <label>
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="juan.garcia@email.com"
                  disabled={loading}
                  maxLength={150}
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>
                Dirección <span className="required">*</span>
              </label>
              <textarea
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Av. Reforma 123, Col. Centro, CDMX, C.P. 06000"
                disabled={loading}
                rows={3}
              />
              {errors.direccion && <span className="error">{errors.direccion}</span>}
            </div>

            <div className="form-group">
              <label>
                Tipo de Cliente <span className="required">*</span>
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="particular">Particular</option>
                <option value="empresa">Empresa</option>
              </select>
            </div>

            <h3 className="form-section-title">Contacto de Emergencia</h3>

            <div className="form-group">
              <label>
                Nombre Completo <span className="required">*</span>
              </label>
              <input
                type="text"
                name="nombreEmergencia"
                value={formData.nombreEmergencia}
                onChange={handleChange}
                placeholder="María López García"
                disabled={loading}
                maxLength={200}
              />
              {errors.nombreEmergencia && <span className="error">{errors.nombreEmergencia}</span>}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>
                  Celular <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="celularEmergencia"
                  value={formData.celularEmergencia}
                  onChange={handleChange}
                  placeholder="5598765432"
                  disabled={loading}
                  maxLength={15}
                />
                {errors.celularEmergencia && <span className="error">{errors.celularEmergencia}</span>}
              </div>

              <div className="form-group">
                <label>
                  Parentesco <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="parentezcoEmergencia"
                  value={formData.parentezcoEmergencia}
                  onChange={handleChange}
                  placeholder="Esposa, Hijo, etc."
                  disabled={loading}
                  maxLength={50}
                />
                {errors.parentezcoEmergencia && <span className="error">{errors.parentezcoEmergencia}</span>}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : clienteToEdit ? 'Actualizar Cliente' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClienteFormModal;
