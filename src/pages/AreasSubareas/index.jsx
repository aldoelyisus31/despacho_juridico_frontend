import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Swal from 'sweetalert2';
import areasDerechoService from '../../services/areasDerechoService';
import subareasDerechoService from '../../services/subareasDerechoService';
import AreaFormModal from './AreaFormModal';
import SubareaFormModal from './SubareaFormModal';
import './AreasSubareas.css';

const AreasSubareas = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAreas, setExpandedAreas] = useState(new Set());
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showSubareaModal, setShowSubareaModal] = useState(false);
  const [areaToEdit, setAreaToEdit] = useState(null);
  const [subareaToEdit, setSubareaToEdit] = useState(null);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      setLoading(true);
      const response = await areasDerechoService.getAll(1, 100);
      
      // El backend devuelve { data: { data: [...], meta: {...} } }
      const areasData = response.data?.data || response.data || [];
      
      // Cargar subáreas para cada área
      const areasWithSubareas = await Promise.all(
        areasData.map(async (area) => {
          try {
            const subareas = await subareasDerechoService.getByArea(area.id);
            // Manejar la respuesta envuelta del backend
            const subareasData = subareas.data?.data || subareas.data || subareas || [];
            return { ...area, subareas: subareasData };
          } catch (error) {
            console.error(`Error loading subareas for area ${area.id}:`, error);
            return { ...area, subareas: [] };
          }
        })
      );

      setAreas(areasWithSubareas);
    } catch (error) {
      console.error('Error loading areas:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las áreas de derecho',
        confirmButtonColor: '#e67e22'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleArea = (areaId) => {
    const newExpanded = new Set(expandedAreas);
    if (newExpanded.has(areaId)) {
      newExpanded.delete(areaId);
    } else {
      newExpanded.add(areaId);
    }
    setExpandedAreas(newExpanded);
  };

  const handleCreateArea = () => {
    setAreaToEdit(null);
    setShowAreaModal(true);
  };

  const handleEditArea = (area) => {
    setAreaToEdit(area);
    setShowAreaModal(true);
  };

  const handleDeleteArea = async (area) => {
    const result = await Swal.fire({
      title: '¿Eliminar área?',
      html: `
        <p>¿Estás seguro de eliminar el área <strong>${area.nombre}</strong>?</p>
        ${area.subareas?.length > 0 ? `<p class="text-danger">Esta área tiene ${area.subareas.length} subárea(s). Se eliminarán también.</p>` : ''}
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-custom'
      }
    });

    if (result.isConfirmed) {
      try {
        await areasDerechoService.delete(area.id);
        
        Swal.fire({
          icon: 'success',
          title: 'Área eliminada',
          text: 'El área ha sido eliminada correctamente',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-custom'
          }
        });

        loadAreas();
      } catch (error) {
        console.error('Error deleting area:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo eliminar el área',
          confirmButtonColor: '#e67e22'
        });
      }
    }
  };

  const handleCreateSubarea = (areaId) => {
    setSelectedAreaId(areaId);
    setSubareaToEdit(null);
    setShowSubareaModal(true);
  };

  const handleEditSubarea = (subarea, areaId) => {
    setSelectedAreaId(areaId);
    setSubareaToEdit(subarea);
    setShowSubareaModal(true);
  };

  const handleDeleteSubarea = async (subarea, areaName) => {
    const result = await Swal.fire({
      title: '¿Eliminar subárea?',
      html: `<p>¿Estás seguro de eliminar la subárea <strong>${subarea.nombre}</strong> del área <strong>${areaName}</strong>?</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-custom'
      }
    });

    if (result.isConfirmed) {
      try {
        await subareasDerechoService.delete(subarea.id);
        
        Swal.fire({
          icon: 'success',
          title: 'Subárea eliminada',
          text: 'La subárea ha sido eliminada correctamente',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-custom'
          }
        });

        loadAreas();
      } catch (error) {
        console.error('Error deleting subarea:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo eliminar la subárea',
          confirmButtonColor: '#e67e22'
        });
      }
    }
  };

  const handleAreaSaved = async (isEdit) => {
    setShowAreaModal(false);
    setAreaToEdit(null);
    
    const title = isEdit ? 'Área actualizada' : 'Área creada';
    const text = isEdit 
      ? 'El área ha sido actualizada correctamente' 
      : 'El área ha sido creada correctamente';

    Swal.fire({
      icon: 'success',
      title,
      text,
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: 'swal-custom'
      }
    });

    await loadAreas();
  };

  const handleSubareaSaved = async (isEdit) => {
    setShowSubareaModal(false);
    setSubareaToEdit(null);
    setSelectedAreaId(null);
    
    const title = isEdit ? 'Subárea actualizada' : 'Subárea creada';
    const text = isEdit 
      ? 'La subárea ha sido actualizada correctamente' 
      : 'La subárea ha sido creada correctamente';

    Swal.fire({
      icon: 'success',
      title,
      text,
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: 'swal-custom'
      }
    });

    await loadAreas();
  };

  const filteredAreas = areas.filter(area =>
    area.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.subareas?.some(subarea => 
      subarea.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="areas-subareas-container">
        <div className="loading-spinner">Cargando áreas de derecho...</div>
      </div>
    );
  }

  return (
    <div className="areas-subareas-container">
      <div className="areas-header">
        <div className="areas-header-top">
          <div>
            <h1>Áreas y Subáreas de Derecho</h1>
            <p className="areas-subtitle">Catálogo de especialidades jurídicas</p>
          </div>
          <button className="btn-primary" onClick={handleCreateArea}>
            <Plus size={20} />
            Nueva Área
          </button>
        </div>
        
        <div className="areas-search">
          <input
            type="text"
            placeholder="Buscar área o subárea..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredAreas.length === 0 ? (
        <div className="empty-state">
          <p>No se encontraron áreas de derecho</p>
          <button className="btn-primary" onClick={handleCreateArea}>
            <Plus size={20} />
            Crear primera área
          </button>
        </div>
      ) : (
        <div className="areas-grid">
          {filteredAreas.map((area) => (
            <div key={area.id} className={`area-card ${expandedAreas.has(area.id) ? 'expanded' : ''}`}>
              <div className="area-card-header">
                <div className="area-card-title">
                  <button
                    className="area-expand-btn"
                    onClick={() => toggleArea(area.id)}
                  >
                    {expandedAreas.has(area.id) ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                  <h3>{area.nombre}</h3>
                  <span className={`badge badge-${area.activo ? 'success' : 'inactive'}`}>
                    {area.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <div className="area-card-actions">
                  <span className="subarea-count">
                    {area.subareas?.length || 0} subárea{area.subareas?.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    className="btn-icon btn-icon-edit"
                    onClick={() => handleEditArea(area)}
                    title="Editar área"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn-icon btn-icon-danger"
                    onClick={() => handleDeleteArea(area)}
                    title="Eliminar área"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {expandedAreas.has(area.id) && (
                <div className="area-card-content">
                  <div className="subareas-header">
                    <h4>Subáreas</h4>
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => handleCreateSubarea(area.id)}
                    >
                      <Plus size={16} />
                      Agregar Subárea
                    </button>
                  </div>

                  {area.subareas && area.subareas.length > 0 ? (
                    <div className="subareas-list">
                      {area.subareas.map((subarea) => (
                        <div key={subarea.id} className="subarea-item">
                          <div className="subarea-info">
                            <span className="subarea-name">{subarea.nombre}</span>
                            <span className={`badge badge-sm badge-${subarea.activo ? 'success' : 'inactive'}`}>
                              {subarea.activo ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                          <div className="subarea-actions">
                            <button
                              className="btn-icon btn-icon-sm btn-icon-edit"
                              onClick={() => handleEditSubarea(subarea, area.id)}
                              title="Editar subárea"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn-icon btn-icon-sm btn-icon-danger"
                              onClick={() => handleDeleteSubarea(subarea, area.nombre)}
                              title="Eliminar subárea"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="subareas-empty">
                      <p>No hay subáreas en esta área</p>
                      <button
                        className="btn-link"
                        onClick={() => handleCreateSubarea(area.id)}
                      >
                        Agregar primera subárea
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAreaModal && (
        <AreaFormModal
          area={areaToEdit}
          onClose={() => {
            setShowAreaModal(false);
            setAreaToEdit(null);
          }}
          onSave={handleAreaSaved}
        />
      )}

      {showSubareaModal && (
        <SubareaFormModal
          subarea={subareaToEdit}
          areaId={selectedAreaId}
          areas={areas}
          onClose={() => {
            setShowSubareaModal(false);
            setSubareaToEdit(null);
            setSelectedAreaId(null);
          }}
          onSave={handleSubareaSaved}
        />
      )}
    </div>
  );
};

export default AreasSubareas;
