import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX
} from 'lucide-react';
import Swal from 'sweetalert2';
import usuariosService from '../../services/usuariosService';
import UsuarioFormModal from './UsuarioFormModal';
import './Usuarios.css';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [usuarioToEdit, setUsuarioToEdit] = useState(null);

  useEffect(() => {
    loadUsuarios();
  }, [currentPage]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await usuariosService.getAll(currentPage, limit);
      
      const { data, meta } = response.data;
      
      setUsuarios(data);
      setTotal(meta.total);
      setTotalPages(meta.totalPages);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUsuario = async (usuarioData) => {
    // Si es edición
    if (usuarioToEdit) {
      const result = await Swal.fire({
        title: '¿Actualizar usuario?',
        text: `Se actualizarán los datos de: ${usuarioData.nombres} ${usuarioData.apellidoPaterno}`,
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
        await usuariosService.update(usuarioToEdit.id, usuarioData);
        setIsModalOpen(false);
        setUsuarioToEdit(null);
        
        await Swal.fire({
          title: '¡Usuario actualizado!',
          text: 'Los datos del usuario se han actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#e67e22',
          confirmButtonText: 'Aceptar',
          customClass: {
            popup: 'swal-custom',
          }
        });

        await loadUsuarios();
      } catch (err) {
        console.error('Error al actualizar usuario:', err);
        
        await Swal.fire({
          title: 'Error',
          text: err.response?.data?.message || 'No se pudo actualizar el usuario. Por favor, intente de nuevo.',
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
      title: '¿Crear nuevo usuario?',
      text: `Se creará el usuario: ${usuarioData.nombres} ${usuarioData.apellidoPaterno}`,
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
      await usuariosService.create(usuarioData);
      setIsModalOpen(false);
      
      await Swal.fire({
        title: '¡Usuario creado!',
        text: 'El usuario se ha registrado correctamente',
        icon: 'success',
        confirmButtonColor: '#e67e22',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'swal-custom',
        }
      });

      if (currentPage === 1) {
        await loadUsuarios();
      } else {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Error al crear usuario:', err);
      
      await Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || 'No se pudo crear el usuario. Por favor, intente de nuevo.',
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

  const handleEditUsuario = (usuario) => {
    setUsuarioToEdit(usuario);
    setIsModalOpen(true);
  };

  const handleDeleteUsuario = async (usuario) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      html: `Se eliminará el usuario:<br><strong>${usuario.nombres} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno || ''}</strong><br>Esta acción es reversible.`,
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
      const response = await usuariosService.delete(usuario.id);
      
      await Swal.fire({
        title: '¡Usuario eliminado!',
        text: response.data.message || 'El usuario se ha eliminado correctamente',
        icon: 'success',
        confirmButtonColor: '#e67e22',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'swal-custom',
        }
      });

      await loadUsuarios();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      
      await Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || 'No se pudo eliminar el usuario. Por favor, intente de nuevo.',
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
    setUsuarioToEdit(null);
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

  const getTipoUsuarioLabel = (tipo) => {
    const labels = {
      root: 'Root',
      administrador: 'Administrador',
      administrativo: 'Administrativo',
      abogado: 'Abogado',
      pasante: 'Pasante'
    };
    return labels[tipo] || tipo;
  };

  const filteredUsuarios = usuarios.filter(usuario => {
    const searchLower = searchTerm.toLowerCase();
    const nombreCompleto = `${usuario.nombres} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno || ''}`.toLowerCase();
    return nombreCompleto.includes(searchLower) || 
           usuario.email.toLowerCase().includes(searchLower) ||
           getTipoUsuarioLabel(usuario.tipoUsuario).toLowerCase().includes(searchLower);
  });

  return (
    <div className="usuarios-page">
      <div className="page-header">
        <div className="page-title-section">
          <h1>Usuarios</h1>
          <p>Gestión de usuarios del sistema</p>
        </div>
        <div className="page-actions">
          <button 
            className="btn-primary" 
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={20} />
            Nuevo Usuario
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
            placeholder="Buscar por nombre, email o tipo..."
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
              <h3>Cargando usuarios...</h3>
              <p>Por favor espera un momento</p>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <h3>No hay usuarios</h3>
              <p>
                {searchTerm 
                  ? 'No se encontraron usuarios con ese criterio de búsqueda'
                  : 'Comienza agregando tu primer usuario'}
              </p>
            </div>
          ) : (
            <>
              {/* Vista de tabla para pantallas grandes */}
              <table className="usuarios-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Fecha Nacimiento</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>
                        <div className="usuario-nombre">
                          {usuario.nombres} {usuario.apellidoPaterno} {usuario.apellidoMaterno}
                        </div>
                      </td>
                      <td>
                        <div className="usuario-email">{usuario.email}</div>
                      </td>
                      <td>
                        <span className={`badge badge-tipo badge-${usuario.tipoUsuario}`}>
                          {getTipoUsuarioLabel(usuario.tipoUsuario)}
                        </span>
                      </td>
                      <td>
                        <div>{new Date(usuario.fechaNacimiento).toLocaleDateString('es-MX')}</div>
                      </td>
                      <td>
                        <span className={`badge badge-${usuario.activo ? 'activo' : 'inactivo'}`}>
                          {usuario.activo ? (
                            <>
                              <UserCheck size={14} />
                              Activo
                            </>
                          ) : (
                            <>
                              <UserX size={14} />
                              Inactivo
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button 
                            className="btn-icon" 
                            title="Editar"
                            onClick={() => handleEditUsuario(usuario)}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="btn-icon btn-icon-danger" 
                            title="Eliminar"
                            onClick={() => handleDeleteUsuario(usuario)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Vista de tarjetas para dispositivos móviles */}
              <div className="usuarios-cards">
                {filteredUsuarios.map((usuario) => (
                  <div key={usuario.id} className="usuario-card">
                    <div className="card-header">
                      <div className="usuario-nombre">
                        {usuario.nombres} {usuario.apellidoPaterno} {usuario.apellidoMaterno}
                      </div>
                      <div className="card-badges">
                        <span className={`badge badge-tipo badge-${usuario.tipoUsuario}`}>
                          {getTipoUsuarioLabel(usuario.tipoUsuario)}
                        </span>
                        <span className={`badge badge-${usuario.activo ? 'activo' : 'inactivo'}`}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="card-info">
                        <strong>Email:</strong>
                        <span className="usuario-email">{usuario.email}</span>
                      </div>
                      <div className="card-info">
                        <strong>Fecha Nacimiento:</strong>
                        <span>{new Date(usuario.fechaNacimiento).toLocaleDateString('es-MX')}</span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button 
                        className="btn-icon" 
                        title="Editar"
                        onClick={() => handleEditUsuario(usuario)}
                      >
                        <Edit size={18} />
                        <span>Editar</span>
                      </button>
                      <button 
                        className="btn-icon btn-icon-danger" 
                        title="Eliminar"
                        onClick={() => handleDeleteUsuario(usuario)}
                      >
                        <Trash2 size={18} />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pagination">
                <div className="pagination-info">
                  Mostrando {((currentPage - 1) * limit) + 1} a {Math.min(currentPage * limit, total)} de {total} usuarios
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

      <UsuarioFormModal   
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateUsuario}
        loading={submitting}
        usuarioToEdit={usuarioToEdit}
      />
    </div>
  );
}

export default Usuarios;
