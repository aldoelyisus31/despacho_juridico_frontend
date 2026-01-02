import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';
import subareasDerechoService from '../../services/subareasDerechoService';

const SubareaFormModal = ({ subarea, areaId, areas, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    areaId: areaId || '',
    nombre: '',
    activo: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subarea) {
      setFormData({
        areaId: subarea.areaId || areaId || '',
        nombre: subarea.nombre || '',
        activo: subarea.activo !== undefined ? subarea.activo : true
      });
    } else if (areaId) {
      setFormData(prev => ({ ...prev, areaId }));
    }
  }, [subarea, areaId]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.areaId) {
      newErrors.areaId = 'Debes seleccionar un área principal';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la subárea es requerido';
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre.length > 150) {
      newErrors.nombre = 'El nombre no puede exceder 150 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const selectedArea = areas.find(a => a.id === formData.areaId);
    const areaName = selectedArea ? selectedArea.nombre : 'el área seleccionada';

    const result = await Swal.fire({
      title: subarea ? '¿Actualizar subárea?' : '¿Crear nueva subárea?',
      html: `
        <p>¿Estás seguro de ${subarea ? 'actualizar' : 'crear'} la subárea <strong>"${formData.nombre}"</strong></p>
        <p>en el área <strong>"${areaName}"</strong>?</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e67e22',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: subarea ? 'Sí, actualizar' : 'Sí, crear',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-custom'
      }
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (subarea) {
        await subareasDerechoService.update(subarea.id, formData);
      } else {
        await subareasDerechoService.create(formData);
      }

      onSave(!!subarea);
    } catch (error) {
      console.error('Error saving subarea:', error);
      
      let errorMessage = 'Ocurrió un error al guardar la subárea';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#e67e22'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAreaName = (id) => {
    const area = areas.find(a => a.id === id);
    return area ? area.nombre : '';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{subarea ? 'Editar Subárea de Derecho' : 'Nueva Subárea de Derecho'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="areaId">
                Área Principal <span className="required">*</span>
              </label>
              <select
                id="areaId"
                name="areaId"
                value={formData.areaId}
                onChange={handleChange}
                className={errors.areaId ? 'error' : ''}
                disabled={isSubmitting}
              >
                <option value="">Selecciona un área...</option>
                {areas
                  .filter(area => area.activo)
                  .map(area => (
                    <option key={area.id} value={area.id}>
                      {area.nombre}
                    </option>
                  ))}
              </select>
              {errors.areaId && <span className="error-message">{errors.areaId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="nombre">
                Nombre de la Subárea <span className="required">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={errors.nombre ? 'error' : ''}
                placeholder="Ej: Contratos, Sucesiones, Responsabilidad Civil, etc."
                disabled={isSubmitting}
              />
              {errors.nombre && <span className="error-message">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <span>Subárea activa</span>
              </label>
              <small className="form-help">
                Las subáreas inactivas no estarán disponibles para nuevos casos
              </small>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : (subarea ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubareaFormModal;
