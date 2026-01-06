import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import expedientesService from '../../services/expedientesService';
import { comentariosExpedienteService } from '../../services/comentariosExpedienteService';
import './ExpedienteDetalle.css';

const ExpedienteDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [expediente, setExpediente] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [permisos, setPermisos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [comentarioEditando, setComentarioEditando] = useState(null);
  const [contenidoEditado, setContenidoEditado] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [expedienteData, comentariosData, permisosData] = await Promise.all([
        expedientesService.getById(id),
        comentariosExpedienteService.findAllByExpediente(id),
        expedientesService.getMisPermisos(id).catch(() => null) // Si falla, continuar sin permisos
      ]);
      const expedienteCompleto = expedienteData.data || expedienteData;
      setExpediente(expedienteCompleto);
      setPermisos(permisosData?.data || permisosData || null);
      setComentarios(comentariosData.data || comentariosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos del expediente');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    try {
      setGuardando(true);
      await comentariosExpedienteService.create(id, nuevoComentario);
      setNuevoComentario('');
      // Recargar comentarios
      const comentariosData = await comentariosExpedienteService.findAllByExpediente(id);
      setComentarios(comentariosData.data || comentariosData);
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      alert('Error al agregar el comentario');
    } finally {
      setGuardando(false);
    }
  };

  const handleEditarComentario = (comentario) => {
    setComentarioEditando(comentario.id);
    setContenidoEditado(comentario.contenido);
  };

  const handleCancelarEdicion = () => {
    setComentarioEditando(null);
    setContenidoEditado('');
  };

  const handleGuardarEdicion = async (comentarioId) => {
    if (!contenidoEditado.trim()) return;

    try {
      setGuardando(true);
      await comentariosExpedienteService.update(comentarioId, contenidoEditado);
      setComentarioEditando(null);
      setContenidoEditado('');
      // Recargar comentarios
      const comentariosData = await comentariosExpedienteService.findAllByExpediente(id);
      setComentarios(comentariosData.data || comentariosData);
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      alert('Error al actualizar el comentario');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarComentario = async (comentarioId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
      return;
    }

    try {
      await comentariosExpedienteService.remove(comentarioId);
      // Recargar comentarios
      const comentariosData = await comentariosExpedienteService.findAllByExpediente(id);
      setComentarios(comentariosData.data || comentariosData);
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      alert('Error al eliminar el comentario');
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearFechaCorta = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const obtenerNombreCompleto = (usuario) => {
    return `${usuario.nombres} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno || ''}`.trim();
  };

  if (loading) {
    return (
      <div className="expediente-detalle-container">
        <div className="loading-spinner">Cargando...</div>
      </div>
    );
  }

  if (!expediente) {
    return (
      <div className="expediente-detalle-container">
        <div className="loading-spinner">Expediente no encontrado</div>
      </div>
    );
  }

  return (
    <div className="expediente-detalle-container">
      <div className="detalle-header">
        <h2>Detalle del Expediente</h2>
        <button className="btn-volver" onClick={() => navigate('/expedientes')}>
          ← Volver a Expedientes
        </button>
      </div>

      <div className="detalle-content">
        {/* Información del expediente */}
        <div className="expediente-info-card">
          <h3>Información General</h3>

          <div className="info-section">
            <h4>Datos del Expediente</h4>
            <div className="info-grid">
              <div className="info-item">
                <label>No. de Serie</label>
                <div className="value">{expediente.noSerie}</div>
              </div>
              <div className="info-item">
                <label>Estado</label>
                <div className="value">
                  <span className={`estado-badge ${expediente.estado?.toLowerCase()}`}>
                    {expediente.estado}
                  </span>
                </div>
              </div>
              <div className="info-item full-width">
                <label>Título</label>
                <div className="value">{expediente.titulo}</div>
              </div>
              <div className="info-item full-width">
                <label>Descripción</label>
                <div className="value">{expediente.descripcion || <span className="empty">Sin descripción</span>}</div>
              </div>
              <div className="info-item">
                <label>Fecha de Apertura</label>
                <div className="value">{formatearFechaCorta(expediente.fechaApertura)}</div>
              </div>
              <div className="info-item">
                <label>Fecha de Cierre</label>
                <div className="value">
                  {expediente.fechaCierre ? formatearFechaCorta(expediente.fechaCierre) : <span className="empty">No cerrado</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h4>Cliente</h4>
            <div className="info-grid">
              <div className="info-item full-width">
                <label>Nombre</label>
                <div className="value">
                  {expediente.cliente ? 
                    `${expediente.cliente.nombres} ${expediente.cliente.apellidoPaterno} ${expediente.cliente.apellidoMaterno || ''}`.trim() 
                    : 'No asignado'}
                </div>
              </div>
              {expediente.cliente && (
                <>
                  <div className="info-item">
                    <label>Email</label>
                    <div className="value">{expediente.cliente.email || <span className="empty">No registrado</span>}</div>
                  </div>
                  <div className="info-item">
                    <label>Teléfono</label>
                    <div className="value">{expediente.cliente.telefono || <span className="empty">No registrado</span>}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="info-section">
            <h4>Usuario Responsable</h4>
            <div className="info-grid">
              <div className="info-item full-width">
                <label>Nombre</label>
                <div className="value">
                  {expediente.usuarioResponsable ? 
                    obtenerNombreCompleto(expediente.usuarioResponsable)
                    : 'No asignado'}
                </div>
              </div>
              {expediente.usuarioResponsable && (
                <>
                  <div className="info-item">
                    <label>Email</label>
                    <div className="value">{expediente.usuarioResponsable.email}</div>
                  </div>
                  <div className="info-item">
                    <label>Tipo</label>
                    <div className="value">{expediente.usuarioResponsable.tipoUsuario}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {expediente.usuariosAsignados && expediente.usuariosAsignados.length > 0 && (
            <div className="info-section">
              <h4>Usuarios Asignados ({expediente.usuariosAsignados.length})</h4>
              <div className="usuarios-list">
                {expediente.usuariosAsignados.map((asignacion) => (
                  <div key={asignacion.id} className="usuario-item">
                    <div>{obtenerNombreCompleto(asignacion.usuario)}</div>
                    <div className="permisos">
                      {asignacion.puedeEditar && '✓ Puede editar '}
                      {asignacion.puedeVerDocumentos && '✓ Puede ver documentos '}
                      {asignacion.puedeComentarios && '✓ Puede comentar'}
                    </div>
                    {asignacion.notas && (
                      <div className="permisos" style={{ marginTop: '4px' }}>
                        Notas: {asignacion.notas}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bitácora de comentarios */}
        <div className="bitacora-card">
          <h3>Bitácora de Comentarios</h3>

          {/* Formulario para nuevo comentario - Si es admin/administrativo/root o tiene permiso */}
          {(usuario?.tipoUsuario === 'administrador' || 
            usuario?.tipoUsuario === 'administrativo' || 
            usuario?.tipoUsuario === 'root' ||
            (permisos && permisos.puedeComentarios)) && (
            <div className="nuevo-comentario-form">
              <h4>Agregar Comentario</h4>
              <form onSubmit={handleAgregarComentario}>
                <div className="comentario-input-wrapper">
                  <textarea
                    className="comentario-textarea"
                    placeholder="Escribe un comentario sobre el expediente..."
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    disabled={guardando}
                  />
                  <button
                    type="submit"
                    className="btn-agregar-comentario"
                    disabled={guardando || !nuevoComentario.trim()}
                  >
                    {guardando ? 'Guardando...' : 'Agregar Comentario'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de comentarios */}
          <div className="comentarios-lista">
            {comentarios.length === 0 ? (
              <div className="comentarios-empty">
                No hay comentarios aún. Sé el primero en agregar uno.
              </div>
            ) : (
              comentarios.map((comentario) => (
                <div
                  key={comentario.id}
                  className={`comentario-item ${comentarioEditando === comentario.id ? 'editando' : ''}`}
                >
                  <div className="comentario-header">
                    <div className="comentario-autor-info">
                      <div className="comentario-autor">
                        {obtenerNombreCompleto(comentario.creadoPor)}
                      </div>
                      <div className="comentario-fecha">
                        {formatearFecha(comentario.createdAt)}
                      </div>
                      {comentario.editadoPor && (
                        <div className="comentario-editado">
                          Editado por {obtenerNombreCompleto(comentario.editadoPor)} el {formatearFecha(comentario.updatedAt)}
                        </div>
                      )}
                    </div>
                    {/* Mostrar botones si es admin/administrativo/root o tiene permiso */}
                    {comentarioEditando !== comentario.id && 
                     (usuario?.tipoUsuario === 'administrador' || 
                      usuario?.tipoUsuario === 'administrativo' || 
                      usuario?.tipoUsuario === 'root' ||
                      (permisos && permisos.puedeComentarios)) && (
                      <div className="comentario-acciones">
                        <button
                          className="btn-icon editar"
                          onClick={() => handleEditarComentario(comentario)}
                          title="Editar comentario"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon eliminar"
                          onClick={() => handleEliminarComentario(comentario.id)}
                          title="Eliminar comentario"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>

                  {comentarioEditando === comentario.id ? (
                    <div className="comentario-edit-form">
                      <textarea
                        className="comentario-edit-textarea"
                        value={contenidoEditado}
                        onChange={(e) => setContenidoEditado(e.target.value)}
                        disabled={guardando}
                      />
                      <div className="comentario-edit-actions">
                        <button
                          className="btn-cancelar"
                          onClick={handleCancelarEdicion}
                          disabled={guardando}
                        >
                          Cancelar
                        </button>
                        <button
                          className="btn-guardar"
                          onClick={() => handleGuardarEdicion(comentario.id)}
                          disabled={guardando || !contenidoEditado.trim()}
                        >
                          {guardando ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="comentario-contenido">
                      {comentario.contenido}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpedienteDetalle;
