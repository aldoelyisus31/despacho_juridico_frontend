import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, usuario } = useAuth();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (usuario) {
      console.log('Usuario detectado, redirigiendo al dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [usuario, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      console.log('Resultado del login:', result);
      
      if (result.success) {
        setError('');
        console.log('Login exitoso, redirigiendo...');
        navigate('/dashboard', { replace: true });
      } else {
        console.log('Login fallido:', result.error);
        setError(result.error);
      }
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Scale className="login-icon" size={48} strokeWidth={1.5} />
          <h1 className="login-title">Sistema Jurídico</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@despacho.com"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
              minLength={8}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
