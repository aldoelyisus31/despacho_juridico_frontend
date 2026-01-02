import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, FileText, User, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';
import expedientesService from '../../services/expedientesService';
import ExpedienteFormModal from './ExpedienteFormModal';
import './Expedientes.css';

const Expedientes = () => {
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expedienteToEdit, setExpedienteToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExpedientes, setTotalExpedientes] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    loadExpedientes();
  }, [currentPage]);

  const loadExpedientes = async () => {
    try {
      setLoading(true);
      const response = await expedientesService.getAll(currentPage, itemsPerPage);
      
      // Manejar estructura envuelta del backend
      const expedientesData = response.data?.data || response.data || [];
      const meta = response.data?.meta || response.meta || {};
      
      setExpedientes(expedientesData);
      setTotalPages(meta.totalPages || 1);
      setTotalExpedientes(meta.total || 0);
    } catch (error) {
      console.error('Error loading expedientes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los expedientes',
        confirmButtonColor: '#e67e22'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setExpedienteToEdit(null);
    setShowModal(true);
  };

  const handleEdit = (expediente) => {
    setExpedienteToEdit(expediente);
    setShowModal(true);
  };

  const handleDelete = async (expediente) => {
    const result = await Swal.fire({
      title: '¿Eliminar expediente?',
      html: `
        <p>¿Estás seguro de eliminar el expediente:</p>
        <p><strong>${expediente.noSerie}</strong></p>
        <p>${expediente.titulo}</p>
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
        await expedientesService.delete(expediente.id);
        
        Swal.fire({
          icon: 'success',
          title: 'Expediente eliminado',
          text: 'El expediente ha sido eliminado correctamente',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-custom'
          }
        });

        loadExpedientes();
      } catch (error) {
        console.error('Error deleting expediente:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo eliminar el expediente',
          confirmButtonColor: '#e67e22'
        });
      }
    }
  };

  const handleSaved = async (isEdit) => {
    setShowModal(false);
    setExpedienteToEdit(null);
    
    const title = isEdit ? 'Expediente actualizado' : 'Expediente creado';
    const text = isEdit 
      ? 'El expediente ha sido actualizado correctamente' 
      : 'El expediente ha sido creado correctamente';

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

    await loadExpedientes();
  };

  const getEstatusClass = (estatus) => {
    const classes = {
      pendiente: 'badge-warning',
      activo: 'badge-success',
      suspendido: 'badge-secondary',
      cancelado: 'badge-danger',
      cerrado: 'badge-info'
    };
    return classes[estatus] || 'badge-secondary';
  };

  const getEstatusLabel = (estatus) => {
    const labels = {
      pendiente: 'Pendiente',
      activo: 'Activo',
      suspendido: 'Suspendido',
      cancelado: 'Cancelado',
      cerrado: 'Cerrado'
    };
    return labels[estatus] || estatus;
  };

  const getResultadoClass = (resultado) => {
    if (!resultado) return '';
    return resultado === 'ganado' ? 'badge-success' : 'badge-danger';
  };

  const getResultadoLabel = (resultado) => {
    if (!resultado) return '-';
    return resultado === 'ganado' ? 'Ganado' : 'Perdido';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getClienteNombre = (expediente) => {
    if (!expediente.cliente) return 'N/A';
    const { nombres, apellidoPaterno, apellidoMaterno } = expediente.cliente;
    return `${nombres} ${apellidoPaterno} ${apellidoMaterno || ''}`.trim();
  };

  const getResponsableNombre = (expediente) => {
    if (!expediente.usuarioResponsable) return 'N/A';
    const { nombres, apellidoPaterno, apellidoMaterno } = expediente.usuarioResponsable;
    return `${nombres} ${apellidoPaterno} ${apellidoMaterno || ''}`.trim();
  };

  const filteredExpedientes = expedientes.filter(exp =>
    exp.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.noSerie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClienteNombre(exp).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getResponsableNombre(exp).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (loading) {
    return (
      <div className="expedientes-container">
        <div className="loading-spinner">Cargando expedientes...</div>
      </div>
    );
  }

  return (
    <div className="expedientes-container">
      <div className="expedientes-header">
        <div>
          <h1>Expedientes</h1>
          <p className="expedientes-subtitle">
            Total: {totalExpedientes} expediente{totalExpedientes !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <Plus size={20} />
          Nuevo Expediente
        </button>
      </div>

      <div className="expedientes-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por título, serie, cliente o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredExpedientes.length === 0 ? (
        <div className="empty-state">
          <FileText size={64} className="empty-icon" />
          <p>No se encontraron expedientes</p>
          <button className="btn-primary" onClick={handleCreate}>
            <Plus size={20} />
            Crear primer expediente
          </button>
        </div>
      ) : (
        <>
          <div className="expedientes-table-container">
            <table className="expedientes-table">
              <thead>
                <tr>
                  <th>No. Serie</th>
                  <th>Título</th>
                  <th>Cliente</th>
                  <th>Responsable</th>
                  <th>Fecha Apertura</th>
                  <th>Estatus</th>
                  <th>Resultado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpedientes.map((expediente) => (
                  <tr key={expediente.id}>
                    <td>
                      <span className="expediente-serie">{expediente.noSerie}</span>
                    </td>
                    <td>
                      <div className="expediente-titulo">
                        {expediente.titulo}
                      </div>
                    </td>
                    <td>
                      <div className="expediente-persona">
                        <User size={14} />
                        <span>{getClienteNombre(expediente)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="expediente-persona">
                        <User size={14} />
                        <span>{getResponsableNombre(expediente)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="expediente-fecha">
                        <Calendar size={14} />
                        <span>{formatDate(expediente.fechaApertura)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getEstatusClass(expediente.estatus)}`}>
                        {getEstatusLabel(expediente.estatus)}
                      </span>
                    </td>
                    <td>
                      {expediente.resultado && (
                        <span className={`badge ${getResultadoClass(expediente.resultado)}`}>
                          {getResultadoLabel(expediente.resultado)}
                        </span>
                      )}
                      {!expediente.resultado && <span className="text-muted">-</span>}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-icon btn-icon-edit"
                          onClick={() => handleEdit(expediente)}
                          title="Editar expediente"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-icon-danger"
                          onClick={() => handleDelete(expediente)}
                          title="Eliminar expediente"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Anterior
              </button>

              {getVisiblePages().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  className={`pagination-button ${
                    page === currentPage ? 'active' : ''
                  } ${page === '...' ? 'dots' : ''}`}
                  disabled={page === '...'}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <ExpedienteFormModal
          expediente={expedienteToEdit}
          onClose={() => {
            setShowModal(false);
            setExpedienteToEdit(null);
          }}
          onSave={handleSaved}
        />
      )}
    </div>
  );
};

export default Expedientes;
