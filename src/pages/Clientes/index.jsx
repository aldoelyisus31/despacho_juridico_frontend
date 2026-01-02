import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';
import clientesService from '../../services/clientesService';
import ClienteFormModal from './ClienteFormModal';
import './Clientes.css';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [clienteToEdit, setClienteToEdit] = useState(null);

  useEffect(() => {
    loadClientes();
  }, [currentPage]);

  const loadClientes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clientesService.getAll(currentPage, limit);
      
      // El backend devuelve { data: { data: [...], meta: {...} } }
      const { data, meta } = response.data;
      
      setClientes(data);
      setTotal(meta.total);
      setTotalPages(meta.totalPages);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCliente = async (clienteData) => {
    // Si es edición
    if (clienteToEdit) {
      const result = await Swal.fire({
        title: '¿Actualizar cliente?',
        text: `Se actualizarán los datos de: ${clienteData.nombres} ${clienteData.apellidoPaterno}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#e67e22',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar',
        customClass: {
          popup: 'swal-custom',
        }
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        setSubmitting(true);
        await clientesService.update(clienteToEdit.id, clienteData);
        setIsModalOpen(false);
        setClienteToEdit(null);
        
        await Swal.fire({
          title: '¡Cliente actualizado!',
          text: 'Los datos del cliente se han actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#e67e22',
          confirmButtonText: 'Aceptar',
          customClass: {
            popup: 'swal-custom',
          }
        });

        await loadClientes();
      } catch (err) {
        console.error('Error al actualizar cliente:', err);
        
        await Swal.fire({
          title: 'Error',
          text: err.message || 'No se pudo actualizar el cliente. Por favor, intente de nuevo.',
          icon: 'error',
          confirmButtonColor: '#e67e22',
          confirmButtonText: 'Aceptar',
          customClass: {
            popup: 'swal-custom',
          }
        });
        
        throw err;
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Si es creación
    const result = await Swal.fire({
      title: '¿Crear nuevo cliente?',
      text: `Se creará el cliente: ${clienteData.nombres} ${clienteData.apellidoPaterno}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e67e22',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-custom',
      }
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setSubmitting(true);
      await clientesService.create(clienteData);
      setIsModalOpen(false);
      
      await Swal.fire({
        title: '¡Cliente creado!',
        text: 'El cliente se ha registrado correctamente',
        icon: 'success',
        confirmButtonColor: '#e67e22',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'swal-custom',
        }
      });

      if (currentPage === 1) {
        await loadClientes();
      } else {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Error al crear cliente:', err);
      
      await Swal.fire({
        title: 'Error',
        text: err.message || 'No se pudo crear el cliente. Por favor, intente de nuevo.',
        icon: 'error',
        confirmButtonColor: '#e67e22',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'swal-custom',
        }
      });
      
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCliente = (cliente) => {
    setClienteToEdit(cliente);
    setIsModalOpen(true);
  };

  const handleDeleteCliente = async (cliente) => {
    const result = await Swal.fire({
      title: '¿Eliminar cliente?',
      html: `Se eliminará el cliente:<br><strong>${cliente.nombres} ${cliente.apellidoPaterno} ${cliente.apellidoMaterno || ''}</strong><br>Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-custom',
      }
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await clientesService.delete(cliente.id);
      
      await Swal.fire({
        title: '¡Cliente eliminado!',
        text: response.data.message || 'El cliente se ha eliminado correctamente',
        icon: 'success',
        confirmButtonColor: '#e67e22',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'swal-custom',
        }
      });

      await loadClientes();
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      
      await Swal.fire({
        title: 'Error',
        text: err.message || 'No se pudo eliminar el cliente. Por favor, intente de nuevo.',
        icon: 'error',
        confirmButtonColor: '#e67e22',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'swal-custom',
        }
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setClienteToEdit(null);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const filteredClientes = clientes.filter(cliente => {
    const searchLower = searchTerm.toLowerCase();
    const nombreCompleto = `${cliente.nombres} ${cliente.apellidoPaterno} ${cliente.apellidoMaterno || ''}`.toLowerCase();
    return nombreCompleto.includes(searchLower) || 
           cliente.email.toLowerCase().includes(searchLower) ||
           cliente.celular.includes(searchTerm);
  });

  return (
    <div className="clientes-page">
      <div className="page-header">
        <div className="page-title-section">
          <h1>Clientes</h1>
          <p>Gestión de clientes del despacho</p>
        </div>
        <div className="page-actions">
          <button 
            className="btn-primary" 
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={20} />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o celular..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-state">
              <Users size={48} />
              <h3>Cargando clientes...</h3>
              <p>Por favor espera un momento</p>
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <h3>No hay clientes</h3>
              <p>
                {searchTerm 
                  ? 'No se encontraron clientes con ese criterio de búsqueda'
                  : 'Comienza agregando tu primer cliente'}
              </p>
            </div>
          ) : (
            <>
              <table className="clientes-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Contacto</th>
                    <th>Dirección</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>
                        <div className="cliente-nombre">
                          {cliente.nombres} {cliente.apellidoPaterno} {cliente.apellidoMaterno}
                        </div>
                      </td>
                      <td>
                        <div>{cliente.celular}</div>
                        <div className="cliente-email">{cliente.email}</div>
                      </td>
                      <td>
                        <div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cliente.direccion}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${cliente.tipo}`}>
                          {cliente.tipo === 'particular' ? 'Particular' : 'Empresa'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${cliente.activo ? 'activo' : 'inactivo'}`}>
                          {cliente.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn-icon" title="Ver detalles">
                            <Eye size={18} />
                          </button>
                          <button 
                            className="btn-icon" 
                            title="Editar"
                            onClick={() => handleEditCliente(cliente)}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="btn-icon btn-icon-danger" 
                            title="Eliminar"
                            onClick={() => handleDeleteCliente(cliente)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination">
                <div className="pagination-info">
                  Mostrando {((currentPage - 1) * limit) + 1} a {Math.min(currentPage * limit, total)} de {total} clientes
                </div>
                <div className="pagination-controls">
                  <button
                    className="btn-pagination"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={18} />
                    Anterior
                  </button>
                  
                  <div className="page-numbers">
                    {getVisiblePages().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="page-number" style={{ cursor: 'default', border: 'none' }}>
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          className={`page-number ${currentPage === page ? 'active' : ''}`}
                          onClick={() => handlePageClick(page)}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  <button
                    className="btn-pagination"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ClienteFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateCliente}
        loading={submitting}
        clienteToEdit={clienteToEdit}
      />
    </div>
  );
}

export default Clientes;
