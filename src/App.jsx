import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Usuarios from './pages/Usuarios';
import AreasSubareas from './pages/AreasSubareas';
import Expedientes from './pages/Expedientes';
import ExpedienteDetalle from './pages/Expedientes/ExpedienteDetalle';
import Documentos from './pages/Documentos';
import Agenda from './pages/Agenda';
import Tareas from './pages/Tareas';
import Finanzas from './pages/Finanzas';
import Reportes from './pages/Reportes';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/areas-subareas" element={<AreasSubareas />} />
            <Route path="/expedientes" element={<Expedientes />} />
            <Route path="/expedientes/:id" element={<ExpedienteDetalle />} />
            <Route path="/documentos" element={<Documentos />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/tareas" element={<Tareas />} />
            <Route path="/finanzas" element={<Finanzas />} />
            <Route path="/reportes" element={<Reportes />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
