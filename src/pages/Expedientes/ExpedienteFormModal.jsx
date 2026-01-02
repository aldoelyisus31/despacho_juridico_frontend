import { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import expedientesService from '../../services/expedientesService';
import clientesService from '../../services/clientesService';
import usuariosService from '../../services/usuariosService';

const ExpedienteFormModal = ({ expediente, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    noSerie: '',
    fechaApertura: '',
    fechaCierre: '',
    estatus: 'pendiente',
    resultado: '',
    clienteId: '',
    usuarioResponsableId: ''
  });

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

    if (expediente) {
      setFormData({
        titulo: expediente.titulo || '',
        noSerie: expediente.noSerie || '',
        fechaApertura: expediente.fechaApertura ? expediente.fechaApertura.split('T')[0] : '',
        fechaCierre: expediente.fechaCierre ? expediente.fechaCierre.split('T')[0] : '',
        estatus: expediente.estatus || 'pendiente',
        resultado: expediente.resultado || '',
        clienteId: expediente.clienteId || '',
        usuarioResponsableId: expediente.usuarioResponsableId || ''
      });

      if (expediente.cliente) {
        setSelectedCliente(expediente.cliente);
      }
      if (expediente.usuarioResponsable) {
        setSelectedUsuario(expediente.usuarioResponsable);
      }
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
      const response = await usuariosService.getAll(1, 100);
      const usuariosData = response.data?.data || response.data || [];
      setUsuarios(usuariosData.filter(u => u.activo));
    } catch (error) {
      console.error('Error loading usuarios:', error);
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

    if (!formData.noSerie.trim()) {
      newErrors.noSerie = 'El número de serie es requerido';
    } else if (formData.noSerie.length > 100) {
      newErrors.noSerie = 'El número de serie no puede exceder 100 caracteres';
    }

    if (!formData.fechaApertura) {
      newErrors.fechaApertura = 'La fecha de apertura es requerida';
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
        <p><strong>${formData.noSerie}</strong></p>
        <p>${formData.titulo}</p>
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
      // Preparar datos - eliminar campos vacíos opcionales
      const dataToSend = { ...formData };
      if (!dataToSend.fechaCierre) delete dataToSend.fechaCierre;
      if (!dataToSend.resultado) delete dataToSend.resultado;

      if (expediente) {
        await expedientesService.update(expediente.id, dataToSend);
      } else {
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
            <div className="form-row">
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="noSerie">
                  Número de Serie <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="noSerie"
                  name="noSerie"
                  value={formData.noSerie}
                  onChange={handleChange}
                  className={errors.noSerie ? 'error' : ''}
                  placeholder="Ej: EXP-2026-001"
                  disabled={isSubmitting}
                />
                {errors.noSerie && <span className="error-message">{errors.noSerie}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="fechaApertura">
                  Fecha de Apertura <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="fechaApertura"
                  name="fechaApertura"
                  value={formData.fechaApertura}
                  onChange={handleChange}
                  className={errors.fechaApertura ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.fechaApertura && <span className="error-message">{errors.fechaApertura}</span>}
              </div>
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="estatus">Estatus</label>
                <select
                  id="estatus"
                  name="estatus"
                  value={formData.estatus}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="activo">Activo</option>
                  <option value="suspendido">Suspendido</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="fechaCierre">Fecha de Cierre</label>
                <input
                  type="date"
                  id="fechaCierre"
                  name="fechaCierre"
                  value={formData.fechaCierre}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="resultado">Resultado</label>
              <select
                id="resultado"
                name="resultado"
                value={formData.resultado}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Selecciona un resultado...</option>
                <option value="ganado">Ganado</option>
                <option value="perdido">Perdido</option>
              </select>
              <small className="form-help">
                El resultado solo aplica cuando el expediente está cerrado
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
