import { useState, useEffect, useRef } from 'react';
import { X, Search, Plus, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import expedientesService from '../../services/expedientesService';
import clientesService from '../../services/clientesService';
import usuariosService from '../../services/usuariosService';

const ExpedienteFormModal = ({ expediente, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    estatus: 'pendiente',
    clienteId: '',
    usuarioResponsableId: ''
  });

  const [isActivo, setIsActivo] = useState(false);
  const [usuariosAsignados, setUsuariosAsignados] = useState([]);
  const [usuariosAsignadosIniciales, setUsuariosAsignadosIniciales] = useState([]);
  const [todosUsuarios, setTodosUsuarios] = useState([]);

  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [clienteSearch, setClienteSearch] = useState('');
  const [usuarioSearch, setUsuarioSearch] = useState('');
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [showUsuarioDropdown, setShowUsuarioDropdown] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clienteDropdownRef = useRef(null);
  const usuarioDropdownRef = useRef(null);

  useEffect(() => {
    loadClientes();
    loadUsuarios();
    loadTodosUsuarios();

    if (expediente) {
      setFormData({
        titulo: expediente.titulo || '',
        estatus: expediente.estatus || 'pendiente',
        clienteId: expediente.clienteId || '',
        usuarioResponsableId: expediente.usuarioResponsableId || ''
      });

      setIsActivo(expediente.estatus === 'activo');

      if (expediente.cliente) {
        setSelectedCliente(expediente.cliente);
      }
      if (expediente.usuarioResponsable) {
        setSelectedUsuario(expediente.usuarioResponsable);
      }
      
      // Cargar usuarios asignados si existen
      if (expediente.usuariosAsignados && expediente.usuariosAsignados.length > 0) {
        const usuariosData = expediente.usuariosAsignados.map(ua => ({
          usuarioId: ua.usuarioId,
          usuario: ua.usuario,
          puedeEditar: ua.puedeEditar ?? true,
          puedeVerDocumentos: ua.puedeVerDocumentos ?? true,
          notas: ua.notas || ''
        }));
        setUsuariosAsignados(usuariosData);
        setUsuariosAsignadosIniciales(JSON.parse(JSON.stringify(usuariosData))); // Copia profunda
      }
    } else {
      // Reset para modo creación
      setIsActivo(false);
      setUsuariosAsignados([]);
      setUsuariosAsignadosIniciales([]);
    }
  }, [expediente]);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clienteDropdownRef.current && !clienteDropdownRef.current.contains(event.target)) {
        setShowClienteDropdown(false);
      }
      if (usuarioDropdownRef.current && !usuarioDropdownRef.current.contains(event.target)) {
        setShowUsuarioDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadClientes = async () => {
    try {
      const response = await clientesService.getAll(1, 100);
      const clientesData = response.data?.data || response.data || [];
      setClientes(clientesData.filter(c => c.activo));
    } catch (error) {
      console.error('Error loading clientes:', error);
    }
  };

  const loadUsuarios = async () => {
    try {
      const response = await usuariosService.getResponsables();
      // El endpoint ya filtra solo administradores y abogados activos
      const usuariosData = response.data || response || [];
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Error loading usuarios responsables:', error);
    }
  };

  const loadTodosUsuarios = async () => {
    try {
      const response = await usuariosService.getAll(1, 100);
      const usuariosData = response.data?.data || response.data || [];
      setTodosUsuarios(usuariosData.filter(u => u.activo));
    } catch (error) {
      console.error('Error loading todos los usuarios:', error);
    }
  };

  const getClienteNombre = (cliente) => {
    if (!cliente) return '';
    const { nombres, apellidoPaterno, apellidoMaterno } = cliente;
    return `${nombres} ${apellidoPaterno} ${apellidoMaterno || ''}`.trim();
  };

  const getUsuarioNombre = (usuario) => {
    if (!usuario) return '';
    const { nombres, apellidoPaterno, apellidoMaterno } = usuario;
    return `${nombres} ${apellidoPaterno} ${apellidoMaterno || ''}`.trim();
  };

  const filteredClientes = clientes.filter(cliente =>
    getClienteNombre(cliente).toLowerCase().includes(clienteSearch.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(clienteSearch.toLowerCase())
  );

  const filteredUsuarios = usuarios.filter(usuario =>
    getUsuarioNombre(usuario).toLowerCase().includes(usuarioSearch.toLowerCase()) ||
    usuario.email?.toLowerCase().includes(usuarioSearch.toLowerCase())
  );

  const handleClienteSelect = (cliente) => {
    setSelectedCliente(cliente);
    setFormData(prev => ({ ...prev, clienteId: cliente.id }));
    setClienteSearch('');
    setShowClienteDropdown(false);
    if (errors.clienteId) {
      setErrors(prev => ({ ...prev, clienteId: '' }));
    }
  };

  const handleUsuarioSelect = (usuario) => {
    setSelectedUsuario(usuario);
    setFormData(prev => ({ ...prev, usuarioResponsableId: usuario.id }));
    setUsuarioSearch('');
    setShowUsuarioDropdown(false);
    if (errors.usuarioResponsableId) {
      setErrors(prev => ({ ...prev, usuarioResponsableId: '' }));
    }
  };

  // Funciones para manejar usuarios asignados
  const agregarUsuarioAsignado = () => {
    setUsuariosAsignados(prev => [...prev, {
      usuarioId: '',
      usuario: null,
      puedeEditar: true,
      puedeVerDocumentos: true,
      notas: ''
    }]);
  };

  const eliminarUsuarioAsignado = (index) => {
    setUsuariosAsignados(prev => prev.filter((_, i) => i !== index));
  };

  const actualizarUsuarioAsignado = (index, field, value) => {
    setUsuariosAsignados(prev => prev.map((ua, i) => 
      i === index ? { ...ua, [field]: value } : ua
    ));
  };

  const seleccionarUsuarioAsignado = (index, usuario) => {
    setUsuariosAsignados(prev => prev.map((ua, i) => 
      i === index ? { ...ua, usuarioId: usuario.id, usuario } : ua
    ));
  };

  const getUsuariosDisponibles = (indexActual) => {
    const usuariosYaAsignados = usuariosAsignados
      .filter((_, i) => i !== indexActual)
      .map(ua => ua.usuarioId)
      .filter(id => id);
    
    return todosUsuarios.filter(u => !usuariosYaAsignados.includes(u.id));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    } else if (formData.titulo.length > 200) {
      newErrors.titulo = 'El título no puede exceder 200 caracteres';
    }

    if (!formData.clienteId) {
      newErrors.clienteId = 'Debes seleccionar un cliente';
    }

    if (!formData.usuarioResponsableId) {
      newErrors.usuarioResponsableId = 'Debes seleccionar un responsable';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await Swal.fire({
      title: expediente ? '¿Actualizar expediente?' : '¿Crear nuevo expediente?',
      html: `
        <p>¿Estás seguro de ${expediente ? 'actualizar' : 'crear'} el expediente?</p>
        <p><strong>${formData.titulo}</strong></p>
        <p>Estatus: ${isActivo ? 'Activo' : 'Pendiente'}</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e67e22',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: expediente ? 'Sí, actualizar' : 'Sí, crear',
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
      // Preparar datos con el estatus correcto
      const dataToSend = {
        ...formData,
        estatus: isActivo ? 'activo' : 'pendiente'
      };

      if (expediente) {
        // MODO EDICIÓN: Actualizar expediente y gestionar usuarios por separado
        await expedientesService.update(expediente.id, dataToSend);
        
        // Gestionar cambios en usuarios asignados
        await gestionarCambiosUsuarios(expediente.id);
      } else {
        // MODO CREACIÓN: Enviar usuarios en el DTO
        const usuariosValidos = usuariosAsignados
          .filter(ua => ua.usuarioId)
          .map(ua => ({
            usuarioId: ua.usuarioId,
            puedeEditar: ua.puedeEditar,
            puedeVerDocumentos: ua.puedeVerDocumentos,
            notas: ua.notas || null
          }));

        if (usuariosValidos.length > 0) {
          dataToSend.usuariosAsignados = usuariosValidos;
        }

        await expedientesService.create(dataToSend);
      }

      onSave(!!expediente);
    } catch (error) {
      console.error('Error saving expediente:', error);
      
      let errorMessage = 'Ocurrió un error al guardar el expediente';
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

  const gestionarCambiosUsuarios = async (expedienteId) => {
    // Usuarios actuales válidos
    const usuariosActuales = usuariosAsignados.filter(ua => ua.usuarioId);
    const usuariosInicialesIds = usuariosAsignadosIniciales.map(ua => ua.usuarioId);
    const usuariosActualesIds = usuariosActuales.map(ua => ua.usuarioId);

    // 1. Identificar usuarios eliminados
    const usuariosEliminados = usuariosAsignadosIniciales.filter(
      ui => !usuariosActualesIds.includes(ui.usuarioId)
    );

    // 2. Identificar usuarios nuevos
    const usuariosNuevos = usuariosActuales.filter(
      ua => !usuariosInicialesIds.includes(ua.usuarioId)
    );

    // 3. Identificar usuarios modificados
    const usuariosModificados = usuariosActuales.filter(ua => {
      const inicial = usuariosAsignadosIniciales.find(ui => ui.usuarioId === ua.usuarioId);
      if (!inicial) return false;
      
      return (
        inicial.puedeEditar !== ua.puedeEditar ||
        inicial.puedeVerDocumentos !== ua.puedeVerDocumentos ||
        inicial.notas !== ua.notas
      );
    });

    // Ejecutar cambios
    const promises = [];

    // Eliminar usuarios
    usuariosEliminados.forEach(usuario => {
      promises.push(
        expedientesService.removerUsuario(expedienteId, usuario.usuarioId)
      );
    });

    // Agregar usuarios nuevos
    usuariosNuevos.forEach(usuario => {
      promises.push(
        expedientesService.asignarUsuario(expedienteId, {
          usuarioId: usuario.usuarioId,
          puedeEditar: usuario.puedeEditar,
          puedeVerDocumentos: usuario.puedeVerDocumentos,
          notas: usuario.notas || null
        })
      );
    });

    // Actualizar permisos de usuarios modificados
    usuariosModificados.forEach(usuario => {
      promises.push(
        expedientesService.actualizarPermisosUsuario(expedienteId, usuario.usuarioId, {
          puedeEditar: usuario.puedeEditar,
          puedeVerDocumentos: usuario.puedeVerDocumentos,
          notas: usuario.notas || null
        })
      );
    });

    // Esperar todas las operaciones
    await Promise.all(promises);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{expediente ? 'Editar Expediente' : 'Nuevo Expediente'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="titulo">
                Título del Expediente <span className="required">*</span>
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className={errors.titulo ? 'error' : ''}
                placeholder="Ej: Juicio de Amparo - Empresa XYZ"
                disabled={isSubmitting}
              />
              {errors.titulo && <span className="error-message">{errors.titulo}</span>}
            </div>

            {/* Select2 para Cliente */}
            <div className="form-group">
              <label>
                Cliente <span className="required">*</span>
              </label>
              <div className="select2-container" ref={clienteDropdownRef}>
                <div
                  className={`select2-selection ${errors.clienteId ? 'error' : ''}`}
                  onClick={() => setShowClienteDropdown(!showClienteDropdown)}
                >
                  {selectedCliente ? (
                    <div className="selected-item">
                      <span className="selected-name">{getClienteNombre(selectedCliente)}</span>
                      <span className="selected-email">{selectedCliente.email}</span>
                    </div>
                  ) : (
                    <span className="placeholder">Buscar cliente...</span>
                  )}
                  <Search size={16} className="select2-icon" />
                </div>

                {showClienteDropdown && (
                  <div className="select2-dropdown">
                    <div className="select2-search">
                      <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={clienteSearch}
                        onChange={(e) => setClienteSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="select2-results">
                      {filteredClientes.length === 0 ? (
                        <div className="select2-no-results">No se encontraron clientes</div>
                      ) : (
                        filteredClientes.map((cliente) => (
                          <div
                            key={cliente.id}
                            className={`select2-result ${selectedCliente?.id === cliente.id ? 'selected' : ''}`}
                            onClick={() => handleClienteSelect(cliente)}
                          >
                            <div className="result-name">{getClienteNombre(cliente)}</div>
                            <div className="result-detail">{cliente.email}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.clienteId && <span className="error-message">{errors.clienteId}</span>}
            </div>

            {/* Select2 para Usuario Responsable */}
            <div className="form-group">
              <label>
                Usuario Responsable <span className="required">*</span>
              </label>
              <div className="select2-container" ref={usuarioDropdownRef}>
                <div
                  className={`select2-selection ${errors.usuarioResponsableId ? 'error' : ''}`}
                  onClick={() => setShowUsuarioDropdown(!showUsuarioDropdown)}
                >
                  {selectedUsuario ? (
                    <div className="selected-item">
                      <span className="selected-name">{getUsuarioNombre(selectedUsuario)}</span>
                      <span className="selected-email">{selectedUsuario.email}</span>
                    </div>
                  ) : (
                    <span className="placeholder">Buscar usuario...</span>
                  )}
                  <Search size={16} className="select2-icon" />
                </div>

                {showUsuarioDropdown && (
                  <div className="select2-dropdown">
                    <div className="select2-search">
                      <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={usuarioSearch}
                        onChange={(e) => setUsuarioSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="select2-results">
                      {filteredUsuarios.length === 0 ? (
                        <div className="select2-no-results">No se encontraron usuarios</div>
                      ) : (
                        filteredUsuarios.map((usuario) => (
                          <div
                            key={usuario.id}
                            className={`select2-result ${selectedUsuario?.id === usuario.id ? 'selected' : ''}`}
                            onClick={() => handleUsuarioSelect(usuario)}
                          >
                            <div className="result-name">{getUsuarioNombre(usuario)}</div>
                            <div className="result-detail">{usuario.email} - {usuario.tipoUsuario}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.usuarioResponsableId && <span className="error-message">{errors.usuarioResponsableId}</span>}
            </div>

            {/* Sección de Usuarios Asignados */}
            <div className="usuarios-asignados-section">
              <div className="section-header">
                <label>Usuarios Asignados al Expediente</label>
                <button
                  type="button"
                  className="btn-add-usuario"
                  onClick={agregarUsuarioAsignado}
                  disabled={isSubmitting}
                >
                  <Plus size={16} />
                  Agregar Usuario
                </button>
              </div>
              <small className="form-help">
                Asigna abogados o pasantes que trabajarán en este expediente
              </small>

              {usuariosAsignados.length > 0 && (
                <div className="usuarios-asignados-list">
                  {usuariosAsignados.map((ua, index) => (
                    <div key={index} className="usuario-asignado-item">
                      <div className="usuario-asignado-header">
                        <span className="usuario-numero">Usuario {index + 1}</span>
                        <button
                          type="button"
                          className="btn-remove-usuario"
                          onClick={() => eliminarUsuarioAsignado(index)}
                          disabled={isSubmitting}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="usuario-asignado-body">
                        <div className="form-group">
                          <label>Seleccionar Usuario</label>
                          <select
                            value={ua.usuarioId}
                            onChange={(e) => {
                              const usuarioSeleccionado = todosUsuarios.find(u => u.id === e.target.value);
                              if (usuarioSeleccionado) {
                                seleccionarUsuarioAsignado(index, usuarioSeleccionado);
                              }
                            }}
                            disabled={isSubmitting}
                            className="select-usuario-asignado"
                          >
                            <option value="">Selecciona un usuario...</option>
                            {getUsuariosDisponibles(index).map((usuario) => (
                              <option key={usuario.id} value={usuario.id}>
                                {getUsuarioNombre(usuario)} - {usuario.tipoUsuario}
                              </option>
                            ))}
                          </select>
                        </div>

                        {ua.usuarioId && (
                          <>
                            <div className="permisos-grid">
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={ua.puedeEditar}
                                  onChange={(e) => actualizarUsuarioAsignado(index, 'puedeEditar', e.target.checked)}
                                  disabled={isSubmitting}
                                />
                                <span>Puede editar el expediente</span>
                              </label>

                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={ua.puedeVerDocumentos}
                                  onChange={(e) => actualizarUsuarioAsignado(index, 'puedeVerDocumentos', e.target.checked)}
                                  disabled={isSubmitting}
                                />
                                <span>Puede ver documentos</span>
                              </label>
                            </div>

                            <div className="form-group">
                              <label>Notas (opcional)</label>
                              <textarea
                                value={ua.notas}
                                onChange={(e) => actualizarUsuarioAsignado(index, 'notas', e.target.value)}
                                placeholder="Responsabilidades, observaciones..."
                                disabled={isSubmitting}
                                rows="2"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="estatus-switch">
                Estatus del Expediente
              </label>
              <div className="switch-container">
                <label className="switch">
                  <input
                    type="checkbox"
                    id="estatus-switch"
                    checked={isActivo}
                    onChange={(e) => setIsActivo(e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <span className="slider"></span>
                </label>
                <span className="switch-label">
                  {isActivo ? 'Activo' : 'Pendiente'}
                </span>
              </div>
              <small className="form-help">
                Marca como activo si el expediente ya está en proceso, o déjalo como pendiente si aún no ha iniciado
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
              {isSubmitting ? 'Guardando...' : (expediente ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpedienteFormModal;
